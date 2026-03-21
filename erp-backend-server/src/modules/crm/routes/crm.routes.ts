import { Router } from "express";
import * as ctrl from "../controllers/crm.controller";
import { authenticate } from "@/middleware/authenticate.middleware";
import { authorize } from "@/middleware/authorize.middleware";
import { validate } from "@/middleware/validate.middleware";
import { RESOURCES, ACTIONS } from "@/constants";
import {
  createLeadSchema,
  updateLeadSchema,
  leadQuerySchema,
  createQuotationSchema,
  createInvoiceSchema,
  updatePaymentStatusSchema,
  objectIdParamSchema,
} from "../schemas/crm.schema";

// ============================================================================
// CRM ROUTES
// ============================================================================

export const crmRouter = Router();

// --- Leads ---
crmRouter.post(
  "/leads",
  authenticate,
  authorize(RESOURCES.LEAD, ACTIONS.CREATE),
  validate(createLeadSchema, "body"),
  ctrl.createLead
);

crmRouter.get(
  "/leads",
  authenticate,
  authorize(RESOURCES.LEAD, ACTIONS.READ),
  validate(leadQuerySchema, "query"),
  ctrl.listLeads
);

crmRouter.get(
  "/leads/:id",
  authenticate,
  authorize(RESOURCES.LEAD, ACTIONS.READ),
  validate(objectIdParamSchema, "params"),
  ctrl.getLead
);

crmRouter.patch(
  "/leads/:id",
  authenticate,
  authorize(RESOURCES.LEAD, ACTIONS.UPDATE),
  validate(objectIdParamSchema, "params"),
  validate(updateLeadSchema, "body"),
  ctrl.updateLead
);

// --- Quotations ---
crmRouter.post(
  "/quotations",
  authenticate,
  authorize(RESOURCES.QUOTATION, ACTIONS.CREATE),
  validate(createQuotationSchema, "body"),
  ctrl.createQuotation
);

crmRouter.get(
  "/quotations",
  authenticate,
  authorize(RESOURCES.QUOTATION, ACTIONS.READ),
  ctrl.listQuotations
);

crmRouter.get(
  "/quotations/:id",
  authenticate,
  authorize(RESOURCES.QUOTATION, ACTIONS.READ),
  validate(objectIdParamSchema, "params"),
  ctrl.getQuotation
);

// --- Invoices ---
crmRouter.post(
  "/invoices",
  authenticate,
  authorize(RESOURCES.INVOICE, ACTIONS.CREATE),
  validate(createInvoiceSchema, "body"),
  ctrl.createInvoice
);

crmRouter.get(
  "/invoices",
  authenticate,
  authorize(RESOURCES.INVOICE, ACTIONS.READ),
  ctrl.listInvoices
);

crmRouter.get(
  "/invoices/:id",
  authenticate,
  authorize(RESOURCES.INVOICE, ACTIONS.READ),
  validate(objectIdParamSchema, "params"),
  ctrl.getInvoice
);

crmRouter.patch(
  "/invoices/:id/payment",
  authenticate,
  authorize(RESOURCES.INVOICE, ACTIONS.UPDATE),
  validate(objectIdParamSchema, "params"),
  validate(updatePaymentStatusSchema, "body"),
  ctrl.updateInvoicePayment
);

export default crmRouter;
