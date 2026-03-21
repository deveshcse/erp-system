import { Router } from "express";
import * as ctrl from "@/controllers/modules.controller";
import { authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { validate } from "@/middleware/validate.middleware";
import { RESOURCES, ACTIONS, ROLES } from "@/constants";
import {
  createEmployeeSchemaRefined,
  updateEmployeeSchema,
  listEmployeesQuerySchema,
  employeeIdParamSchema,
} from "@/validators/employee.validator";
import {
  markAttendanceSchema,
  attendanceQuerySchema,
  generatePayslipSchema,
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
  taskQuerySchema,
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  createQuotationSchema,
  createInvoiceSchema,
  updatePaymentStatusSchema,
  objectIdParamSchema,
} from "@/validators/modules.validator";

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
 *     summary: Generate a payslip for an employee
 *     tags: [Payslips]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [employeeId, month, year, workingDays]
 *             properties:
 *               employeeId: { type: string }
 *               month: { type: integer, minimum: 1, maximum: 12 }
 *               year: { type: integer, minimum: 2000 }
 *               allowances: { type: number, default: 0 }
 *               deductions: { type: number, default: 0 }
 *               workingDays: { type: integer }
 *     responses:
 *       201:
 *         description: Payslip generated with net salary calculated from attendance
 *       409:
 *         description: Payslip for this period already exists
 */
payslipRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.PAYSLIP, ACTIONS.CREATE),
  validate(generatePayslipSchema, "body"),
  ctrl.generatePayslip
);

payslipRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.PAYSLIP, ACTIONS.READ),
  ctrl.listPayslips
);

payslipRouter.get(
  "/:id",
  authenticate,
  authorize(RESOURCES.PAYSLIP, ACTIONS.READ),
  validate(objectIdParamSchema, "params"),
  ctrl.getPayslip
);

payslipRouter.patch(
  "/:id/mark-paid",
  authenticate,
  authorize(RESOURCES.PAYSLIP, ACTIONS.UPDATE),
  validate(objectIdParamSchema, "params"),
  ctrl.markPayslipPaid
);

// ============================================================================
// TASK ROUTES
// ============================================================================

export const taskRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task assignment and progress tracking
 */

taskRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.CREATE),
  validate(createTaskSchema, "body"),
  ctrl.createTask
);

taskRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.READ),
  validate(taskQuerySchema, "query"),
  ctrl.listTasks
);

taskRouter.get(
  "/:id",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.READ),
  validate(objectIdParamSchema, "params"),
  ctrl.getTask
);

// Admin: full update
taskRouter.patch(
  "/:id",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.UPDATE),
  validate(objectIdParamSchema, "params"),
  validate(updateTaskSchema, "body"),
  ctrl.updateTask
);

// Employee: status-only update
taskRouter.patch(
  "/:id/status",
  authenticate,
  authorize(RESOURCES.TASK, ACTIONS.UPDATE),
  validate(objectIdParamSchema, "params"),
  validate(updateTaskStatusSchema, "body"),
  ctrl.updateTaskStatus
);

// ============================================================================
// LEAD ROUTES
// ============================================================================

export const leadRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Leads
 *   description: Customer lead management
 */

leadRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.LEAD, ACTIONS.CREATE),
  validate(createLeadSchema, "body"),
  ctrl.createLead
);

leadRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.LEAD, ACTIONS.READ),
  validate(leadQuerySchema, "query"),
  ctrl.listLeads
);

leadRouter.get(
  "/:id",
  authenticate,
  authorize(RESOURCES.LEAD, ACTIONS.READ),
  validate(objectIdParamSchema, "params"),
  ctrl.getLead
);

leadRouter.patch(
  "/:id",
  authenticate,
  authorize(RESOURCES.LEAD, ACTIONS.UPDATE),
  validate(objectIdParamSchema, "params"),
  validate(updateLeadSchema, "body"),
  ctrl.updateLead
);

// ============================================================================
// QUOTATION ROUTES
// ============================================================================

export const quotationRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Quotations
 *   description: Sales quotation generation
 */

quotationRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.QUOTATION, ACTIONS.CREATE),
  validate(createQuotationSchema, "body"),
  ctrl.createQuotation
);

quotationRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.QUOTATION, ACTIONS.READ),
  ctrl.listQuotations
);

quotationRouter.get(
  "/:id",
  authenticate,
  authorize(RESOURCES.QUOTATION, ACTIONS.READ),
  validate(objectIdParamSchema, "params"),
  ctrl.getQuotation
);

// ============================================================================
// INVOICE ROUTES
// ============================================================================

export const invoiceRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Invoices
 *   description: Invoice management and payment tracking
 */

invoiceRouter.post(
  "/",
  authenticate,
  authorize(RESOURCES.INVOICE, ACTIONS.CREATE),
  validate(createInvoiceSchema, "body"),
  ctrl.createInvoice
);

invoiceRouter.get(
  "/",
  authenticate,
  authorize(RESOURCES.INVOICE, ACTIONS.READ),
  ctrl.listInvoices
);

invoiceRouter.get(
  "/:id",
  authenticate,
  authorize(RESOURCES.INVOICE, ACTIONS.READ),
  validate(objectIdParamSchema, "params"),
  ctrl.getInvoice
);

invoiceRouter.patch(
  "/:id/payment",
  authenticate,
  authorize(RESOURCES.INVOICE, ACTIONS.UPDATE),
  validate(objectIdParamSchema, "params"),
  validate(updatePaymentStatusSchema, "body"),
  ctrl.updateInvoicePayment
);
