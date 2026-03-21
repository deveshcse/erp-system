import { type Response } from "express";
import { HTTP_STATUS, type HttpStatus } from "@/constants";
import { type SuccessResponse, type ErrorResponse, type ResponseMeta } from "@/types";

// ---------------------------------------------------------------------------
// sendSuccess
//
// Sends a uniform success response.
// Every successful API response goes through this function — no controller
// ever calls res.json() or res.status().json() directly.
//
// Example output:
//   { "success": true, "data": { ... }, "meta": { "pagination": { ... } } }
// ---------------------------------------------------------------------------
export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode: HttpStatus = HTTP_STATUS.OK,
  meta?: ResponseMeta
): void {
  const body: SuccessResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  };

  res.status(statusCode).json(body);
}

// ---------------------------------------------------------------------------
// sendError
//
// Sends a uniform error response.
// Prefer throwing AppError instead of calling this directly from controllers.
// This is used by the global error handler and for simple inline cases.
//
// Example output:
//   { "success": false, "error": { "code": "NOT_FOUND", "message": "..." } }
// ---------------------------------------------------------------------------
export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: HttpStatus = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  details?: unknown
): void {
  const body: ErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details !== undefined && { details }),
    },
  };

  res.status(statusCode).json(body);
}

// ---------------------------------------------------------------------------
// buildPaginationMeta
//
// Constructs the pagination sub-object for the response meta field.
// Call this in any controller that returns a paginated list.
// ---------------------------------------------------------------------------
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): ResponseMeta {
  const totalPages = Math.ceil(total / limit);

  return {
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
}
