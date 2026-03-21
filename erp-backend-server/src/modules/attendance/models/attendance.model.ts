import mongoose, { Schema, type Document, type Model } from "mongoose";
import { ATTENDANCE_STATUS, type AttendanceStatus } from "@/constants/index.js";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: Date;
  checkInTime: Date | null;
  checkOutTime: Date | null;
  status: AttendanceStatus;
  notes: string | null;
  markedBy: mongoose.Types.ObjectId; // userId of admin who marked it
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const attendanceSchema = new Schema<IAttendance>(
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
    date: {
      type: Date,
      required: [true, "Date is required"],
    },
    checkInTime: {
      type: Date,
      default: null,
    },
    checkOutTime: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      required: [true, "Status is required"],
    },
    notes: {
      type: String,
      default: null,
      maxlength: [500, "Notes must not exceed 500 characters"],
    },
    markedBy: {
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
// One attendance record per employee per day
attendanceSchema.index(
  { companyId: 1, employeeId: 1, date: 1 },
  { unique: true }
);
attendanceSchema.index({ companyId: 1, date: 1 });
attendanceSchema.index({ companyId: 1, employeeId: 1, status: 1 });

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Attendance: Model<IAttendance> = mongoose.model<IAttendance>(
  "Attendance",
  attendanceSchema
);
