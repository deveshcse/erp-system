import { Router } from "express";
import * as companyController from "../controllers/company.controller.js";
import { authenticate } from "@/middleware/authenticate.middleware.js";
import { authorize } from "@/middleware/authorize.middleware.js";
import { validate } from "@/middleware/validate.middleware.js";
import { RESOURCES, ACTIONS } from "@/constants/index.js";
import {
  createCompanySchema,
  updateCompanySchema,
  companyIdParamSchema,
} from "../schemas/company.schema.js";

const router = Router();

// All company routes require authentication + COMPANY resource permission.
// The authorize middleware consults the central permission matrix.

/**
 * @swagger
 * tags:
 *   name: Companies
 *   description: Company management — SuperAdmin only
 */

/**
 * @swagger
 * /companies:
 *   post:
 *     summary: Create a new company with its initial admin account
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [company, admin]
 *             properties:
 *               company:
 *                 type: object
 *                 required: [name, email, address, contactNumber]
 *                 properties:
 *                   name: { type: string, example: "Acme Corp" }
 *                   email: { type: string, format: email, example: "info@acme.com" }
 *                   address: { type: string, example: "123 Main St, Mumbai" }
 *                   contactNumber: { type: string, example: "+91 9876543210" }
 *                   gstNumber: { type: string, example: "29ABCDE1234F1Z5" }
 *               admin:
 *                 type: object
 *                 required: [name, email, password]
 *                 properties:
 *                   name: { type: string, example: "John Doe" }
 *                   email: { type: string, format: email, example: "john@acme.com" }
 *                   password: { type: string, example: "Admin@1234" }
 *     responses:
 *       201:
 *         description: Company and admin account created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden — SuperAdmin only
 *       409:
 *         description: Company or admin email already exists
 */
router.post(
  "/",
  authenticate,
  authorize(RESOURCES.COMPANY, ACTIONS.CREATE),
  validate(createCompanySchema, "body"),
  companyController.createCompany
);

/**
 * @swagger
 * /companies:
 *   get:
 *     summary: List all companies (paginated)
 *     tags: [Companies]
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
 *         name: search
 *         schema: { type: string }
 *         description: Full-text search on company name
 *     responses:
 *       200:
 *         description: Paginated list of companies
 */
router.get(
  "/",
  authenticate,
  authorize(RESOURCES.COMPANY, ACTIONS.READ),
  companyController.listCompanies
);

/**
 * @swagger
 * /companies/{companyId}:
 *   get:
 *     summary: Get a single company by ID
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company details
 *       404:
 *         description: Company not found
 */
router.get(
  "/:companyId",
  authenticate,
  authorize(RESOURCES.COMPANY, ACTIONS.READ),
  validate(companyIdParamSchema, "params"),
  companyController.getCompany
);

/**
 * @swagger
 * /companies/{companyId}:
 *   patch:
 *     summary: Update company details
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company updated
 */
router.patch(
  "/:companyId",
  authenticate,
  authorize(RESOURCES.COMPANY, ACTIONS.UPDATE),
  validate(companyIdParamSchema, "params"),
  validate(updateCompanySchema, "body"),
  companyController.updateCompany
);

/**
 * @swagger
 * /companies/{companyId}/stats:
 *   get:
 *     summary: Get aggregate statistics for a company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: companyId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Company statistics
 */
router.get(
  "/:companyId/stats",
  authenticate,
  authorize(RESOURCES.COMPANY, ACTIONS.READ),
  validate(companyIdParamSchema, "params"),
  companyController.getCompanyStats
);

export default router;
