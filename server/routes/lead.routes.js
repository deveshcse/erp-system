import { Router } from "express";
import { 
    createLead, 
    updateLead, 
    getLeads 
} from "../controllers/lead.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { 
    createLeadValidator, 
    updateLeadValidator, 
    getLeadsValidator 
} from "../validators/lead.validator.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);
// Restrict to admins and relevant employees (for now, let's keep it to Admin/SUPER_ADMIN for creation, maybe Employee can view/update)
// The prompt didn't specify roles for Leads, but usually Sales/Admin. Let's allow Admin for all and Employee to view/update.
router.use(authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN", "EMPLOYEE"));

/**
 * @swagger
 * /leads:
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, phone]
 *             properties:
 *               customerName: { type: string }
 *               companyName: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               leadSource: { type: string }
 *               status: { type: string, enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST] }
 *               notes: { type: string }
 */
router.route("/").post(authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN"), createLeadValidator, createLead);

/**
 * @swagger
 * /leads:
 *   get:
 *     summary: List leads with pagination and filters
 *     tags: [Leads]
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
 *         name: status
 *         schema: { type: string, enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST] }
 */
router.route("/").get(getLeadsValidator, getLeads);

/**
 * @swagger
 * /leads/{id}:
 *   put:
 *     summary: Update lead details
 *     tags: [Leads]
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
 *             properties:
 *               customerName: { type: string }
 *               companyName: { type: string }
 *               phone: { type: string }
 *               email: { type: string }
 *               status: { type: string, enum: [NEW, CONTACTED, QUALIFIED, PROPOSAL, NEGOTIATION, WON, LOST] }
 *               notes: { type: string }
 */
router.route("/:id").put(updateLeadValidator, updateLead);

export default router;
