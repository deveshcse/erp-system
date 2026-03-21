import { z } from "zod";
import {
  ATTENDANCE_STATUS,
  TASK_STATUS,
  TASK_PRIORITY,
  LEAD_STATUS,
  LEAD_SOURCE,
  PAYMENT_STATUS,
} from "@/constants";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format");

// ============================================================================
// ATTENDANCE
// ============================================================================

export const markAttendanceSchema = z.object({
  employeeId: objectIdSchema,
  date: z
    .string({ error: "Date is required" })
    .date("Date must be in YYYY-MM-DD format")
    .transform((val) => new Date(val)),
  checkInTime: z.string().datetime({ offset: true }).optional().nullable(),
  checkOutTime: z.string().datetime({ offset: true }).optional().nullable(),
  status: z.nativeEnum(ATTENDANCE_STATUS),
  notes: z.string().max(500).optional().nullable(),
});

export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;

export const attendanceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  employeeId: objectIdSchema.optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).optional(),
  status: z.nativeEnum(ATTENDANCE_STATUS).optional(),
});

export type AttendanceQuery = z.infer<typeof attendanceQuerySchema>;

// ============================================================================
// PAYSLIP
// ============================================================================

export const generatePayslipSchema = z.object({
  employeeId: objectIdSchema,
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000),
  allowances: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  workingDays: z.number().int().min(1).max(31),
});

export type GeneratePayslipInput = z.infer<typeof generatePayslipSchema>;

// ============================================================================
// TASK
// ============================================================================

export const createTaskSchema = z.object({
  title: z
    .string({ error: "Title is required" })
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters")
    .trim(),

  description: z
    .string({ error: "Description is required" })
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description must not exceed 2000 characters")
    .trim(),

  assignedTo: objectIdSchema,

  deadline: z
    .string({ error: "Deadline is required" })
    .datetime({ offset: true, message: "Deadline must be a valid ISO 8601 datetime" })
    .transform((val) => new Date(val))
    .refine((date) => date > new Date(), "Deadline must be in the future"),

  priority: z.nativeEnum(TASK_PRIORITY).default(TASK_PRIORITY.MEDIUM),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  title: z.string().min(3).max(200).trim().optional(),
  description: z.string().min(10).max(2000).trim().optional(),
  assignedTo: objectIdSchema.optional(),
  deadline: z
    .string()
    .datetime({ offset: true })
    .transform((val) => new Date(val))
    .optional(),
  priority: z.nativeEnum(TASK_PRIORITY).optional(),
  status: z.nativeEnum(TASK_STATUS).optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

// Employee-only update — only status can be changed
export const updateTaskStatusSchema = z.object({
  status: z.nativeEnum(TASK_STATUS),
});

export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(TASK_STATUS).optional(),
  priority: z.nativeEnum(TASK_PRIORITY).optional(),
  assignedTo: objectIdSchema.optional(),
  search: z.string().trim().optional(),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;

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

// ============================================================================
// Shared
// ============================================================================

export const objectIdParamSchema = z.object({
  id: objectIdSchema,
});
