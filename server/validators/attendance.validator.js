import { body, query } from "express-validator";

export const markAttendanceValidator = [
  body("employeeId").isMongoId().withMessage("Invalid employee ID"),
  body("date").optional().isISO8601().toDate().withMessage("Invalid date format"),
  body("checkIn").optional().isISO8601().toDate().withMessage("Invalid check-in time"),
  body("checkOut").optional().isISO8601().toDate().withMessage("Invalid check-out time"),
  body("status").optional().isIn(["PRESENT", "ABSENT", "LATE", "HALFDAY"]).withMessage("Invalid status"),
];

export const getAttendanceValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("startDate").optional().isISO8601().toDate(),
  query("endDate").optional().isISO8601().toDate(),
  query("employeeId").optional().isMongoId().withMessage("Invalid employee ID"),
];

export const attendanceReportValidator = [
  query("month").isInt({ min: 1, max: 12 }).withMessage("Month must be 1-12").toInt(),
  query("year").isInt({ min: 2000, max: 2100 }).withMessage("Invalid year").toInt(),
  query("employeeId").optional().isMongoId().withMessage("Invalid employee ID"),
];
