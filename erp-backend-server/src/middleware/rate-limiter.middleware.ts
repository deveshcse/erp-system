import rateLimit from "express-rate-limit";
import { env } from "@/config/env";
import { ERROR_CODES, HTTP_STATUS } from "@/constants";
import { type ErrorResponse } from "@/types";

// ---------------------------------------------------------------------------
// Rate limiter response — uses the standard error shape so the frontend
// always gets the same response structure regardless of which error fires.
// ---------------------------------------------------------------------------
function buildLimitResponse(message: string): object {
  const body: ErrorResponse = {
    success: false,
    error: {
      code: ERROR_CODES.RATE_LIMIT_EXCEEDED,
      message,
    },
  };
  return body;
}

// ---------------------------------------------------------------------------
// globalRateLimiter
//
// Applied to ALL routes. Prevents general API abuse.
// Window: configurable via env (default: 15 minutes, 100 requests).
// ---------------------------------------------------------------------------
export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_GLOBAL,
  standardHeaders: "draft-7", // Return RateLimit-* headers (RFC draft 7)
  legacyHeaders: false,
  message: buildLimitResponse(
    `Too many requests. You are limited to ${env.RATE_LIMIT_MAX_GLOBAL} requests per ${env.RATE_LIMIT_WINDOW_MS / 60_000} minutes.`
  ),
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  // Skip rate limiting in test environment.
  skip: () => env.NODE_ENV === "test",
});

// ---------------------------------------------------------------------------
// authRateLimiter
//
// Applied to auth routes only (/login, /refresh).
// Stricter limit to slow down brute-force and credential stuffing attacks.
// ---------------------------------------------------------------------------
export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_AUTH,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: buildLimitResponse(
    `Too many authentication attempts. Please wait ${env.RATE_LIMIT_WINDOW_MS / 60_000} minutes before trying again.`
  ),
  statusCode: HTTP_STATUS.TOO_MANY_REQUESTS,
  skip: () => env.NODE_ENV === "test",
});
