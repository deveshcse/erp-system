import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Session } from "../models/session.model.js";
import { logger } from "@/config/logger.js";
import { env } from "@/config/env.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateTokenFamily,
  generateResetToken,
  getRefreshTokenExpiryDate,
} from "@/utils/token.util.js";
import {
  UnauthorizedError,
  AppError,
} from "@/utils/errors.util.js";
import { ERROR_CODES, HTTP_STATUS } from "@/constants/index.js";
import { type LoginInput } from "../schemas/auth.schema.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    companyId: string | null;
  };
  sessionId: string;
  expiresAt: Date;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

// ---------------------------------------------------------------------------
// login
//
// Validates credentials, enforces session limits, creates a new session,
// and returns a fresh access + refresh token pair.
// ---------------------------------------------------------------------------
export async function login(
  input: LoginInput,
  deviceInfo: { userAgent: string; ip: string }
): Promise<LoginResult> {
  // 1. Find the user — explicitly select password (it's excluded by default).
  const user = await User.findOne({ email: input.email }).select("+password");

  if (!user || !user.isActive) {
    // Use a generic message to prevent user enumeration.
    throw new UnauthorizedError(
      "Invalid email or password",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  // 2. Verify password.
  const isPasswordValid = await user.comparePassword(input.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError(
      "Invalid email or password",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  // 3. Enforce concurrent session limit.
  const activeSessionCount = await Session.countDocuments({
    userId: user._id,
    isActive: true,
  });

  if (activeSessionCount >= env.SESSION_MAX_CONCURRENT) {
    // Invalidate the oldest session to make room.
    await Session.findOneAndUpdate(
      { userId: user._id, isActive: true },
      { isActive: false },
      { sort: { createdAt: 1 } }
    );

    logger.info(
      { userId: user._id.toString() },
      "[Auth] Oldest session invalidated to make room for new login"
    );
  }

  // 4. Create a new session.
  const tokenFamily = generateTokenFamily();
  const expiresAt = getRefreshTokenExpiryDate();

  // Sign the refresh token first so we can hash it for storage.
  const sessionId = new mongoose.Types.ObjectId().toString();

  const refreshToken = signRefreshToken({
    sub: user._id.toString(),
    sessionId,
    tokenFamily,
  });

  const session = await Session.create({
    _id: new mongoose.Types.ObjectId(sessionId),
    userId: user._id,
    refreshTokenHash: hashToken(refreshToken),
    tokenFamily,
    deviceInfo,
    isActive: true,
    expiresAt,
  });

  // 5. Sign the access token.
  const accessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    companyId: user.companyId?.toString() ?? null,
    sessionId: session._id.toString(),
  });

  // 6. Update lastLoginAt.
  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  logger.info(
    { userId: user._id.toString(), role: user.role, sessionId: session._id.toString() },
    "[Auth] User logged in"
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId?.toString() ?? null,
    },
    sessionId: session._id.toString(),
    expiresAt,
  };
}

// ---------------------------------------------------------------------------
// refresh
//
// Implements refresh token rotation:
//   1. Verify the incoming refresh token signature.
//   2. Find the session by ID.
//   3. Check if the token hash matches the stored hash.
//   4. If hashes don't match → REUSE DETECTED → invalidate the entire family.
//   5. Issue a new access + refresh token pair and update the session.
// ---------------------------------------------------------------------------
export async function refresh(refreshToken: string): Promise<RefreshResult> {
  // 1. Verify signature and decode payload.
  const payload = verifyRefreshToken(refreshToken);

  // 2. Load the session — explicitly select refreshTokenHash.
  const session = await Session.findById(payload.sessionId).select(
    "+refreshTokenHash"
  );

  if (!session || !session.isActive) {
    throw new UnauthorizedError(
      "Session not found or expired. Please log in again.",
      ERROR_CODES.SESSION_NOT_FOUND
    );
  }

  // 3. Hash the incoming token and compare to the stored hash.
  const incomingHash = hashToken(refreshToken);

  if (incomingHash !== session.refreshTokenHash) {
    // REUSE DETECTED — someone is using an old refresh token.
    // This is a security event: invalidate ALL sessions in this token family.
    await Session.updateMany(
      { tokenFamily: payload.tokenFamily, isActive: true },
      { isActive: false }
    );

    logger.warn(
      {
        userId: payload.sub,
        sessionId: payload.sessionId,
        tokenFamily: payload.tokenFamily,
      },
      "[Auth] SECURITY: Refresh token reuse detected — entire token family invalidated"
    );

    throw new AppError(
      "Security violation detected. Please log in again.",
      HTTP_STATUS.UNAUTHORIZED,
      ERROR_CODES.REFRESH_TOKEN_REUSED
    );
  }

  // 4. Load the user to build a fresh access token payload.
  const user = await User.findById(session.userId);
  if (!user || !user.isActive) {
    session.isActive = false;
    await session.save();
    throw new UnauthorizedError(
      "User account is inactive",
      ERROR_CODES.INVALID_CREDENTIALS
    );
  }

  // 5. Rotate — issue a new refresh token and update the session.
  const expiresAt = getRefreshTokenExpiryDate();

  const newRefreshToken = signRefreshToken({
    sub: user._id.toString(),
    sessionId: session._id.toString(),
    tokenFamily: payload.tokenFamily, // Same family, new token
  });

  session.refreshTokenHash = hashToken(newRefreshToken);
  session.expiresAt = expiresAt;
  await session.save();

  // 6. Issue a fresh access token.
  const newAccessToken = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    companyId: user.companyId?.toString() ?? null,
    sessionId: session._id.toString(),
  });

  logger.info(
    { userId: user._id.toString(), sessionId: session._id.toString() },
    "[Auth] Token refreshed"
  );

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    expiresAt,
  };
}

// ---------------------------------------------------------------------------
// logout
//
// Invalidates the current session. The access token will naturally expire.
// ---------------------------------------------------------------------------
export async function logout(sessionId: string): Promise<void> {
  await Session.findByIdAndUpdate(sessionId, { isActive: false });
  logger.info({ sessionId }, "[Auth] User logged out");
}

// ---------------------------------------------------------------------------
// logoutAll
//
// Invalidates ALL sessions for a user — "logout from all devices".
// ---------------------------------------------------------------------------
export async function logoutAll(userId: string): Promise<void> {
  const result = await Session.updateMany(
    { userId: new mongoose.Types.ObjectId(userId), isActive: true },
    { isActive: false }
  );

  logger.info(
    { userId, sessionsInvalidated: result.modifiedCount },
    "[Auth] All sessions invalidated"
  );
}

// ---------------------------------------------------------------------------
// getUserSessions
//
// Returns all active sessions for a user — used in the "active devices" UI.
// ---------------------------------------------------------------------------
export async function getUserSessions(userId: string) {
  return Session.find(
    { userId: new mongoose.Types.ObjectId(userId), isActive: true },
    { refreshTokenHash: 0 } // Never return the hash
  ).sort({ createdAt: -1 });
}

// ---------------------------------------------------------------------------
// forgotPassword
//
// Generates a reset token, saves its hash to the user, and "sends" it.
// Returns the raw token string (only used for logging in dev).
// ---------------------------------------------------------------------------
export async function forgotPassword(email: string): Promise<string> {
  // 1. Find user — don't throw error if not found to avoid enumeration.
  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    logger.warn({ email }, "[Auth] Forgot password request for non-existent or inactive user");
    return "";
  }

  // 2. Generate and hash token.
  const resetToken = generateResetToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour

  await user.save();

  // 3. "Send" the email by logging to console (simulated for now).
  const resetUrl = `${env.CORS_ORIGINS[0]}/reset-password/${resetToken}`;
  
  console.log("\n---------------------------------------------------------");
  console.log("📧 PASSWORD RESET EMAIL (SIMULATED)");
  console.log(`To: ${email}`);
  console.log(`Link: ${resetUrl}`);
  console.log("---------------------------------------------------------\n");

  logger.info({ userId: user._id, email }, "[Auth] Password reset token generated");

  return resetToken;
}




// ---------------------------------------------------------------------------
// resetPassword
//
// Verifies the token and updates the user's password.
// ---------------------------------------------------------------------------
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  // 1. Hash the incoming token to compare with DB.
  const hashedToken = hashToken(token);

  // 2. Find user with valid, non-expired token.
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw new AppError(
      "Password reset token is invalid or has expired",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.TOKEN_INVALID
    );
  }

  // 3. Update password and clear reset fields.
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // 4. Invalidate all existing sessions for security.
  await logoutAll(user._id.toString());

  logger.info({ userId: user._id }, "[Auth] Password reset successfully");
}

