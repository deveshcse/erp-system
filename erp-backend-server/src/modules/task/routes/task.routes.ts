import { Router } from "express";
import * as ctrl from "../controllers/task.controller";
import { authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { validate } from "@/middleware/validate.middleware";
import { RESOURCES, ACTIONS } from "@/constants";
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from "../schemas/task.schema";

// ============================================================================
// TASK ROUTES
// ============================================================================

export const taskRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management and tracking
 */

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, description, assignedTo, deadline]
 *             properties:
 *               title: { type: string, example: "Fix bug in login" }
 *               description: { type: string, example: "Users can't log in from Safari" }
 *               assignedTo: { type: string, description: "Employee ID" }
 *               deadline: { type: string, format: date-time }
 *               priority: { type: string, enum: [Low, Medium, High, Critical] }
 *     responses:
 *       201:
 *         description: Task created
 */
taskRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.CREATE),
  validate(createTaskSchema, "body"),
  ctrl.createTask
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: List tasks (paginated)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Pending, InProgress, Completed, Cancelled] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [Low, Medium, High, Critical] }
 *     responses:
 *       200:
 *         description: List of tasks
 */
taskRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.READ),
  validate(taskQuerySchema, "query"),
  ctrl.listTasks
);

/**
 * @swagger
 * /tasks/{id}:
 *   get:
 *     summary: Get a single task by ID
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Task details
 */
taskRouter.get(
  "/:id",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.READ),
  ctrl.getTask
);

taskRouter.patch(
  "/:id",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.UPDATE),
  validate(updateTaskSchema, "body"),
  ctrl.updateTask
);

taskRouter.patch(
  "/:id/status",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.UPDATE), // Specific check inside controller/service if needed, but here we just allow UPDATE
  ctrl.updateTaskStatus
);

taskRouter.delete(
  "/:id",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.DELETE),
  ctrl.deleteTask
);

export default taskRouter;
