import mongoose, { Schema, type Document, type Model } from "mongoose";
import { PAYMENT_STATUS, type PaymentStatus } from "@/constants";

// ---------------------------------------------------------------------------
// Sub-document: Invoice Line Item (same shape as quotation line item)
// ---------------------------------------------------------------------------
export interface IInvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  taxPercent: number;
  totalPrice: number;
}

const invoiceLineItemSchema = new Schema<IInvoiceLineItem>(
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
      min: [0, "Tax cannot be negative"],
      max: [100, "Tax cannot exceed 100"],
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
export interface IInvoice extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  invoiceNumber: string; // Auto-generated: INV-2024-0001
  // Optional link to the quotation this invoice was raised from.
  quotationId: mongoose.Types.ObjectId | null;
  customerName: string;
  customerEmail: string;
  lineItems: IInvoiceLineItem[];
  subTotal: number;
  totalTax: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: PaymentStatus;
  dueDate: Date;
  notes: string | null;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const invoiceSchema = new Schema<IInvoice>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    invoiceNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    quotationId: {
      type: Schema.Types.ObjectId,
      ref: "Quotation",
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
      type: [invoiceLineItemSchema],
      required: [true, "At least one line item is required"],
      validate: {
        validator: (items: IInvoiceLineItem[]) => items.length > 0,
        message: "Invoice must have at least one line item",
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
    amountPaid: {
      type: Number,
      default: 0,
      min: [0, "Amount paid cannot be negative"],
    },
    balanceDue: {
      type: Number,
      required: true,
      min: [0, "Balance due cannot be negative"],
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
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
invoiceSchema.index({ companyId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ companyId: 1, paymentStatus: 1 });
invoiceSchema.index({ companyId: 1, dueDate: 1 });
invoiceSchema.index({ companyId: 1, createdAt: -1 });

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Invoice: Model<IInvoice> = mongoose.model<IInvoice>(
  "Invoice",
  invoiceSchema
);
