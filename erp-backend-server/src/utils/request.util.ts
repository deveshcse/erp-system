import { type Request } from "express";

// ---------------------------------------------------------------------------
// getParam
//
// Safely extracts a URL parameter from req.params as a string.
// Express types req.params[key] as `string | string[]` in strict mode,
// but URL params are always strings — this helper narrows the type cleanly.
// ---------------------------------------------------------------------------
export function getParam(req: Request, key: string): string {
  const val = req.params[key];
  if (Array.isArray(val)) return val[0] ?? "";
  return val ?? "";
}
