import mongoose from "mongoose";
import { Attendance } from "../models/attendance.model.js";
import { Employee } from "@/modules/employee/models/employee.model.js";
import { logger } from "@/config/logger.js";
import { ATTENDANCE_STATUS } from "@/constants/index.js";
import { NotFoundError, ConflictError } from "@/utils/errors.util.js";
import {
  type MarkAttendanceInput,
  type AttendanceQuery,
} from "../schemas/attendance.schema.js";
import { getPaginationSkip } from "@/utils/pagination.util.js";

// ---------------------------------------------------------------------------
// markAttendance — create or overwrite a single attendance record
// ---------------------------------------------------------------------------
export async function markAttendance(
  companyId: string,
  input: MarkAttendanceInput,
  markedByUserId: string
) {
  // Verify the employee belongs to this company.
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(input.employeeId),
    companyId: new mongoose.Types.ObjectId(companyId),
  });
  if (!employee) throw new NotFoundError("Employee");

  // Normalise date to midnight UTC to avoid timezone-related duplicates.
  const date = new Date(input.date);
  date.setUTCHours(0, 0, 0, 0);

  // Upsert: update if record exists for this employee+date, otherwise create.
  const attendance = await Attendance.findOneAndUpdate(
    {
      companyId: new mongoose.Types.ObjectId(companyId),
      employeeId: new mongoose.Types.ObjectId(input.employeeId),
      date,
    },
    {
      $set: {
        checkInTime: input.checkInTime ?? null,
        checkOutTime: input.checkOutTime ?? null,
        status: input.status,
        notes: input.notes ?? null,
        markedBy: new mongoose.Types.ObjectId(markedByUserId),
      },
    },
    { upsert: true, new: true, runValidators: true }
  );

  logger.info(
    { attendanceId: attendance._id.toString(), employeeId: input.employeeId, date },
    "[Attendance] Attendance marked"
  );

  return attendance;
}

// ---------------------------------------------------------------------------
// listAttendance — paginated attendance history with filters
// ---------------------------------------------------------------------------
export async function listAttendance(
  companyId: string,
  query: AttendanceQuery
) {
  const filter: Record<string, unknown> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  if (query.employeeId) {
    filter["employeeId"] = new mongoose.Types.ObjectId(query.employeeId);
  }

  if (query.status) filter["status"] = query.status;

  // Filter by month/year if provided.
  if (query.month && query.year) {
    const startDate = new Date(Date.UTC(query.year, query.month - 1, 1));
    const endDate = new Date(Date.UTC(query.year, query.month, 0, 23, 59, 59));
    filter["date"] = { $gte: startDate, $lte: endDate };
  } else if (query.year) {
    const startDate = new Date(Date.UTC(query.year, 0, 1));
    const endDate = new Date(Date.UTC(query.year, 11, 31, 23, 59, 59));
    filter["date"] = { $gte: startDate, $lte: endDate };
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter)
      .populate("employeeId", "fullName employeeId department")
      .sort({ date: -1 })
      .skip(getPaginationSkip(query.page, query.limit))
      .limit(query.limit),
    Attendance.countDocuments(filter),
  ]);

  return { records, total };
}

// ---------------------------------------------------------------------------
// getMonthlyReport
//
// Returns an aggregated monthly attendance summary per employee.
// Used for generating payslips and the attendance calendar.
// ---------------------------------------------------------------------------
export async function getMonthlyReport(
  companyId: string,
  month: number,
  year: number
) {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  const report = await Attendance.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: "$employeeId",
        presentDays: {
          $sum: { $cond: [{ $eq: ["$status", ATTENDANCE_STATUS.PRESENT] }, 1, 0] },
        },
        absentDays: {
          $sum: { $cond: [{ $eq: ["$status", ATTENDANCE_STATUS.ABSENT] }, 1, 0] },
        },
        leaveDays: {
          $sum: { $cond: [{ $eq: ["$status", ATTENDANCE_STATUS.LEAVE] }, 1, 0] },
        },
        halfDays: {
          $sum: { $cond: [{ $eq: ["$status", ATTENDANCE_STATUS.HALF_DAY] }, 1, 0] },
        },
        totalRecords: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: "employees",
        localField: "_id",
        foreignField: "_id",
        as: "employee",
      },
    },
    { $unwind: "$employee" },
    {
      $project: {
        _id: 0,
        employeeId: "$_id",
        employeeCode: "$employee.employeeId",
        employeeName: "$employee.fullName",
        department: "$employee.department",
        presentDays: 1,
        absentDays: 1,
        leaveDays: 1,
        halfDays: 1,
        totalRecords: 1,
      },
    },
    { $sort: { employeeName: 1 } },
  ]);

  return {
    month,
    year,
    report,
  };
}
