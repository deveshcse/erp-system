import { Attendance } from "../models/attendance.model.js";
import { Employee } from "../models/employee.model.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

export const markAttendance = async (attendanceData, companyId) => {
  const { employeeId, date = new Date() } = attendanceData;

  // Verify employee exists and belongs to the same company
  const employee = await Employee.findOne({ _id: employeeId, companyId });
  if (!employee) {
    throw new ApiError(404, "Employee not found in your company");
  }

  // Set date to start of day for unique index/lookup
  const recordDate = new Date(date);
  recordDate.setHours(0, 0, 0, 0);

  // Update if exists (e.g., adding check-out later), otherwise create
  const attendance = await Attendance.findOneAndUpdate(
    { employeeId, date: recordDate },
    { 
        $set: { ...attendanceData, date: recordDate, companyId } 
    },
    { new: true, upsert: true, runValidators: true }
  );

  return attendance;
};

export const getAttendanceHistory = async (filters, companyId, user) => {
  const { page = 1, limit = 10, startDate, endDate, employeeId } = filters;
  const skip = (page - 1) * limit;

  const query = { companyId };

  // RBAC isolation: Employee can only see their own attendance
  if (user.role === "EMPLOYEE") {
      // Find the employee record for this user first
      const empRecord = await Employee.findOne({ email: user.email });
      if (!empRecord) throw new ApiError(404, "Employee record not found for user");
      query.employeeId = empRecord._id;
  } else if (employeeId) {
      // Admin can filter by specific employee
      query.employeeId = employeeId;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = startDate;
    if (endDate) query.date.$lte = endDate;
  }

  const history = await Attendance.find(query)
    .populate("employeeId", "fullName employeeId")
    .skip(skip)
    .limit(limit)
    .sort({ date: -1 });

  const total = await Attendance.countDocuments(query);

  return {
    history,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const generateMonthlyReport = async (month, year, companyId, employeeId = null) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const match = {
    companyId: new mongoose.Types.ObjectId(companyId),
    date: { $gte: startDate, $lte: endDate }
  };

  if (employeeId) {
    match.employeeId = new mongoose.Types.ObjectId(employeeId);
  }

  const report = await Attendance.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$employeeId",
        totalPresent: {
          $sum: { $cond: [{ $eq: ["$status", "PRESENT"] }, 1, 0] }
        },
        totalAbsent: {
          $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] }
        },
        totalLeave: {
          $sum: { $cond: [{ $eq: ["$status", "LEAVE"] }, 1, 0] }
        },
        records: { $push: "$$ROOT" }
      }
    },
    {
      $lookup: {
        from: "employees",
        localField: "_id",
        foreignField: "_id",
        as: "employeeDetails"
      }
    },
    { $unwind: "$employeeDetails" },
    {
      $project: {
        _id: 1,
        fullName: "$employeeDetails.fullName",
        employeeId: "$employeeDetails.employeeId",
        totalPresent: 1,
        totalAbsent: 1,
        totalLeave: 1,
        attendanceRate: {
          $cond: [
            { $gt: [{ $add: ["$totalPresent", "$totalAbsent", "$totalLeave"] }, 0] },
            {
              $multiply: [
                { $divide: ["$totalPresent", { $add: ["$totalPresent", "$totalAbsent", "$totalLeave"] }] },
                100
              ]
            },
            0
          ]
        }
      }
    }
  ]);

  return report;
};
