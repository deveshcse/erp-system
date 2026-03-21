import { type Request, type Response, type NextFunction } from "express";
import mongoose from "mongoose";
import { AppError } from "@/utils/errors.util.js";
import { sendError } from "@/utils/response.util.js";
import { logger } from "@/config/logger.js";
import {
  HTTP_STATUS,
  ERROR_CODES,
} from "@/constants/index.js";

// ---------------------------------------------------------------------------
// errorHandler
//
// The ONLY place in the application where errors are serialised into HTTP
// responses. Every other layer (services, controllers, middleware) throws
// an error — it propagates up to here.
//
// Handles:
//   - AppError subclasses (our own typed, operational errors)
//   - Mongoose ValidationError (schema-level validation failures)
//   - Mongoose CastError (invalid ObjectId in params)
//   - Mongoose duplicate key error (code 11000)
//   - JWT errors (already converted to AppError by token util, but guarded)
//   - Unknown errors (programming errors, unexpected failures)
//
// Must be registered as the LAST middleware in Express with four parameters.
// ---------------------------------------------------------------------------
export function errorHandler(
  error: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── 1. Our own operational errors ────────────────────────────────────────
  if (error instanceof AppError) {
    // Log 5xx errors as error, 4xx as warn (they're expected client mistakes).
    if (error.statusCode >= 500) {
      logger.error(
        { err: error, req: { method: req.method, url: req.url } },
        error.message
      );
    } else {
      logger.warn(
        { code: error.code, req: { method: req.method, url: req.url } },
        error.message
      );
    }

    sendError(res, error.code, error.message, error.statusCode, error.details);
    return;
  }

  // ── 2. Mongoose document validation errors ────────────────────────────────
  if (error instanceof mongoose.Error.ValidationError) {
    const details = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));

    logger.warn({ details }, "Mongoose validation error");

    sendError(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      "Document validation failed",
      HTTP_STATUS.BAD_REQUEST,
      details
    );
    return;
  }

  // ── 3. Mongoose CastError — usually an invalid ObjectId in URL params ─────
  if (error instanceof mongoose.Error.CastError) {
    logger.warn({ path: error.path, value: error.value }, "Mongoose cast error");

    sendError(
      res,
      ERROR_CODES.VALIDATION_ERROR,
      `Invalid value for field '${error.path}'`,
      HTTP_STATUS.BAD_REQUEST
    );
    return;
  }

  // ── 4. MongoDB duplicate key error ────────────────────────────────────────
  if (isMongooseDuplicateKeyError(error)) {
    const field = extractDuplicateKeyField(error);
    logger.warn({ field }, "MongoDB duplicate key error");

    sendError(
      res,
      ERROR_CODES.ALREADY_EXISTS,
      `A record with this ${field} already exists`,
      HTTP_STATUS.CONFLICT
    );
    return;
  }

  // ── 5. Unknown / programming errors ──────────────────────────────────────
  // These are bugs — log the full error with stack trace.
  logger.error(
    {
      err: error,
      req: { method: req.method, url: req.url, body: req.body },
    },
    "Unhandled error"
  );

  sendError(
    res,
    ERROR_CODES.INTERNAL_ERROR,
    "An unexpected error occurred. Please try again later.",
    HTTP_STATUS.INTERNAL_SERVER_ERROR
  );
}

// ---------------------------------------------------------------------------
// notFoundHandler
//
// Catches requests that didn't match any route and converts them to a
// standard 404 response. Register this BEFORE errorHandler.
// ---------------------------------------------------------------------------
export function notFoundHandler(req: Request, res: Response): void {
  sendError(
    res,
    ERROR_CODES.NOT_FOUND,
    `Route ${req.method} ${req.url} not found`,
    HTTP_STATUS.NOT_FOUND
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface MongooseDuplicateKeyError {
  code: number;
  keyValue?: Record<string, unknown>;
}

function isMongooseDuplicateKeyError(
  error: unknown
): error is MongooseDuplicateKeyError {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as MongooseDuplicateKeyError).code === 11000
  );
}

function extractDuplicateKeyField(error: MongooseDuplicateKeyError): string {
  const keyValue = error.keyValue;
  if (keyValue) {
    const keys = Object.keys(keyValue);
    return keys[0] ?? "field";
  }
  return "field";
}
