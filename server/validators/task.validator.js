import { body, param, query } from "express-validator";

export const createTaskValidator = [
  body("title").notEmpty().withMessage("Title is required").trim(),
  body("description").notEmpty().withMessage("Description is required").trim(),
  body("assignedTo").isMongoId().withMessage("Invalid assignee ID"),
  body("deadline").isISO8601().toDate().withMessage("Invalid deadline format"),
  body("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]).withMessage("Invalid priority"),
];

export const updateTaskStatusValidator = [
  param("id").isMongoId().withMessage("Invalid task ID"),
  body("status").isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).withMessage("Invalid status"),
];

export const getTasksValidator = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("status").optional().isIn(["PENDING", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]),
  query("priority").optional().isIn(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  query("assignedTo").optional().isMongoId(),
];
