import { Router } from "express";
import { 
    createTask, 
    updateStatus, 
    getTasks 
} from "../controllers/task.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { 
    createTaskValidator, 
    updateTaskStatusValidator, 
    getTasksValidator 
} from "../validators/task.validator.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);

/**
 * @swagger
 * /tasks:
 *   post:
 *     summary: Create and assign a new task (Admin only)
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
 *               title: { type: string }
 *               description: { type: string }
 *               assignedTo: { type: string }
 *               deadline: { type: string, format: date-time }
 *               priority: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 */
router.route("/").post(
    authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN"), 
    createTaskValidator, 
    createTask
);

/**
 * @swagger
 * /tasks:
 *   get:
 *     summary: View tasks (Employees see their own, Admins see all in company)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED, ON_HOLD] }
 *       - in: query
 *         name: priority
 *         schema: { type: string, enum: [LOW, MEDIUM, HIGH, URGENT] }
 */
router.route("/").get(getTasksValidator, getTasks);

/**
 * @swagger
 * /tasks/{id}/status:
 *   put:
 *     summary: Update task status (Employees can update their assigned tasks)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status: { type: string, enum: [PENDING, IN_PROGRESS, COMPLETED, ON_HOLD] }
 */
router.route("/:id/status").put(updateTaskStatusValidator, updateStatus);

export default router;
