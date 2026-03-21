import jwt from "jsonwebtoken";
import crypto from "crypto";
import { env } from "@/config/env.js";
import { ERROR_CODES } from "@/constants/index.js";
import { UnauthorizedError } from "@/utils/errors.util.js";
import {
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from "@/types/index.js";

// ---------------------------------------------------------------------------
// signAccessToken
//
// Creates a short-lived access token. Contains the minimal payload needed
// to authenticate and authorise a request without a database lookup.
// ---------------------------------------------------------------------------
export function signAccessToken(payload: Omit<AccessTokenPayload, "type">): string {
  return jwt.sign(
    { ...payload, type: "access" } satisfies AccessTokenPayload,
    env.JWT_ACCESS_SECRET,
    {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      algorithm: "HS256",
    }
  );
}

// ---------------------------------------------------------------------------
// signRefreshToken
//
// Creates a longer-lived refresh token. The tokenFamily is carried over
// on every rotation so we can detect and invalidate reuse of old tokens.
// ---------------------------------------------------------------------------
export function signRefreshToken(
  payload: Omit<RefreshTokenPayload, "type">
): string {
  return jwt.sign(
    { ...payload, type: "refresh" } satisfies RefreshTokenPayload,
    env.JWT_REFRESH_SECRET,
    {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
      algorithm: "HS256",
    }
  );
}

// ---------------------------------------------------------------------------
// verifyAccessToken
//
// Decodes and validates an access token. Throws UnauthorizedError on any
// failure so callers don't need to handle jwt errors directly.
// ---------------------------------------------------------------------------
export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;

    if (payload.type !== "access") {
      throw new UnauthorizedError(
        "Invalid token type",
        ERROR_CODES.TOKEN_INVALID
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;

    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Access token has expired", ERROR_CODES.TOKEN_EXPIRED);
    }

    throw new UnauthorizedError("Invalid access token", ERROR_CODES.TOKEN_INVALID);
  }
}

// ---------------------------------------------------------------------------
// verifyRefreshToken
//
// Decodes and validates a refresh token. Called only during the
// /auth/refresh endpoint, not on every request.
// ---------------------------------------------------------------------------
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const payload = jwt.verify(
      token,
      env.JWT_REFRESH_SECRET
    ) as RefreshTokenPayload;

    if (payload.type !== "refresh") {
      throw new UnauthorizedError(
        "Invalid token type",
        ERROR_CODES.TOKEN_INVALID
      );
    }

    return payload;
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;

    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError(
        "Refresh token has expired. Please log in again.",
        ERROR_CODES.TOKEN_EXPIRED
      );
    }

    throw new UnauthorizedError(
      "Invalid refresh token",
      ERROR_CODES.TOKEN_INVALID
    );
  }
}

// ---------------------------------------------------------------------------
// hashToken
//
// SHA-256 hashes a token before storing it in MongoDB.
// We never store plaintext refresh tokens — only their hashes.
// This way, a database breach does not expose usable tokens.
// ---------------------------------------------------------------------------
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ---------------------------------------------------------------------------
// generateTokenFamily
//
// Creates a random identifier for a new session's token family.
// Shared across all rotations within the same session.
// ---------------------------------------------------------------------------
export function generateTokenFamily(): string {
  return crypto.randomBytes(32).toString("hex");
}

// ---------------------------------------------------------------------------
// getRefreshTokenExpiryDate
//
// Parses the JWT_REFRESH_EXPIRES_IN env value into a concrete Date.
// Used when setting the session expiresAt and the cookie maxAge.
// ---------------------------------------------------------------------------
export function getRefreshTokenExpiryDate(): Date {
  const raw = env.JWT_REFRESH_EXPIRES_IN; // e.g. "7d", "24h", "30m"
  const unit = raw.slice(-1);
  const amount = parseInt(raw.slice(0, -1), 10);

  const ms: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  const multiplier = ms[unit];
  if (!multiplier || isNaN(amount)) {
    // Fallback: 7 days
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  return new Date(Date.now() + amount * multiplier);
}
