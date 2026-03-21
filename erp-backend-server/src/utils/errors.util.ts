import { HTTP_STATUS, ERROR_CODES, type HttpStatus, type ErrorCode } from "@/constants/index.js";

// ---------------------------------------------------------------------------
// AppError — base class for all known, expected errors in the application.
//
// Throwing an AppError from anywhere in the call stack (service, middleware,
// controller) will be caught by the global error handler and serialised into
// the standard error response shape. Throwing a plain Error, by contrast,
// results in a 500 Internal Server Error with a generic message.
//
// Usage:
//   throw new AppError("User not found", HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
// ---------------------------------------------------------------------------
export class AppError extends Error {
  public readonly statusCode: HttpStatus;
  public readonly code: ErrorCode | string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: HttpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: ErrorCode | string = ERROR_CODES.INTERNAL_ERROR,
    details?: unknown
  ) {
    super(message);

    // Restore prototype chain (required when extending built-ins in TS).
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // Operational errors are expected failures (validation, not found, etc.).
    // Programming errors (bugs) are not operational and always get a 500.
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// ---------------------------------------------------------------------------
// Concrete error subclasses — use these instead of AppError directly so
// callers don't have to pass status codes and error codes every time.
// ---------------------------------------------------------------------------

/** 400 — The request body/params/query failed validation. */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, HTTP_STATUS.BAD_REQUEST, ERROR_CODES.VALIDATION_ERROR, details);
  }
}

/** 401 — No valid access token was provided. */
export class UnauthorizedError extends AppError {
  constructor(
    message = "Authentication required",
    code: ErrorCode = ERROR_CODES.TOKEN_MISSING
  ) {
    super(message, HTTP_STATUS.UNAUTHORIZED, code);
  }
}

/** 403 — Authenticated but not allowed to perform this action. */
export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.INSUFFICIENT_PERMISSIONS);
  }
}

/** 404 — Requested resource does not exist. */
export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, ERROR_CODES.NOT_FOUND);
  }
}

/** 409 — Resource already exists (duplicate). */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, HTTP_STATUS.CONFLICT, ERROR_CODES.ALREADY_EXISTS);
  }
}

/** 429 — Rate limit exceeded. */
export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Please try again later.") {
    super(message, HTTP_STATUS.TOO_MANY_REQUESTS, ERROR_CODES.RATE_LIMIT_EXCEEDED);
  }
}

/** 403 — User belongs to a different company (multi-tenancy violation). */
export class TenantMismatchError extends AppError {
  constructor() {
    super(
      "You do not have access to this resource",
      HTTP_STATUS.FORBIDDEN,
      ERROR_CODES.TENANT_MISMATCH
    );
  }
}
