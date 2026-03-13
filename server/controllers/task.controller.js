import { validationResult } from "express-validator";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as taskService from "../services/task.service.js";

export const createTask = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const task = await taskService.createTask(
    req.body,
    req.user._id,
    req.user.companyId
  );

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

export const updateStatus = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Error", errors.array());
  }

  const task = await taskService.updateTaskStatus(
    req.params.id,
    req.body.status,
    req.user,
    req.user.companyId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task status updated"));
});

export const getTasks = asyncHandler(async (req, res) => {
  const result = await taskService.listTasks(
    req.query,
    req.user,
    req.user.companyId
  );

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Tasks fetched successfully"));
});
