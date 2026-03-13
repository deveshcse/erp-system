import { body, query } from "express-validator";

export const createCompanyValidator = [
  body("companyName").notEmpty().withMessage("Company name is required").trim(),
  body("companyEmail").isEmail().withMessage("Invalid company email").normalizeEmail(),
  body("companyAddress").notEmpty().withMessage("Company address is required"),
  body("contactNumber").notEmpty().withMessage("Contact number is required"),
  body("gstNumber").notEmpty().withMessage("GST number is required"),
  body("adminData.name").notEmpty().withMessage("Admin name is required"),
  body("adminData.email").isEmail().withMessage("Invalid admin email"),
  body("adminData.password").isLength({ min: 6 }).withMessage("Admin password must be at least 6 characters"),
];

export const getCompaniesValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("search").optional().trim(),
];
