import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as quotationService from "../services/quotation.service.js";

export const createQuotation = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const quotation = await quotationService.createQuotation(req.body, req.user.companyId);

  return res
    .status(201)
    .json(new ApiResponse(201, quotation, "Quotation created successfully"));
});

export const getQuotation = asyncHandler(async (req, res) => {
  const quotation = await quotationService.getQuotationById(req.params.id, req.user.companyId);
  return res
    .status(200)
    .json(new ApiResponse(200, quotation, "Quotation fetched successfully"));
});

export const listQuotations = asyncHandler(async (req, res) => {
  const result = await quotationService.listQuotations(req.query, req.user.companyId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Quotations fetched successfully"));
});
