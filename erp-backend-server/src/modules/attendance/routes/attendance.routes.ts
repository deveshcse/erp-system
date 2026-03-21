import { Router } from "express";
import * as ctrl from "../controllers/attendance.controller.js";
import { authenticate } from "@/middleware/authenticate.middleware.js";
import { authorize } from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import { RESOURCES, ACTIONS } from "@/constants/index.js";
import {
  markAttendanceSchema,
  attendanceQuerySchema,
} from "../schemas/attendance.schema.js";

// ============================================================================
// ATTENDANCE ROUTES
// ============================================================================

export const attendanceRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance tracking and reporting
 */

/**
 * @swagger
 * /attendance:
 *   post:
 *     summary: Mark or update attendance for an employee
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, date, status]
 *             properties:
 *               employeeId: { type: string }
 *               date: { type: string, format: date, example: "2024-07-15" }
 *               status: { type: string, enum: [Present, Absent, Leave, HalfDay] }
 *               checkInTime: { type: string, format: date-time }
 *               checkOutTime: { type: string, format: date-time }
 *               notes: { type: string }
 *     responses:
 *       201:
 *         description: Attendance marked
 */
attendanceRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.ATTENDANCE, ACTIONS.CREATE),
  validate(markAttendanceSchema, "body"),
  ctrl.markAttendance
);

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: List attendance records (paginated, filterable)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: month
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: year
 *         schema: { type: integer }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Present, Absent, Leave, HalfDay] }
 *     responses:
 *       200:
 *         description: Attendance records
 */
attendanceRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.ATTENDANCE, ACTIONS.READ),
  validate(attendanceQuerySchema, "query"),
  ctrl.listAttendance
);

/**
 * @swagger
 * /attendance/report/{year}/{month}:
 *   get:
 *     summary: Get monthly attendance report for all employees
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: year
 *         required: true
 *         schema: { type: integer, example: 2024 }
 *       - in: path
 *         name: month
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 12, example: 7 }
 *     responses:
 *       200:
 *         description: Monthly attendance summary per employee
 */
attendanceRouter.get(
  "/report/:year/:month",
  authenticate,
  authorize(RESOURCES.ATTENDANCE, ACTIONS.READ),
  ctrl.getMonthlyAttendanceReport
);

export default attendanceRouter;
