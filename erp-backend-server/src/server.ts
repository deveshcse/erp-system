import http from "http";
import { createApp } from "@/app.js";
import { connectDB, disconnectDB } from "@/config/database.js";
import { env } from "@/config/env.js";
import { logger } from "@/config/logger.js";
import { initializeSocket } from "@/socket/socket.service.js";
import { seedSuperAdmin } from "@/utils/seeder.util.js";

// ---------------------------------------------------------------------------
// Startup sequence:
//   1. Validate env (done at import time in config/env.ts — fails fast)
//   2. Connect to MongoDB
//   3. Seed SuperAdmin (idempotent)
//   4. Create Express app
//   5. Create HTTP server and attach socket.io
//   6. Start listening
// ---------------------------------------------------------------------------
async function bootstrap(): Promise<void> {
  logger.info(
    { env: env.NODE_ENV, port: env.PORT },
    "[Server] Starting ERP backend..."
  );

  // 1. Database
  await connectDB();

  // 2. Seed initial data
  await seedSuperAdmin();

  // 3. Express app
  const app = createApp();

  // 4. HTTP server (wraps Express so socket.io can share it)
  const httpServer = http.createServer(app);

  // 5. Socket.io
  initializeSocket(httpServer);

  // 6. Listen
  httpServer.listen(env.PORT, () => {
    logger.info(
      {
        port: env.PORT,
        apiBase: `http://localhost:${env.PORT}/api/${env.API_VERSION}`,
        swaggerDocs: `http://localhost:${env.PORT}/api-docs`,
      },
      `[Server] ✅  ERP Backend running on port ${env.PORT}`
    );
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────
  // Registers handlers for SIGTERM (container orchestrators) and
  // SIGINT (Ctrl+C in development). Waits for in-flight requests to
  // complete before closing the DB connection and exiting.

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, "[Server] Shutdown signal received — draining connections...");

    httpServer.close(async () => {
      logger.info("[Server] HTTP server closed");

      await disconnectDB();

      logger.info("[Server] Graceful shutdown complete");
      process.exit(0);
    });

    // Force exit if shutdown takes too long (e.g. stuck connections).
    setTimeout(() => {
      logger.error("[Server] Forced shutdown — timeout exceeded");
      process.exit(1);
    }, 10_000).unref(); // .unref() so this timer doesn't keep the process alive
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  // ── Unhandled rejection / exception safety nets ──────────────────────────
  // These are last-resort handlers — if something gets here it's a bug.
  // Log it and let the process manager (PM2, Docker) restart the process.

  process.on("unhandledRejection", (reason: unknown) => {
    logger.fatal({ reason }, "[Server] Unhandled promise rejection — shutting down");
    void shutdown("unhandledRejection");
  });

  process.on("uncaughtException", (error: Error) => {
    logger.fatal({ error }, "[Server] Uncaught exception — shutting down");
    void shutdown("uncaughtException");
  });
}

bootstrap().catch((error: unknown) => {
  logger.fatal({ error }, "[Server] Bootstrap failed");
  process.exit(1);
});
