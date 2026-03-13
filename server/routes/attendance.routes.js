import { Router } from "express";
import { 
    markAttendance, 
    getHistory, 
    getReport 
} from "../controllers/attendance.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { 
    markAttendanceValidator, 
    getAttendanceValidator, 
    attendanceReportValidator 
} from "../validators/attendance.validator.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);

/**
 * @swagger
 * /attendance/mark:
 *   post:
 *     summary: Mark attendance for an employee (Admin only)
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId]
 *             properties:
 *               employeeId: { type: string }
 *               date: { type: string, format: date }
 *               checkIn: { type: string, format: date-time }
 *               checkOut: { type: string, format: date-time }
 *               status: { type: string, enum: [PRESENT, ABSENT, LATE, HALFDAY] }
 */
router.route("/mark").post(
    authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN"), 
    markAttendanceValidator, 
    markAttendance
);

/**
 * @swagger
 * /attendance:
 *   get:
 *     summary: View attendance history
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *       - in: query
 *         name: startDate
 *         schema: { type: string, format: date }
 *       - in: query
 *         name: endDate
 *         schema: { type: string, format: date }
 */
router.route("/").get(getAttendanceValidator, getHistory);

/**
 * @swagger
 * /attendance/report:
 *   get:
 *     summary: Generate monthly attendance report
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         required: true
 *         schema: { type: integer, minimum: 1, maximum: 12 }
 *       - in: query
 *         name: year
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 */
router.route("/report").get(
    authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN"), 
    attendanceReportValidator, 
    getReport
);

export default router;
