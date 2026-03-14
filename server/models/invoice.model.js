import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    items: [itemSchema],
    tax: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "PARTIALLY_PAID"],
      default: "PENDING",
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

export const Invoice = mongoose.model("Invoice", invoiceSchema);
