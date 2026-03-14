import { body, param, query } from "express-validator";

export const createLeadValidator = [
  body("customerName").notEmpty().withMessage("Customer name is required").trim(),
  body("companyName").optional().trim(),
  body("phone").notEmpty().withMessage("Phone number is required").trim(),
  body("email").optional().isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("leadSource").optional().trim(),
  body("status").optional().isIn(["NEW", "CONTACTED", "NEGOTIATION", "LOST", "CLOSED"]).withMessage("Invalid status"),
  body("notes").optional().trim(),
];

export const updateLeadValidator = [
  param("id").isMongoId().withMessage("Invalid lead ID"),
  body("customerName").optional().notEmpty().withMessage("Customer name cannot be empty").trim(),
  body("companyName").optional().trim(),
  body("phone").optional().notEmpty().withMessage("Phone number cannot be empty").trim(),
  body("email").optional().isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("status").optional().isIn(["NEW", "CONTACTED", "NEGOTIATION", "LOST", "CLOSED"]).withMessage("Invalid status"),
  body("notes").optional().trim(),
];

export const getLeadsValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().trim(),
  query("status").optional().isIn(["NEW", "CONTACTED", "NEGOTIATION", "CLOSED", "LOST"]),
];
