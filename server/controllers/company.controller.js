import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as companyService from "../services/company.service.js";

export const createCompany = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const { adminData, ...companyData } = req.body;
  const result = await companyService.createCompanyWithAdmin(companyData, adminData);

  return res
    .status(201)
    .json(new ApiResponse(201, result, "Company and Admin created successfully"));
});

export const getCompanies = asyncHandler(async (req, res) => {
  const result = await companyService.getAllCompanies(req.query);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Companies fetched successfully"));
});

export const getCompany = asyncHandler(async (req, res) => {
  const company = await companyService.getCompanyById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, company, "Company details fetched"));
});

export const getStats = asyncHandler(async (req, res) => {
  const stats = await companyService.getCompanyStats();
  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Company statistics fetched"));
});
