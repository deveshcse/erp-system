import mongoose, { Schema } from "mongoose";

const leadSchema = new Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    leadSource: {
      type: String,
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "NEGOTIATION", "CLOSED", "LOST"],
      default: "NEW",
    },
    notes: {
      type: String,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Lead = mongoose.model("Lead", leadSchema);
