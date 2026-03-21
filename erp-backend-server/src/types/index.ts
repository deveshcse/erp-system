import { type Request } from "express";
import { type Role } from "@/constants";

// ---------------------------------------------------------------------------
// Authenticated Request — every protected route gets this augmented Request.
// The middleware layer populates these fields after JWT verification.
// ---------------------------------------------------------------------------
export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    role: Role;
    companyId: string | null; // null for SuperAdmin (platform-level user)
    sessionId: string;
  };
}

// ---------------------------------------------------------------------------
// API Response shapes — every response from the API is one of these two.
// No mix of success data and error fields in the same response.
// ---------------------------------------------------------------------------
export interface SuccessResponse<T = unknown> {
  success: true;
  data: T;
  meta?: ResponseMeta;
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown; // Validation errors, field-level messages, etc.
  };
}

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------
export interface PaginationQuery {
  page: number;
  limit: number;
}

export interface ResponseMeta {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

// ---------------------------------------------------------------------------
// Service layer result — services return these instead of throwing for
// expected errors, reserving throws for truly unexpected failures.
// ---------------------------------------------------------------------------
export type ServiceResult<T> =
  | { success: true; data: T }
  | { success: false; code: string; message: string; details?: unknown };

// ---------------------------------------------------------------------------
// Token payloads — what lives inside our JWTs.
// ---------------------------------------------------------------------------
export interface AccessTokenPayload {
  sub: string; // userId
  role: Role;
  companyId: string | null;
  sessionId: string;
  type: "access";
}

export interface RefreshTokenPayload {
  sub: string; // userId
  sessionId: string;
  tokenFamily: string; // For rotation — detects reuse of old refresh tokens
  type: "refresh";
}
