import { body, param, query } from "express-validator";

export const processPayrollValidator = [
  body("employeeId").isMongoId().withMessage("Invalid employee ID"),
  body("month").matches(/^\d{4}-\d{2}$/).withMessage("Month must be in YYYY-MM format"),
  body("workingDays").isNumeric().withMessage("Working days must be a number"),
  body("leaveDays").optional().isNumeric().withMessage("Leave days must be a number"),
  body("allowances").optional().isNumeric().withMessage("Allowances must be a number"),
  body("deductions").optional().isNumeric().withMessage("Deductions must be a number"),
];

export const getPayslipsValidator = [
  param("employeeId").isMongoId().withMessage("Invalid employee ID"),
  query("month").optional().matches(/^\d{4}-\d{2}$/).withMessage("Month must be in YYYY-MM format"),
];
