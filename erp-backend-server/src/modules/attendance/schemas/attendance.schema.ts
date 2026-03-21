import { z } from "zod";
import { ATTENDANCE_STATUS } from "@/constants";

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
