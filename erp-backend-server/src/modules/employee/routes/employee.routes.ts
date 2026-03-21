import { Router } from "express";
import * as ctrl from "../controllers/employee.controller";
import { authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { validate } from "@/middleware/validate.middleware";
import { RESOURCES, ACTIONS } from "@/constants";
import {
  createEmployeeSchemaRefined,
  updateEmployeeSchema,
  listEmployeesQuerySchema,
  employeeIdParamSchema,
} from "../schemas/employee.schema";

// ============================================================================
// EMPLOYEE ROUTES
// ============================================================================

export const employeeRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Employees
 *   description: Employee management — CompanyAdmin only
 */

/**
 * @swagger
 * /employees:
 *   post:
 *     summary: Add a new employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, phoneNumber, department, designation, joiningDate, salary]
 *             properties:
 *               fullName: { type: string, example: "Jane Smith" }
 *               email: { type: string, format: email }
 *               phoneNumber: { type: string, example: "+91 9876543210" }
 *               department: { type: string, example: "Engineering" }
 *               designation: { type: string, example: "Software Engineer" }
 *               joiningDate: { type: string, format: date, example: "2024-01-15" }
 *               salary: { type: number, example: 75000 }
 *               createUserAccount: { type: boolean, default: false }
 *               password: { type: string, description: "Required if createUserAccount is true" }
 *     responses:
 *       201:
 *         description: Employee created
 *       409:
 *         description: Employee with this email already exists
 */
employeeRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.EMPLOYEE, ACTIONS.CREATE),
  validate(createEmployeeSchemaRefined, "body"),
  ctrl.createEmployee
);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: List employees (paginated, filterable)
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [Active, Inactive] }
 *       - in: query
 *         name: department
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paginated employee list
 */
employeeRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.EMPLOYEE, ACTIONS.READ),
  validate(listEmployeesQuerySchema, "query"),
  ctrl.listEmployees
);

employeeRouter.get("/departments", authenticate, authorize(RESOURCES.EMPLOYEE, ACTIONS.READ), ctrl.getDepartments);

/**
 * @swagger
 * /employees/{id}:
 *   get:
 *     summary: Get a single employee by ID
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Employee details
 *       404:
 *         description: Employee not found
 */
employeeRouter.get(
  "/:id",
  authenticate,
  authorize(RESOURCES.EMPLOYEE, ACTIONS.READ),
  validate(employeeIdParamSchema, "params"),
  ctrl.getEmployee
);

employeeRouter.patch(
  "/:id",
  authenticate,
  authorize(RESOURCES.EMPLOYEE, ACTIONS.UPDATE),
  validate(employeeIdParamSchema, "params"),
  validate(updateEmployeeSchema, "body"),
  ctrl.updateEmployee
);

employeeRouter.delete(
  "/:id",
  authenticate,
  authorize(RESOURCES.EMPLOYEE, ACTIONS.DELETE),
  validate(employeeIdParamSchema, "params"),
  ctrl.deleteEmployee
);

export default employeeRouter;
