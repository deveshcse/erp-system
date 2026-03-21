import mongoose, { Schema, type Document, type Model } from "mongoose";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  // The current valid refresh token hash (not plaintext — we hash it).
  refreshTokenHash: string;
  // Token family enables rotation-reuse detection.
  // Each new session starts a new family. When a token in a family is rotated,
  // the family stays the same. If an old token from the same family is seen,
  // the entire family is invalidated (all sessions for that family).
  tokenFamily: string;
  // Device/client info for the session list UI.
  deviceInfo: {
    userAgent: string;
    ip: string;
  };
  isActive: boolean;
  // MongoDB TTL index will delete the document when expiresAt is reached.
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const sessionSchema = new Schema<ISession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    refreshTokenHash: {
      type: String,
      required: true,
      // Never expose the hash in queries by default.
      select: false,
    },
    tokenFamily: {
      type: String,
      required: true,
      index: true,
    },
    deviceInfo: {
      userAgent: { type: String, default: "Unknown" },
      ip: { type: String, default: "Unknown" },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// TTL index — MongoDB automatically removes expired sessions.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Compound index for "get all active sessions for user" query.
sessionSchema.index({ userId: 1, isActive: 1 });
// Compound index for token family invalidation.
sessionSchema.index({ tokenFamily: 1, isActive: 1 });

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Session: Model<ISession> = mongoose.model<ISession>(
  "Session",
  sessionSchema
);
