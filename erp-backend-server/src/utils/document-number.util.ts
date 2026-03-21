import mongoose, { Schema, type Model } from "mongoose";

// ---------------------------------------------------------------------------
// Counter model — used to generate sequential document numbers.
// One counter document per (companyId, type) pair.
// ---------------------------------------------------------------------------
interface ICounter {
  _id: string; // e.g. "QUO-ObjectId123" or "INV-ObjectId123"
  sequence: number;
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  sequence: { type: Number, default: 0 },
});

const Counter: Model<ICounter> = mongoose.model<ICounter>(
  "Counter",
  counterSchema
);

// ---------------------------------------------------------------------------
// generateDocumentNumber
//
// Atomically increments the counter for a (companyId, prefix) pair and
// returns a formatted document number like "QUO-2024-00042".
//
// The findOneAndUpdate with upsert:true is atomic in MongoDB — safe for
// concurrent requests.
// ---------------------------------------------------------------------------
export async function generateDocumentNumber(
  prefix: "QUO" | "INV" | "EMP",
  companyId: string
): Promise<string> {
  const counterId = `${prefix}-${companyId}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { sequence: 1 } },
    { upsert: true, new: true }
  );

  const year = new Date().getFullYear();
  const sequence = counter.sequence.toString().padStart(5, "0");

  // EMP numbers don't include the year (e.g. EMP-00001)
  if (prefix === "EMP") {
    return `${prefix}-${sequence}`;
  }

  return `${prefix}-${year}-${sequence}`;
}
