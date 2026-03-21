import express, { type Application, type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { pinoHttp as pinoHttpFactory } from "pino-http";
const pinoHttp = pinoHttpFactory;
import swaggerUi from "swagger-ui-express";
import path from "path";
import fs from "fs";

import { fileURLToPath } from "url";
import { dirname } from "path";

import { env, isDev } from "@/config/env.js";
import { logger } from "@/config/logger.js";
import { globalRateLimiter } from "@/middleware/rate-limiter.middleware.js";
import { requestContext } from "@/middleware/request-context.middleware.js";
import { errorHandler, notFoundHandler } from "@/middleware/error.middleware.js";
import v1Router from "@/routes/v1/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ---------------------------------------------------------------------------
// createApp — factory function that wires up all Express middleware and routes.
// Separated from server.ts so it can be imported in test files without
// starting the HTTP server.
// ---------------------------------------------------------------------------
export function createApp(): Application {
  const app = express();

  // ── 1. Security headers ─────────────────────────────────────────────────
  // Helmet sets sensible default HTTP security headers.
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false, // Required for Swagger UI to load
    })
  );

  // ── 2. CORS ─────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, Postman, curl).
        if (!origin) return callback(null, true);

        if (env.CORS_ORIGINS.includes(origin)) {
          return callback(null, true);
        }

        logger.warn({ origin }, "[CORS] Rejected request from unauthorized origin");
        callback(new Error(`CORS: Origin '${origin}' is not allowed`));
      },
      credentials: true, // Allow cookies (refresh token cookie)
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID"],
      exposedHeaders: ["X-Request-ID", "RateLimit-Limit", "RateLimit-Remaining"],
    })
  );

  // ── 3. Request correlation ID ────────────────────────────────────────────
  app.use(requestContext);

  // ── 4. HTTP request logging (pino-http) ──────────────────────────────────
  app.use(
    pinoHttp({
      logger,
      // Use the correlation ID we set in requestContext.
      genReqId: (req: Request) => req.requestId as string,
      // Don't log health check requests — too noisy.
      autoLogging: {
        ignore: (req: Request) => req.url === `/api/${env.API_VERSION}/health`,
      },
      customLogLevel(_req: Request, res: Response, error: Error | undefined) {
        if (error || res.statusCode >= 500) return "error";
        if (res.statusCode >= 400) return "warn";
        return "info";
      },
    })
  );

  // ── 5. Body parsing ──────────────────────────────────────────────────────
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(cookieParser());

  // ── 6. Global rate limiter ──────────────────────────────────────────────
  app.use(globalRateLimiter);

  // ── 7. Swagger UI ────────────────────────────────────────────────────────
  const swaggerSpecPath = path.resolve(__dirname, "../../swagger.json");

  if (fs.existsSync(swaggerSpecPath)) {
    const swaggerSpec = JSON.parse(fs.readFileSync(swaggerSpecPath, "utf-8")) as object;

    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        customSiteTitle: "ERP API Documentation",
        swaggerOptions: {
          persistAuthorization: true, // Keep token across page refreshes
          displayRequestDuration: true,
          filter: true,
          tryItOutEnabled: isDev, // Only allow "Try it out" in development
        },
      })
    );

    logger.info("[App] Swagger UI available at /api-docs");
  } else {
    logger.warn(
      "[App] swagger.json not found — run `npm run swagger` to generate API docs"
    );
  }

  // ── 8. API routes ────────────────────────────────────────────────────────
  app.use(`/api/${env.API_VERSION}`, v1Router);

  // ── 9. 404 handler — must come after all routes ──────────────────────────
  app.use(notFoundHandler);

  // ── 10. Global error handler — must be last, with 4 parameters ──────────
  app.use(errorHandler);

  return app;
}
