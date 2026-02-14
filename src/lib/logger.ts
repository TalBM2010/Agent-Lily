import pino from "pino";

function serializeError(error: unknown): Record<string, unknown> {
  if (!(error instanceof Error)) {
    return { value: error };
  }
  const serialized: Record<string, unknown> = {
    message: error.message,
    name: error.name,
    stack: error.stack,
  };
  // Prisma errors carry code, meta, and clientVersion
  if ("code" in error) serialized.code = error.code;
  if ("meta" in error) serialized.meta = error.meta;
  if ("clientVersion" in error) serialized.clientVersion = error.clientVersion;
  return serialized;
}

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  serializers: {
    error: serializeError,
  },
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino-pretty", options: { colorize: true } }
      : undefined,
});
