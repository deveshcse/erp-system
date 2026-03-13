import { Router } from "express";
import { 
    createQuotation, 
    getQuotation, 
    listQuotations 
} from "../controllers/quotation.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { 
    createQuotationValidator, 
    getQuotationValidator, 
    listQuotationsValidator 
} from "../validators/quotation.validator.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);
router.use(authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN", "EMPLOYEE"));

/**
 * @swagger
 * /quotations:
 *   post:
 *     summary: Create a new quotation
 *     tags: [Quotations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [customerName, items, validityDate]
 *             properties:
 *               customerName: { type: string }
 *               items: 
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name: { type: string }
 *                     quantity: { type: number }
 *                     price: { type: number }
 *               tax: { type: number }
 *               validityDate: { type: string, format: date-time }
 *               status: { type: string, enum: [DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED] }
 */
router.route("/").post(
    authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN"), 
    createQuotationValidator, 
    createQuotation
);

/**
 * @swagger
 * /quotations:
 *   get:
 *     summary: List quotations
 *     tags: [Quotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: customerName
 *         schema: { type: string }
 *       - in: query
 *         name: status
 *         schema: { type: string, enum: [DRAFT, SENT, ACCEPTED, REJECTED, EXPIRED] }
 */
router.route("/").get(listQuotationsValidator, listQuotations);

/**
 * @swagger
 * /quotations/{id}:
 *   get:
 *     summary: Get quotation details
 *     tags: [Quotations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.route("/:id").get(getQuotationValidator, getQuotation);

export default router;
