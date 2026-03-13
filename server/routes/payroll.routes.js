import { Router } from "express";
import { 
    processPayroll, 
    getPayslips,
    getAllPayslips
} from "../controllers/payroll.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { 
    processPayrollValidator, 
    getPayslipsValidator 
} from "../validators/payroll.validator.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);

/**
 * @swagger
 * /payroll/process:
 *   post:
 *     summary: Process payroll and generate payslip (Admin only)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, month, workingDays]
 *             properties:
 *               employeeId: { type: string }
 *               month: { type: string, example: "2024-03" }
 *               workingDays: { type: number }
 *               leaveDays: { type: number }
 *               allowances: { type: number }
 *               deductions: { type: number }
 */
router.route("/process").post(
    authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN"), 
    processPayrollValidator, 
    processPayroll
);

/**
 * @swagger
 * /payroll/payslips/{employeeId}:
 *   get:
 *     summary: View payslips for an employee
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: employeeId
 *         required: true
 *         schema: { type: string }
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "2024-03" }
 */
router.route("/payslips/:employeeId").get(
    getPayslipsValidator, 
    getPayslips
);

/**
 * @swagger
 * /payroll/all:
 *   get:
 *     summary: View all payslips for the company (Admin only)
 *     tags: [Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: month
 *         schema: { type: string, example: "2024-03" }
 */
router.route("/all").get(
    authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN"),
    getAllPayslips
);

export default router;
