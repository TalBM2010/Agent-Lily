export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class AIError extends AppError {
  constructor(message: string) {
    super(message, "AI_ERROR", 502);
    this.name = "AIError";
  }
}

export class SpeechError extends AppError {
  constructor(message: string) {
    super(message, "SPEECH_ERROR", 502);
    this.name = "SpeechError";
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, "DATABASE_ERROR", 500);
    this.name = "DatabaseError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export function toApiError(error: unknown): {
  code: string;
  message: string;
  statusCode: number;
} {
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
  }
  return { code: "INTERNAL_ERROR", message: "Something went wrong", statusCode: 500 };
}
