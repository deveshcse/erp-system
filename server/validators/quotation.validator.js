import { body, param, query } from "express-validator";

export const createQuotationValidator = [
  body("customerName").notEmpty().withMessage("Customer name is required").trim(),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.name").notEmpty().withMessage("Item name is required").trim(),
  body("items.*.quantity").isNumeric({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("items.*.price").isNumeric({ min: 0 }).withMessage("Price must be a positive number"),
  body("tax").optional().isNumeric({ min: 0 }).withMessage("Tax must be a positive number"),
  body("validityDate").isISO8601().toDate().withMessage("Invalid validity date"),
];

export const getQuotationValidator = [
  param("id").isMongoId().withMessage("Invalid quotation ID"),
];

export const listQuotationsValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("customerName").optional().trim(),
];
