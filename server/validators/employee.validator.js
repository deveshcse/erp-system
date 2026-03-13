import { body, query, param } from "express-validator";

export const createEmployeeValidator = [
  body("employeeId").notEmpty().withMessage("Employee ID is required").trim(),
  body("fullName").notEmpty().withMessage("Full name is required").trim(),
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("phoneNumber").notEmpty().withMessage("Phone number is required"),
  body("department").notEmpty().withMessage("Department is required").trim(),
  body("designation").notEmpty().withMessage("Designation is required").trim(),
  body("joiningDate").isISO8601().toDate().withMessage("Invalid joining date"),
  body("salary").isNumeric().withMessage("Salary must be a number"),
  body("status").optional().isIn(["ACTIVE", "INACTIVE", "TERMINATED", "ON_LEAVE"]).withMessage("Invalid status"),
];

export const updateEmployeeValidator = [
  param("id").isMongoId().withMessage("Invalid employee database ID"),
  body("fullName").optional().notEmpty().withMessage("Full name cannot be empty").trim(),
  body("email").optional().isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("phoneNumber").optional().notEmpty().withMessage("Phone number cannot be empty"),
  body("department").optional().notEmpty().withMessage("Department cannot be empty").trim(),
  body("designation").optional().notEmpty().withMessage("Designation cannot be empty").trim(),
  body("salary").optional().isNumeric().withMessage("Salary must be a number"),
  body("status").optional().isIn(["ACTIVE", "INACTIVE", "TERMINATED", "ON_LEAVE"]).withMessage("Invalid status"),
];

export const getEmployeesValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().trim(),
  query("department").optional().trim(),
];

export const employeeIdParamValidator = [
    param("id").isMongoId().withMessage("Invalid employee ID")
];
