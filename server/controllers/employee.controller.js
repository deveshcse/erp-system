import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as employeeService from "../services/employee.service.js";

export const createEmployee = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const employee = await employeeService.addEmployee(req.body, req.user.companyId);

  return res
    .status(201)
    .json(new ApiResponse(201, employee, "Employee added successfully"));
});

export const updateEmployee = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const employee = await employeeService.updateEmployeeDetails(
    req.params.id,
    req.body,
    req.user.companyId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, employee, "Employee updated successfully"));
});

export const deleteEmployee = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      throw new ApiError(400, "Validation Error", errors.array());
  }

  await employeeService.deleteEmployeeById(req.params.id, req.user.companyId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Employee deleted successfully"));
});

export const getEmployees = asyncHandler(async (req, res) => {
  const result = await employeeService.listEmployees(req.query, req.user.companyId);
  return res
    .status(200)
    .json(new ApiResponse(200, result, "Employees fetched successfully"));
});
