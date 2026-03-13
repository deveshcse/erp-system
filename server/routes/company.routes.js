import { Router } from "express";
import { 
    createCompany, 
    getCompanies, 
    getCompany, 
    getStats 
} from "../controllers/company.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { createCompanyValidator, getCompaniesValidator } from "../validators/company.validator.js";

const router = Router();

// All company routes are restricted to SUPER_ADMIN
router.use(verifyJWT);
router.use(authorizeRoles("SUPER_ADMIN"));

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company and its admin user
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [companyName, companyEmail, companyAddress, contactNumber, gstNumber, adminData]
 *             properties:
 *               companyName: { type: string }
 *               companyEmail: { type: string }
 *               companyAddress: { type: string }
 *               contactNumber: { type: string }
 *               gstNumber: { type: string }
 *               adminData:
 *                 type: object
 *                 required: [name, email, password]
 *                 properties:
 *                   name: { type: string }
 *                   email: { type: string }
 *                   password: { type: string }
 */
router.route("/").post(createCompanyValidator, createCompany);

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: List all companies with pagination
 *     tags: [Companies]
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
 */
router.route("/").get(getCompaniesValidator, getCompanies);

/**
 * @swagger
 * /companies/stats:
 *   get:
 *     summary: Get company statistics
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 */
router.route("/stats").get(getStats);

/**
 * @swagger
 * /companies/{id}:
 *   get:
 *     summary: Get company details by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.route("/:id").get(getCompany);

export default router;
