import { NextResponse } from "next/server";
import { runHealthCheck } from "@/services/health-check";
import { logger } from "@/lib/logger";

export async function GET() {
  try {
    const result = await runHealthCheck();

    logger.info(
      { status: result.status, connections: result.connections },
      "Health check completed"
    );

    const httpStatus = result.status === "healthy" ? 200 : 503;
    return NextResponse.json(result, { status: httpStatus });
  } catch (error) {
    logger.error({ error }, "Health check failed unexpectedly");
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: "Health check failed to execute",
      },
      { status: 503 }
    );
  }
}
