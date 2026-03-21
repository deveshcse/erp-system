import { type Request, type Response, type NextFunction } from "express";
import { type ZodSchema, ZodError } from "zod";
import { ValidationError } from "@/utils/errors.util";

// ---------------------------------------------------------------------------
// Target — which part of the request to validate.
// ---------------------------------------------------------------------------
type ValidationTarget = "body" | "params" | "query";

// ---------------------------------------------------------------------------
// validate
//
// Factory that returns an Express middleware validating the given request
// target against a Zod schema. On success, it replaces the target with the
// Zod-parsed (and potentially coerced/transformed) output so downstream
// handlers always receive clean, typed data.
//
// On failure, throws a ValidationError with per-field details so the global
// error handler serialises them into the standard error shape.
//
// Usage:
//   router.post("/login", validate(loginSchema, "body"), authController.login)
//   router.get("/:id", validate(idParamSchema, "params"), controller.getOne)
// ---------------------------------------------------------------------------
export function validate(schema: ZodSchema, target: ValidationTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const result = schema.safeParse(req[target]);

      if (!result.success) {
        const details = formatZodError(result.error);
        throw new ValidationError(`Validation failed on request ${target}`, details);
      }

      // Replace raw input with the coerced/transformed Zod output.
      // Double cast needed because Express Request has no index signature.
      (req as unknown as Record<string, unknown>)[target] = result.data;

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ---------------------------------------------------------------------------
// formatZodError — converts ZodError to field-level error array
// ---------------------------------------------------------------------------
function formatZodError(error: ZodError): { field: string; message: string }[] {
  return error.issues.map((issue) => ({
    field: issue.path.join(".") || "root",
    message: issue.message,
  }));
}
