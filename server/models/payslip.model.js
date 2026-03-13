import mongoose, { Schema } from "mongoose";

const payslipSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    month: {
      type: String, // format "YYYY-MM"
      required: true,
    },
    basicSalary: {
      type: Number,
      required: true,
    },
    allowances: {
      type: Number,
      default: 0,
    },
    deductions: {
      type: Number,
      default: 0,
    },
    workingDays: {
      type: Number,
      required: true,
    },
    leaveDays: {
      type: Number,
      default: 0,
    },
    netSalary: {
      type: Number,
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

// Compound index to prevent duplicate payslips for same employee and month
payslipSchema.index({ employeeId: 1, month: 1 }, { unique: true });

export const Payslip = mongoose.model("Payslip", payslipSchema);
