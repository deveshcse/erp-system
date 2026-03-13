import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as attendanceService from "../services/attendance.service.js";

export const markAttendance = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const attendance = await attendanceService.markAttendance(
    req.body,
    req.user.companyId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, attendance, "Attendance marked successfully"));
});

export const getHistory = asyncHandler(async (req, res) => {
  const result = await attendanceService.getAttendanceHistory(
    req.query,
    req.user.companyId,
    req.user
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Attendance history fetched"));
});

export const getReport = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { month, year, employeeId } = req.query;
  const report = await attendanceService.generateMonthlyReport(
    month,
    year,
    req.user.companyId,
    employeeId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, report, "Attendance report generated"));
});
