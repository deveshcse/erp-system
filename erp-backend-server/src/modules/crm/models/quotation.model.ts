import mongoose, { Schema, type Document, type Model } from "mongoose";
import { PAYMENT_STATUS, type PaymentStatus } from "@/constants/index.js";

// ---------------------------------------------------------------------------
// Sub-document: Line Item
// ---------------------------------------------------------------------------
export interface ILineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  // Calculated: quantity * unitPrice * (1 + taxPercent / 100)
  totalPrice: number;
}

const lineItemSchema = new Schema<ILineItem>(
  {
    description: {
      type: String,
      required: [true, "Item description is required"],
      trim: true,
      maxlength: [500, "Description must not exceed 500 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.01, "Quantity must be greater than 0"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Unit price cannot be negative"],
    },
    taxPercent: {
      type: Number,
      default: 0,
      min: [0, "Tax percentage cannot be negative"],
      max: [100, "Tax percentage cannot exceed 100"],
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IQuotation extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  quotationNumber: string; // Auto-generated: QUO-2024-0001
  customerId: mongoose.Types.ObjectId | null; // Link to Lead if available
  customerName: string;
  customerEmail: string;
  lineItems: ILineItem[];
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  validityDate: Date;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  notes: string | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const quotationSchema = new Schema<IQuotation>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    quotationNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Lead",
      default: null,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
    },
    customerEmail: {
      type: String,
      required: [true, "Customer email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    lineItems: {
      type: [lineItemSchema],
      required: [true, "At least one line item is required"],
      validate: {
        validator: (items: ILineItem[]) => items.length > 0,
        message: "Quotation must have at least one line item",
      },
    },
    subTotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    totalTax: {
      type: Number,
      required: true,
      min: [0, "Total tax cannot be negative"],
    },
    grandTotal: {
      type: Number,
      required: true,
      min: [0, "Grand total cannot be negative"],
    },
    validityDate: {
      type: Date,
      required: [true, "Validity date is required"],
    },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Rejected", "Expired"],
      default: "Draft",
    },
    notes: {
      type: String,
      default: null,
      maxlength: [2000, "Notes must not exceed 2000 characters"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
quotationSchema.index({ companyId: 1, quotationNumber: 1 }, { unique: true });
quotationSchema.index({ companyId: 1, status: 1 });
quotationSchema.index({ companyId: 1, createdAt: -1 });
quotationSchema.index({ companyId: 1, customerId: 1 });

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Quotation: Model<IQuotation> = mongoose.model<IQuotation>(
  "Quotation",
  quotationSchema
);
