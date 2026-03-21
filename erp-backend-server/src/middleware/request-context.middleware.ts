import { type Request, type Response, type NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

// ---------------------------------------------------------------------------
// requestContext
//
// Attaches a unique correlation ID to every incoming request.
// The ID is:
//   1. Read from the X-Request-ID header if the caller provides one.
//   2. Generated as a UUID v4 if not provided.
//
// The ID is:
//   - Set on the response as X-Request-ID (so clients can trace their request)
//   - Available as req.requestId for use in log statements
//
// pino-http automatically picks up req.id if set, so log lines for the same
// request all share the same correlationId in production log aggregators.
// ---------------------------------------------------------------------------
declare global {
  // Augment Express Request type globally so req.requestId is available
  // everywhere without casting.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      requestId: string;
    }
  }
}

export function requestContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const correlationId =
    (req.headers["x-request-id"] as string | undefined) ?? uuidv4();

  req.requestId = correlationId;
  res.setHeader("X-Request-ID", correlationId);

  next();
}
