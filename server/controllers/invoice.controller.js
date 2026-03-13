import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as invoiceService from "../services/invoice.service.js";

export const createInvoice = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const invoice = await invoiceService.createInvoice(req.body, req.user.companyId);

  return res
    .status(201)
    .json(new ApiResponse(201, invoice, "Invoice created successfully"));
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await invoiceService.getInvoiceById(req.params.id, req.user.companyId);
  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice fetched successfully"));
});

export const listInvoices = asyncHandler(async (req, res) => {
  const result = await invoiceService.listInvoices(req.query, req.user.companyId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Invoices fetched successfully"));
});
