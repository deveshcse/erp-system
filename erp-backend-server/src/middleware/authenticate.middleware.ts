import { type Request, type Response, type NextFunction } from "express";
import { verifyAccessToken } from "@/utils/token.util";
import { UnauthorizedError } from "@/utils/errors.util";
import { ERROR_CODES, ROLES, type Role } from "@/constants";

// ---------------------------------------------------------------------------
// authenticate
//
// Extracts the Bearer token from the Authorization header, verifies it,
// and attaches the decoded user context to req.user (globally augmented).
//
// Separation of concerns:
//   authenticate = "who are you?"
//   authorize    = "are you allowed to do this?"
// ---------------------------------------------------------------------------
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        "Authorization header is missing or malformed. Expected: Bearer <token>",
        ERROR_CODES.TOKEN_MISSING
      );
    }

    const token = authHeader.slice(7); // Remove "Bearer " prefix
    const payload = verifyAccessToken(token); // Throws on invalid/expired

    req.user = {
      userId: payload.sub,
      role: payload.role,
      companyId: payload.companyId,
      sessionId: payload.sessionId,
    };

    next();
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// requireRoles
//
// Guards a route so only users with specified roles can proceed.
// Must be used AFTER authenticate().
//
// Usage:
//   router.get("/companies", authenticate, requireRoles(ROLES.SUPER_ADMIN), handler)
// ---------------------------------------------------------------------------
export function requireRoles(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }
      if (!roles.includes(req.user.role)) {
        throw new UnauthorizedError(
          "You do not have permission to access this resource",
          ERROR_CODES.FORBIDDEN
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}
