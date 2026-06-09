import type { HttpResponseInit } from "@azure/functions";
import type { ErrorCode } from "../../../shared/types/api.js";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super("VALIDATION_ERROR", message, 422, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super("NOT_FOUND", message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super("CONFLICT", message, 409);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Authentication required") {
    super("UNAUTHORIZED", message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Access denied") {
    super("FORBIDDEN", message, 403);
  }
}

export function handleError(err: unknown): HttpResponseInit {
  if (err instanceof AppError) {
    return {
      status: err.statusCode,
      jsonBody: {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details !== undefined && { details: err.details }),
        },
      },
    };
  }

  return {
    status: 500,
    jsonBody: {
      error: {
        code: "INTERNAL_ERROR" as ErrorCode,
        message: "An unexpected error occurred",
      },
    },
  };
}
