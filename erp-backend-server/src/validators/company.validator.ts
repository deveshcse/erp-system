import { z } from "zod";

// ---------------------------------------------------------------------------
// Reusable field definitions
// ---------------------------------------------------------------------------
const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;

// ---------------------------------------------------------------------------
// createCompanySchema
//
// Used by SuperAdmin when creating a new company + its initial admin account
// in a single atomic request.
// ---------------------------------------------------------------------------
export const createCompanySchema = z.object({
  // Company fields
  company: z.object({
    name: z
      .string({ error: "Company name is required" })
      .min(2, "Company name must be at least 2 characters")
      .max(200, "Company name must not exceed 200 characters")
      .trim(),

    email: z
      .string({ error: "Company email is required" })
      .email("Please provide a valid company email")
      .toLowerCase()
      .trim(),

    address: z
      .string({ error: "Company address is required" })
      .min(5, "Address must be at least 5 characters")
      .max(500, "Address must not exceed 500 characters")
      .trim(),

    contactNumber: z
      .string({ error: "Contact number is required" })
      .regex(phoneRegex, "Please provide a valid contact number")
      .trim(),

    gstNumber: z
      .string()
      .regex(gstRegex, "Please provide a valid GST number")
      .toUpperCase()
      .optional()
      .nullable(),
  }),

  // Initial admin account for this company
  admin: z.object({
    name: z
      .string({ error: "Admin name is required" })
      .min(2, "Admin name must be at least 2 characters")
      .max(100, "Admin name must not exceed 100 characters")
      .trim(),

    email: z
      .string({ error: "Admin email is required" })
      .email("Please provide a valid admin email")
      .toLowerCase()
      .trim(),

    password: z
      .string({ error: "Admin password is required" })
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
  }),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;

// ---------------------------------------------------------------------------
// updateCompanySchema — all fields optional for PATCH semantics
// ---------------------------------------------------------------------------
export const updateCompanySchema = z.object({
  name: z.string().min(2).max(200).trim().optional(),
  email: z.string().email().toLowerCase().trim().optional(),
  address: z.string().min(5).max(500).trim().optional(),
  contactNumber: z.string().regex(phoneRegex).trim().optional(),
  gstNumber: z.string().regex(gstRegex).toUpperCase().optional().nullable(),
  isActive: z.boolean().optional(),
});

export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;

// ---------------------------------------------------------------------------
// companyIdParamSchema — validates :companyId URL param as a valid ObjectId
// ---------------------------------------------------------------------------
export const companyIdParamSchema = z.object({
  companyId: z
    .string({ error: "Company ID is required" })
    .regex(/^[a-f\d]{24}$/i, "Invalid company ID format"),
});

export type CompanyIdParam = z.infer<typeof companyIdParamSchema>;
