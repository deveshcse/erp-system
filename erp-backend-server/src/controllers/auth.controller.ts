import { type Request, type Response, type NextFunction } from "express";
import * as authService from "@/services/auth.service";
import { sendSuccess } from "@/utils/response.util";
import { HTTP_STATUS, COOKIE_NAMES } from "@/constants";
import { env, isProd } from "@/config/env";
import { type LoginInput } from "@/validators/auth.validator";
import { UnauthorizedError } from "@/utils/errors.util";
import { ERROR_CODES } from "@/constants";
import { getRefreshTokenExpiryDate } from "@/utils/token.util";

// ---------------------------------------------------------------------------
// Cookie options — consistent across login and refresh endpoints.
// ---------------------------------------------------------------------------
function getRefreshCookieOptions() {
  return {
    httpOnly: true,   // Not accessible via JS — mitigates XSS
    secure: isProd,   // HTTPS only in production
    sameSite: "strict" as const, // CSRF protection
    maxAge: getRefreshTokenExpiryDate().getTime() - Date.now(),
    path: "/api/v1/auth", // Scoped to auth routes only
  };
}

// ---------------------------------------------------------------------------
// login
// POST /api/v1/auth/login
// ---------------------------------------------------------------------------
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as LoginInput;
    const deviceInfo = {
      userAgent: req.headers["user-agent"] ?? "Unknown",
      ip: req.ip ?? req.socket?.remoteAddress ?? "Unknown",
    };

    const result = await authService.login(input, deviceInfo);

    // Set refresh token as an HttpOnly cookie.
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, getRefreshCookieOptions());

    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      sessionId: result.sessionId,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// refresh
// POST /api/v1/auth/refresh
//
// Accepts the refresh token from either the HttpOnly cookie (preferred)
// or the request body (for mobile clients that can't use cookies).
// ---------------------------------------------------------------------------
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Cookie takes priority over body.
    const cookies = req.cookies as Record<string, string | undefined>;
    const body = req.body as { refreshToken?: string };
    const refreshToken = cookies[COOKIE_NAMES.REFRESH_TOKEN] ?? body.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError("Refresh token is missing", ERROR_CODES.TOKEN_MISSING);
    }

    const result = await authService.refresh(refreshToken);

    // Rotate the cookie with the new refresh token.
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, getRefreshCookieOptions());

    sendSuccess(res, {
      accessToken: result.accessToken,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// logout
// POST /api/v1/auth/logout
// ---------------------------------------------------------------------------
export async function logout(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.logout(req.user.sessionId);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: "/api/v1/auth" });
    sendSuccess(res, { message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// logoutAll
// POST /api/v1/auth/logout-all
// ---------------------------------------------------------------------------
export async function logoutAll(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    await authService.logoutAll(req.user.userId);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, { path: "/api/v1/auth" });
    sendSuccess(res, { message: "All sessions terminated successfully" });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// getSessions
// GET /api/v1/auth/sessions
// ---------------------------------------------------------------------------
export async function getSessions(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const sessions = await authService.getUserSessions(req.user.userId);
    sendSuccess(res, { sessions });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// getMe
// GET /api/v1/auth/me
// ---------------------------------------------------------------------------
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    sendSuccess(res, { user: req.user });
  } catch (error) {
    next(error);
  }
}
