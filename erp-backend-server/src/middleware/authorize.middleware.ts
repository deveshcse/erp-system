import { type Request, type Response, type NextFunction } from "express";
import { hasPermission } from "@/constants/permissions";
import { ForbiddenError, UnauthorizedError } from "@/utils/errors.util";
import { type Resource, type Action, ROLES } from "@/constants";

// ---------------------------------------------------------------------------
// authorize
//
// The central RBAC gate. Checks the permission matrix in permissions.ts
// to decide if req.user's role is allowed to perform `action` on `resource`.
//
// This is the ONLY place in the entire codebase where the permission matrix
// is consulted. No controller or service should replicate this logic.
//
// Must be used AFTER authenticate().
//
// Usage:
//   router.post(
//     "/employees",
//     authenticate,
//     authorize(RESOURCES.EMPLOYEE, ACTIONS.CREATE),
//     employeeController.createEmployee
//   )
// ---------------------------------------------------------------------------
export function authorize(resource: Resource, action: Action) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const allowed = hasPermission(req.user.role, resource, action);
      if (!allowed) {
        throw new ForbiddenError();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// ---------------------------------------------------------------------------
// enforceTenantScope
//
// Ensures that CompanyAdmin and Employee can only access data within their
// own company. SuperAdmin is exempt.
//
// Usage:
//   router.get(
//     "/:companyId/employees",
//     authenticate,
//     authorize(RESOURCES.EMPLOYEE, ACTIONS.READ),
//     enforceTenantScope("companyId"),
//     handler
//   )
// ---------------------------------------------------------------------------
export function enforceTenantScope(paramName = "companyId") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const { role, companyId: userCompanyId } = req.user;

      // SuperAdmin operates across all companies — no scoping needed.
      if (role === ROLES.SUPER_ADMIN) {
        return next();
      }

      const requestedCompanyId = req.params[paramName] as string | undefined;

      if (!requestedCompanyId) {
        // No companyId in params — inject the user's own companyId.
        req.params[paramName] = userCompanyId ?? "";
        return next();
      }

      // Reject if the user is trying to access a different company's data.
      if (userCompanyId !== requestedCompanyId) {
        throw new ForbiddenError();
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
