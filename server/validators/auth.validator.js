import { body } from "express-validator";

export const registerValidator = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .isIn(["SUPER_ADMIN", "COMPANY_ADMIN", "EMPLOYEE"])
    .withMessage("Invalid role"),
  body("companyId").optional().isMongoId().withMessage("Invalid company ID"),
];

export const loginValidator = [
  body("email").isEmail().withMessage("Invalid email format").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
