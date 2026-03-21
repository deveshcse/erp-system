import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format");

// ============================================================================
// PAYSLIP
// ============================================================================

export const createPayslipSchema = z.object({
  employeeId: objectIdSchema,
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000),
  basicSalary: z.number().min(0),
  workingDays: z.coerce.number().int().positive().default(30),
  allowances: z.number().min(0).default(0),
  deductions: z.number().min(0).default(0),
  netSalary: z.number().min(0),
});

export type CreatePayslipInput = z.infer<typeof createPayslipSchema>;

export const payslipQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  employeeId: objectIdSchema.optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).optional(),
});

export type PayslipQuery = z.infer<typeof payslipQuerySchema>;
