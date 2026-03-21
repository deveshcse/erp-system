// ---------------------------------------------------------------------------
// Global Express namespace augmentation
//
// This file augments the Express Request interface so that req.user and
// req.requestId are available on the base Request type throughout the app.
//
// This removes the need to use AuthenticatedRequest in route handlers —
// routes can use the standard RequestHandler type while still having access
// to req.user after the authenticate middleware runs.
// ---------------------------------------------------------------------------
import { type Role } from "@/constants";

declare global {
  namespace Express {
    interface Request {
      // Set by requestContext middleware on every request.
      requestId: string;

      // Set by authenticate middleware on protected routes.
      // Typed as optional because unauthenticated routes don't have this.
      user: {
        userId: string;
        role: Role;
        companyId: string | null;
        sessionId: string;
      };
    }
  }
}

export {};
