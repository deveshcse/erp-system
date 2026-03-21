import { z } from "zod";
import { TASK_PRIORITY, TASK_STATUS } from "@/constants";

const objectIdSchema = z
  .string()
  .regex(/^[a-f\d]{24}$/i, "Invalid ID format");

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

export const taskQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  assignedTo: objectIdSchema.optional(),
  status: z.nativeEnum(TASK_STATUS).optional(),
  priority: z.nativeEnum(TASK_PRIORITY).optional(),
  search: z.string().trim().optional(),
});

export type TaskQuery = z.infer<typeof taskQuerySchema>;
