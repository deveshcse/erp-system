import { type Request } from "express";
import { PAGINATION } from "@/constants";
import { type PaginationQuery } from "@/types";

// ---------------------------------------------------------------------------
// parsePagination
//
// Safely extracts and clamps page/limit from query parameters.
// Always returns safe defaults — never throws on invalid input.
// ---------------------------------------------------------------------------
export function parsePagination(req: Request): PaginationQuery {
  const rawPage = parseInt(req.query["page"] as string, 10);
  const rawLimit = parseInt(req.query["limit"] as string, 10);

  const page = isNaN(rawPage) || rawPage < 1
    ? PAGINATION.DEFAULT_PAGE
    : rawPage;

  const limit = isNaN(rawLimit) || rawLimit < 1
    ? PAGINATION.DEFAULT_LIMIT
    : Math.min(rawLimit, PAGINATION.MAX_LIMIT);

  return { page, limit };
}

// ---------------------------------------------------------------------------
// getPaginationSkip
//
// Returns the number of documents to skip for a given page.
// ---------------------------------------------------------------------------
export function getPaginationSkip(page: number, limit: number): number {
  return (page - 1) * limit;
}
