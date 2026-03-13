import { Router } from "express";
import { 
    createInvoice, 
    getInvoice, 
    listInvoices 
} from "../controllers/invoice.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { 
    createInvoiceValidator, 
    getInvoiceValidator, 
    listInvoicesValidator 
} from "../validators/invoice.validator.js";

const router = Router();

// Secure all routes
router.use(verifyJWT);
router.use(authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN", "EMPLOYEE"));

/**
 * @swagger
 * /invoices:
 *   post:
 *     summary: Create a new invoice (Admin only)
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [invoiceNumber, customerName, items]
 *             properties:
 *               invoiceNumber: { type: string }
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
 *               paymentStatus: { type: string, enum: [UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED] }
 */
router.route("/").post(
    authorizeRoles("COMPANY_ADMIN", "SUPER_ADMIN"), 
    createInvoiceValidator, 
    createInvoice
);

/**
 * @swagger
 * /invoices:
 *   get:
 *     summary: List invoices
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: invoiceNumber
 *         schema: { type: string }
 *       - in: query
 *         name: customerName
 *         schema: { type: string }
 *       - in: query
 *         name: paymentStatus
 *         schema: { type: string, enum: [UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED] }
 */
router.route("/").get(listInvoicesValidator, listInvoices);

/**
 * @swagger
 * /invoices/{id}:
 *   get:
 *     summary: Get invoice details
 *     tags: [Invoices]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 */
router.route("/:id").get(getInvoiceValidator, getInvoice);

export default router;
