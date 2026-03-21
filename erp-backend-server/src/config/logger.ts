import pino from "pino";
import { env, isDev } from "@/config/env.js";

// ---------------------------------------------------------------------------
// Logger — Pino with pretty-printing in development and structured JSON in
// production. All log entries include a "service" field for easy filtering
// in log aggregators (Datadog, CloudWatch, Loki, etc.).
// ---------------------------------------------------------------------------
export const logger = pino({
  level: env.LOG_LEVEL,
  base: { service: "erp-backend" },

  // Pretty-print in dev for readability; raw JSON in production for parsers.
  ...(isDev && {
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "SYS:standard",
        ignore: "pid,hostname,service",
      },
    },
  }),

  // Redact sensitive fields from logs — never log secrets.
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "body.password",
      "body.currentPassword",
      "body.newPassword",
      "body.refreshToken",
    ],
    censor: "[REDACTED]",
  },

  // Consistent timestamp format across environments.
  timestamp: pino.stdTimeFunctions.isoTime,
});
