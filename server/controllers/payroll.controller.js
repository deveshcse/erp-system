import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as payrollService from "../services/payroll.service.js";

export const processPayroll = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const payslip = await payrollService.processPayroll(req.body, req.user.companyId);

  return res
    .status(201)
    .json(new ApiResponse(201, payslip, "Payroll processed and payslip generated"));
});

export const getPayslips = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const payslips = await payrollService.getEmployeePayslips(
    req.params.employeeId,
    req.query,
    req.user
  );

  return res
    .status(200)
    .json(new ApiResponse(200, payslips, "Payslips fetched successfully"));
});
export const getAllPayslips = asyncHandler(async (req, res) => {
  const payslips = await payrollService.getAllCompanyPayslips(
    req.user.companyId,
    req.query
  );

  return res
    .status(200)
    .json(new ApiResponse(200, payslips, "Company payslips fetched successfully"));
});
