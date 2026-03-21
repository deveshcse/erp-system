import { Router } from "express";
import * as ctrl from "../controllers/payslip.controller.js";
import { authenticate } from "@/middleware/authenticate.middleware.js";
import { authorize } from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import { RESOURCES, ACTIONS } from "@/constants/index.js";
import {
  createPayslipSchema,
  payslipQuerySchema,
} from "../schemas/payslip.schema.js";

// ============================================================================
// PAYSLIP ROUTES
// ============================================================================

export const payslipRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Payslips
 *   description: Payroll and payslip management
 */

/**
 * @swagger
 * /payslips:
 *   post:
 *     summary: Generate a new payslip for an employee
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, month, year, basicSalary, netSalary]
 *             properties:
 *               employeeId: { type: string }
 *               month: { type: integer, example: 7 }
 *               year: { type: integer, example: 2024 }
 *               basicSalary: { type: number, example: 50000 }
 *               allowances: { type: number, example: 5000 }
 *               deductions: { type: number, example: 2000 }
 *               netSalary: { type: number, example: 53000 }
 *     responses:
 *       201:
 *         description: Payslip generated
 */
payslipRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.PAYROLL, ACTIONS.CREATE),
  validate(createPayslipSchema, "body"),
  ctrl.createPayslip
);

/**
 * @swagger
 * /payslips:
 *   get:
 *     summary: List payslips (paginated)
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: List of payslips
 */
payslipRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.PAYROLL, ACTIONS.READ),
  validate(payslipQuerySchema, "query"),
  ctrl.listPayslips
);

/**
 * @swagger
 * /payslips/{id}:
 *   get:
 *     summary: Get a single payslip by ID
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Payslip details
 */
payslipRouter.get(
  "/:id",
  authenticate,
  authorize(RESOURCES.PAYROLL, ACTIONS.READ),
  ctrl.getPayslip
);

export default payslipRouter;
