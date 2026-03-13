import mongoose, { Schema } from "mongoose";

const attendanceSchema = new Schema(
  {
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    checkIn: {
      type: String, // HH:mm format or full Date
    },
    checkOut: {
      type: String, // HH:mm format or full Date
    },
    status: {
      type: String,
      enum: ["PRESENT", "ABSENT", "LATE", "HALF_DAY"],
      default: "PRESENT",
    },
    companyId: {
        type: Schema.Types.ObjectId,
        ref: "Company",
        required: true,
    }
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent multiple entries for same employee on same date
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);
