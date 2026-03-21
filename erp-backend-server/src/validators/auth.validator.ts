import { z } from "zod";

// ---------------------------------------------------------------------------
// loginSchema — validates the request body for POST /auth/login
// ---------------------------------------------------------------------------
export const loginSchema = z.object({
  email: z
    .string({ error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  password: z
    .string({ error: "Password is required" })
    .min(1, "Password cannot be empty"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// refreshTokenSchema — validates the request body for POST /auth/refresh
// (used when the client sends the refresh token in the body instead of a
//  cookie — both paths are supported)
// ---------------------------------------------------------------------------
export const refreshTokenBodySchema = z.object({
  refreshToken: z
    .string({ error: "Refresh token is required" })
    .min(1, "Refresh token cannot be empty"),
});

export type RefreshTokenBodyInput = z.infer<typeof refreshTokenBodySchema>;
