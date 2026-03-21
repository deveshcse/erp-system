import { z } from "zod";
import { EMPLOYEE_STATUS } from "@/constants/index.js";

const objectIdRegex = /^[a-f\d]{24}$/i;

// ---------------------------------------------------------------------------
// createEmployeeSchema
// ---------------------------------------------------------------------------
export const createEmployeeSchema = z.object({
  fullName: z
    .string({ error: "Full name is required" })
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name must not exceed 100 characters")
    .trim(),

  email: z
    .string({ error: "Email is required" })
    .email("Please provide a valid email address")
    .toLowerCase()
    .trim(),

  phoneNumber: z
    .string({ error: "Phone number is required" })
    .min(7, "Phone number must be at least 7 characters")
    .max(20, "Phone number must not exceed 20 characters")
    .trim(),

  department: z
    .string({ error: "Department is required" })
    .min(2, "Department must be at least 2 characters")
    .max(100, "Department must not exceed 100 characters")
    .trim(),

  designation: z
    .string({ error: "Designation is required" })
    .min(2, "Designation must be at least 2 characters")
    .max(100, "Designation must not exceed 100 characters")
    .trim(),

  joiningDate: z
    .string({ error: "Joining date is required" })
    .date("Joining date must be a valid date (YYYY-MM-DD)")
    .transform((val) => new Date(val)),

  salary: z
    .number({ error: "Salary is required" })
    .min(0, "Salary cannot be negative"),

  // Optionally create a login account for the employee
  createUserAccount: z.boolean().default(false),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

// Cross-field validation: if createUserAccount is true, password is required
export const createEmployeeSchemaRefined = createEmployeeSchema.refine(
  (data) => {
    if (data.createUserAccount && !data.password) {
      return false;
    }
    return true;
  },
  {
    message: "Password is required when creating a user account",
    path: ["password"],
  }
);

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchemaRefined>;

// ---------------------------------------------------------------------------
// updateEmployeeSchema
// ---------------------------------------------------------------------------
export const updateEmployeeSchema = z.object({
  fullName: z.string().min(2).max(100).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  phoneNumber: z.string().min(7).max(20).trim().optional(),
  department: z.string().min(2).max(100).trim().optional(),
  designation: z.string().min(2).max(100).trim().optional(),
  joiningDate: z
    .string()
    .date()
    .transform((val) => new Date(val))
    .optional(),
  salary: z.number().min(0).optional(),
  status: z.nativeEnum(EMPLOYEE_STATUS).optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

// ---------------------------------------------------------------------------
// employeeIdParamSchema
// ---------------------------------------------------------------------------
export const employeeIdParamSchema = z.object({
  employeeId: z
    .string({ error: "Employee ID is required" })
    .regex(objectIdRegex, "Invalid employee ID format"),
});

// ---------------------------------------------------------------------------
// listEmployeesQuerySchema — filter + pagination
// ---------------------------------------------------------------------------
export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  status: z.nativeEnum(EMPLOYEE_STATUS).optional(),
  department: z.string().trim().optional(),
  search: z.string().trim().optional(),
});

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>;
