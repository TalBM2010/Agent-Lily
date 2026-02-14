import { prisma } from "@/lib/db";
import { anthropic } from "@/lib/ai";
import { logger } from "@/lib/logger";

type ConnectionStatus = {
  status: "ok" | "error";
  latencyMs: number;
  error?: string;
};

export type HealthCheckResult = {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  connections: {
    database: ConnectionStatus;
    anthropic: ConnectionStatus;
    elevenlabs: ConnectionStatus;
    deepgram: ConnectionStatus;
  };
};

async function checkDatabase(): Promise<ConnectionStatus> {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown database error";
    logger.error({ error }, "Health check: database connection failed");
    return { status: "error", latencyMs: Date.now() - start, error: message };
  }
}

async function checkAnthropic(): Promise<ConnectionStatus> {
  const start = Date.now();
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return {
        status: "error",
        latencyMs: 0,
        error: "ANTHROPIC_API_KEY not configured",
      };
    }
    await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 5,
      messages: [{ role: "user", content: "hi" }],
    });
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Anthropic error";
    logger.error({ error }, "Health check: Anthropic connection failed");
    return { status: "error", latencyMs: Date.now() - start, error: message };
  }
}

async function checkElevenLabs(): Promise<ConnectionStatus> {
  const start = Date.now();
  try {
    if (!process.env.ELEVENLABS_API_KEY) {
      return {
        status: "error",
        latencyMs: 0,
        error: "ELEVENLABS_API_KEY not configured",
      };
    }
    const response = await fetch("https://api.elevenlabs.io/v1/voices", {
      method: "GET",
      headers: { "xi-api-key": process.env.ELEVENLABS_API_KEY },
    });
    if (!response.ok) {
      return {
        status: "error",
        latencyMs: Date.now() - start,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown ElevenLabs error";
    logger.error({ error }, "Health check: ElevenLabs connection failed");
    return { status: "error", latencyMs: Date.now() - start, error: message };
  }
}

async function checkDeepgram(): Promise<ConnectionStatus> {
  const start = Date.now();
  try {
    if (!process.env.DEEPGRAM_API_KEY) {
      return {
        status: "error",
        latencyMs: 0,
        error: "DEEPGRAM_API_KEY not configured",
      };
    }
    const response = await fetch("https://api.deepgram.com/v1/projects", {
      method: "GET",
      headers: { Authorization: `Token ${process.env.DEEPGRAM_API_KEY}` },
    });
    if (!response.ok) {
      return {
        status: "error",
        latencyMs: Date.now() - start,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    return { status: "ok", latencyMs: Date.now() - start };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown Deepgram error";
    logger.error({ error }, "Health check: Deepgram connection failed");
    return { status: "error", latencyMs: Date.now() - start, error: message };
  }
}

export async function runHealthCheck(): Promise<HealthCheckResult> {
  const [database, anthropicResult, elevenlabs, deepgram] = await Promise.all([
    checkDatabase(),
    checkAnthropic(),
    checkElevenLabs(),
    checkDeepgram(),
  ]);

  const connections = {
    database,
    anthropic: anthropicResult,
    elevenlabs,
    deepgram,
  };

  const statuses = Object.values(connections).map((c) => c.status);
  const failCount = statuses.filter((s) => s === "error").length;

  let status: HealthCheckResult["status"];
  if (failCount === 0) {
    status = "healthy";
  } else if (failCount < statuses.length) {
    status = "degraded";
  } else {
    status = "unhealthy";
  }

  return { status, timestamp: new Date().toISOString(), connections };
}
