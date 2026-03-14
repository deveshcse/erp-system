import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as leadService from "../services/lead.service.js";

export const createLead = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const lead = await leadService.createLead(req.body, req.user.companyId);

  return res
    .status(201)
    .json(new ApiResponse(201, lead, "Lead created successfully"));
});

export const updateLead = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const lead = await leadService.updateLeadDetails(
    req.params.id,
    req.body,
    req.user.companyId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, lead, "Lead updated successfully"));
});

export const getLeads = asyncHandler(async (req, res) => {
  const result = await leadService.listLeads(req.query, req.user.companyId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Leads fetched successfully"));
});

export const deleteLead = asyncHandler(async (req, res) => {
  await leadService.deleteLead(req.params.id, req.user.companyId);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Lead deleted successfully"));
});
