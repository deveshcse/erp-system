import { body, param, query } from "express-validator";

export const createInvoiceValidator = [
  body("invoiceNumber").notEmpty().withMessage("Invoice number is required").trim(),
  body("customerName").notEmpty().withMessage("Customer name is required").trim(),
  body("items").isArray({ min: 1 }).withMessage("At least one item is required"),
  body("items.*.name").notEmpty().withMessage("Item name is required").trim(),
  body("items.*.quantity").isNumeric({ min: 1 }).withMessage("Quantity must be at least 1"),
  body("items.*.price").isNumeric({ min: 0 }).withMessage("Price must be a positive number"),
  body("tax").optional().isNumeric({ min: 0 }).withMessage("Tax must be a positive number"),
  body("paymentStatus").optional().isIn(["PENDING", "PAID", "PARTIALLY_PAID"]),
];

export const getInvoiceValidator = [
  param("id").isMongoId().withMessage("Invalid invoice ID"),
];

export const listInvoicesValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("invoiceNumber").optional().trim(),
  query("customerName").optional().trim(),
  query("paymentStatus").optional().isIn(["PENDING", "PAID", "PARTIALLY_PAID"]),
];
