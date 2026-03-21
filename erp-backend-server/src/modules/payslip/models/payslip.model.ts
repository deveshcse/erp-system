import mongoose, { Schema, type Document, type Model } from "mongoose";
import { PAYMENT_STATUS, type PaymentStatus } from "@/constants/index.js";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IPayslip extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  // The pay period this payslip covers.
  month: number; // 1–12
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  workingDays: number;
  presentDays: number;
  leaveDays: number;
  // Calculated: (basicSalary / workingDays) * presentDays + allowances - deductions
  netSalary: number;
  paymentStatus: PaymentStatus;
  processedBy: mongoose.Types.ObjectId; // userId of admin
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const payslipSchema = new Schema<IPayslip>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Employee ID is required"],
    },
    month: {
      type: Number,
      required: true,
      min: [1, "Month must be between 1 and 12"],
      max: [12, "Month must be between 1 and 12"],
    },
    year: {
      type: Number,
      required: true,
      min: [2000, "Year must be 2000 or later"],
    },
    basicSalary: {
      type: Number,
      required: true,
      min: [0, "Basic salary cannot be negative"],
    },
    allowances: {
      type: Number,
      default: 0,
      min: [0, "Allowances cannot be negative"],
    },
    deductions: {
      type: Number,
      default: 0,
      min: [0, "Deductions cannot be negative"],
    },
    workingDays: {
      type: Number,
      required: true,
      min: [1, "Working days must be at least 1"],
    },
    presentDays: {
      type: Number,
      required: true,
      min: [0, "Present days cannot be negative"],
    },
    leaveDays: {
      type: Number,
      default: 0,
      min: [0, "Leave days cannot be negative"],
    },
    netSalary: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// One payslip per employee per month/year
payslipSchema.index(
  { companyId: 1, employeeId: 1, month: 1, year: 1 },
  { unique: true }
);
payslipSchema.index({ companyId: 1, year: 1, month: 1 });
payslipSchema.index({ companyId: 1, paymentStatus: 1 });

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Payslip: Model<IPayslip> = mongoose.model<IPayslip>(
  "Payslip",
  payslipSchema
);
