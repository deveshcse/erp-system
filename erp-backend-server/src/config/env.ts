import "dotenv/config";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Schema — every env var the app needs, typed and validated at startup.
// If any required var is missing or malformed the process exits immediately
// with a clear error rather than failing silently at runtime.
// ---------------------------------------------------------------------------
const envSchema = z.object({
  // Server
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(5000),
  API_VERSION: z.string().default("v1"),

  // MongoDB
  MONGODB_URI: z.string().url("MONGODB_URI must be a valid connection string"),

  // JWT
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  // Session
  SESSION_MAX_CONCURRENT: z.coerce.number().int().positive().default(5),

  // CORS — stored as a comma-separated string, transformed to an array
  CORS_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((val) => val.split(",").map((o) => o.trim())),

  // Rate limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX_GLOBAL: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_MAX_AUTH: z.coerce.number().int().positive().default(10),

  // Bcrypt
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(10).max(15).default(12),

  // Logging
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  // Super admin seed
  SUPER_ADMIN_EMAIL: z.string().email(),
  SUPER_ADMIN_PASSWORD: z.string().min(8),
  SUPER_ADMIN_NAME: z.string().min(2),
});

// ---------------------------------------------------------------------------
// Parse & export — fail fast with a human-readable message on any violation.
// ---------------------------------------------------------------------------
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `  • ${i.path.join(".")}: ${i.message}`)
    .join("\n");

  console.error(
    `\n[Config] ❌  Invalid environment variables:\n${issues}\n\n` +
      `  Copy .env.example to .env and fill in the required values.\n`
  );
  process.exit(1);
}

export const env = parsed.data;

// Convenience shorthands
export const isDev = env.NODE_ENV === "development";
export const isProd = env.NODE_ENV === "production";
export const isTest = env.NODE_ENV === "test";
