import mongoose, { Schema } from "mongoose";

const itemSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
});

const quotationSchema = new Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    items: [itemSchema],
    tax: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    validityDate: {
      type: Date,
      required: true,
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

export const Quotation = mongoose.model("Quotation", quotationSchema);
