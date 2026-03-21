import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  EMPLOYEE_STATUS,
  type EmployeeStatus,
} from "@/constants/index.js";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  // Multi-tenancy — every employee belongs to exactly one company.
  companyId: mongoose.Types.ObjectId;
  // Link to the User account (for login). An employee may or may not have
  // a login account — adminId is set when the admin creates a User for them.
  userId: mongoose.Types.ObjectId | null;
  employeeId: string; // Human-readable ID like "EMP-0001"
  fullName: string;
  email: string;
  phoneNumber: string;
  department: string;
  designation: string;
  joiningDate: Date;
  salary: number;
  status: EmployeeStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const employeeSchema = new Schema<IEmployee>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [100, "Full name must not exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
      maxlength: [100, "Department must not exceed 100 characters"],
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
      maxlength: [100, "Designation must not exceed 100 characters"],
    },
    joiningDate: {
      type: Date,
      required: [true, "Joining date is required"],
    },
    salary: {
      type: Number,
      required: [true, "Salary is required"],
      min: [0, "Salary cannot be negative"],
    },
    status: {
      type: String,
      enum: Object.values(EMPLOYEE_STATUS),
      default: EMPLOYEE_STATUS.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// Unique employeeId per company (not globally unique)
employeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });
// Unique email per company
employeeSchema.index({ companyId: 1, email: 1 }, { unique: true });
employeeSchema.index({ companyId: 1, status: 1 });
employeeSchema.index({ companyId: 1, department: 1 });
// Text search on name within a company
employeeSchema.index({ fullName: "text", email: "text" });

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Employee: Model<IEmployee> = mongoose.model<IEmployee>(
  "Employee",
  employeeSchema
);
