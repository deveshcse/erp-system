import { Router } from "express";
import { 
    createEmployee, 
    updateEmployee, 
    deleteEmployee, 
    getEmployees 
} from "../controllers/employee.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { 
    createEmployeeValidator, 
    updateEmployeeValidator, 
    getEmployeesValidator,
    employeeIdParamValidator
} from "../validators/employee.validator.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);
router.use(authorizeRoles("COMPANY_ADMIN"));

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
 *             required: [employeeId, fullName, email, phoneNumber, department, designation, joiningDate, salary]
 *             properties:
 *               employeeId: { type: string }
 *               fullName: { type: string }
 *               email: { type: string }
 *               phoneNumber: { type: string }
 *               department: { type: string }
 *               designation: { type: string }
 *               joiningDate: { type: string, format: date }
 *               salary: { type: number }
 */
router.route("/").post(createEmployeeValidator, createEmployee);

/**
 * @swagger
 * /employees:
 *   get:
 *     summary: List employees with pagination and filters
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: department
 *         schema: { type: string }
 */
router.route("/").get(getEmployeesValidator, getEmployees);

/**
 * @swagger
 * /employees/{id}:
 *   put:
 *     summary: Update employee details
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.route("/:id").put(updateEmployeeValidator, updateEmployee);

/**
 * @swagger
 * /employees/{id}:
 *   delete:
 *     summary: Delete an employee
 *     tags: [Employees]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.route("/:id").delete(employeeIdParamValidator, deleteEmployee);

export default router;
