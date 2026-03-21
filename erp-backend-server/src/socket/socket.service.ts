import { Server as HttpServer } from "http";
import { Server as SocketIOServer, type Socket } from "socket.io";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

// ---------------------------------------------------------------------------
// Module-level singleton — initialized once in server.ts.
// ---------------------------------------------------------------------------
let io: SocketIOServer | null = null;

// ---------------------------------------------------------------------------
// initializeSocket
//
// Attaches socket.io to the existing HTTP server with CORS matching the
// Express configuration. Called once at startup after the DB is connected.
//
// To add real-time features (notifications, live attendance updates, etc.):
//   1. Add event handler functions in this file or in /socket/handlers/
//   2. Register them in the connection callback below
//   3. Emit from services via the getIO() helper
// ---------------------------------------------------------------------------
export function initializeSocket(httpServer: HttpServer): SocketIOServer {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: env.CORS_ORIGINS,
      methods: ["GET", "POST"],
      credentials: true,
    },
    // Path separated from the REST API path to avoid conflicts.
    path: "/socket.io",
    // Connection state recovery — clients auto-reconnect without missing events.
    connectionStateRecovery: {
      maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    },
  });

  // ── Connection lifecycle ────────────────────────────────────────────────
  io.on("connection", (socket: Socket) => {
    logger.info({ socketId: socket.id }, "[Socket] Client connected");

    // ── TODO: Register event handlers here as features are built ──────────
    // Example:
    //   import { registerNotificationHandlers } from "./handlers/notification.handler";
    //   registerNotificationHandlers(io!, socket);
    //
    //   import { registerAttendanceHandlers } from "./handlers/attendance.handler";
    //   registerAttendanceHandlers(io!, socket);

    socket.on("disconnect", (reason) => {
      logger.info(
        { socketId: socket.id, reason },
        "[Socket] Client disconnected"
      );
    });

    socket.on("error", (error) => {
      logger.error({ socketId: socket.id, error }, "[Socket] Socket error");
    });
  });

  logger.info("[Socket] Socket.io initialized");
  return io;
}

// ---------------------------------------------------------------------------
// getIO
//
// Returns the singleton socket.io instance. Services use this to emit
// events without needing a direct reference to the server.
//
// Usage in a service:
//   import { getIO } from "@/socket/socket.service";
//   getIO().to(`company:${companyId}`).emit("attendance:marked", data);
// ---------------------------------------------------------------------------
export function getIO(): SocketIOServer {
  if (!io) {
    throw new Error(
      "[Socket] Socket.io has not been initialized. Call initializeSocket() first."
    );
  }
  return io;
}
