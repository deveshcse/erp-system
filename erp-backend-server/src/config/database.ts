import mongoose from "mongoose";
import { env } from "@/config/env";
import { logger } from "@/config/logger";

// ---------------------------------------------------------------------------
// Connection options — tuned for production reliability.
// ---------------------------------------------------------------------------
const MONGOOSE_OPTIONS: mongoose.ConnectOptions = {
  // Let Mongoose manage the connection pool (default 5 is fine for most apps).
  maxPoolSize: 10,
  // How long to wait for a connection before giving up.
  serverSelectionTimeoutMS: 10_000,
  // How long a socket can stay idle before being closed.
  socketTimeoutMS: 45_000,
};

// ---------------------------------------------------------------------------
// connect — establishes a connection to MongoDB. Called once at startup.
// ---------------------------------------------------------------------------
export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI, MONGOOSE_OPTIONS);
    logger.info(
      { uri: env.MONGODB_URI.replace(/\/\/.*@/, "//[credentials]@") },
      "[DB] Connected to MongoDB"
    );
  } catch (error) {
    logger.fatal({ error }, "[DB] Failed to connect to MongoDB");
    process.exit(1);
  }
}

// ---------------------------------------------------------------------------
// disconnectDB — gracefully closes the connection. Called on shutdown.
// ---------------------------------------------------------------------------
export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    logger.info("[DB] Disconnected from MongoDB");
  } catch (error) {
    logger.error({ error }, "[DB] Error while disconnecting from MongoDB");
  }
}

// ---------------------------------------------------------------------------
// Event listeners — surface Mongoose connection events to the logger so ops
// teams get visibility without adding instrumentation code elsewhere.
// ---------------------------------------------------------------------------
mongoose.connection.on("disconnected", () => {
  logger.warn("[DB] MongoDB connection lost");
});

mongoose.connection.on("reconnected", () => {
  logger.info("[DB] MongoDB reconnected");
});

mongoose.connection.on("error", (error: Error) => {
  logger.error({ error }, "[DB] MongoDB connection error");
});
