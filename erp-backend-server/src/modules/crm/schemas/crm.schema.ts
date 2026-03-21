import { z } from "zod";
import { LEAD_SOURCE, LEAD_STATUS, PAYMENT_STATUS } from "@/constants";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format");

// ============================================================================
// LEAD
// ============================================================================

export const createLeadSchema = z.object({
  customerName: z
    .string({ error: "Customer name is required" })
    .min(2, "Customer name must be at least 2 characters")
    .max(150)
    .trim(),

  customerCompanyName: z.string().max(200).trim().optional().nullable(),

  phoneNumber: z
    .string({ error: "Phone number is required" })
    .min(7)
    .max(20)
    .trim(),

  email: z
    .string({ error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  leadSource: z.nativeEnum(LEAD_SOURCE),
  notes: z.string().max(2000).optional().nullable(),
  assignedTo: objectIdSchema.optional().nullable(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;

export const updateLeadSchema = z.object({
  customerName: z.string().min(2).max(150).trim().optional(),
  customerCompanyName: z.string().max(200).trim().optional().nullable(),
  phoneNumber: z.string().min(7).max(20).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  leadSource: z.nativeEnum(LEAD_SOURCE).optional(),
  status: z.nativeEnum(LEAD_STATUS).optional(),
  notes: z.string().max(2000).optional().nullable(),
  assignedTo: objectIdSchema.optional().nullable(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const leadQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(LEAD_STATUS).optional(),
  source: z.nativeEnum(LEAD_SOURCE).optional(),
  search: z.string().trim().optional(),
});

export type LeadQuery = z.infer<typeof leadQuerySchema>;

// ============================================================================
// QUOTATION
// ============================================================================

const lineItemSchema = z.object({
  description: z.string().min(1).max(500).trim(),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  taxPercent: z.number().min(0).max(100).default(0),
});

export const createQuotationSchema = z.object({
  customerId: objectIdSchema.optional().nullable(),
  customerName: z.string({ error: "Customer name is required" }).min(2).max(150).trim(),
  customerEmail: z.string({ error: "Customer email is required" }).email().toLowerCase().trim(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
  validityDate: z
    .string({ error: "Validity date is required" })
    .date("Validity date must be a valid date (YYYY-MM-DD)")
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), "Validity date must be in the future"),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateQuotationInput = z.infer<typeof createQuotationSchema>;

// ============================================================================
// INVOICE
// ============================================================================

export const createInvoiceSchema = z.object({
  quotationId: objectIdSchema.optional().nullable(),
  customerName: z.string({ error: "Customer name is required" }).min(2).max(150).trim(),
  customerEmail: z.string({ error: "Customer email is required" }).email().toLowerCase().trim(),
  lineItems: z
    .array(lineItemSchema)
    .min(1, "At least one line item is required"),
  dueDate: z
    .string({ error: "Due date is required" })
    .date("Due date must be a valid date (YYYY-MM-DD)")
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), "Due date must be in the future"),
  notes: z.string().max(2000).optional().nullable(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

export const updatePaymentStatusSchema = z.object({
  paymentStatus: z.nativeEnum(PAYMENT_STATUS),
  amountPaid: z.number().min(0).optional(),
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;

export const objectIdParamSchema = z.object({
  id: objectIdSchema,
});
