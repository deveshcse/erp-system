import { type Request, type Response, type NextFunction } from "express";
import * as companyService from "../services/company.service.js";
import { sendSuccess, buildPaginationMeta } from "@/utils/response.util.js";
import { parsePagination } from "@/utils/pagination.util.js";
import { getParam } from "@/utils/request.util.js";
import { HTTP_STATUS } from "@/constants/index.js";
import {
  type CreateCompanyInput,
  type UpdateCompanyInput,
} from "../schemas/company.schema.js";

// ---------------------------------------------------------------------------
// createCompany
// POST /api/v1/companies
// ---------------------------------------------------------------------------
export async function createCompany(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const result = await companyService.createCompany(
      req.body as CreateCompanyInput
    );
    sendSuccess(res, result, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// listCompanies
// GET /api/v1/companies
// ---------------------------------------------------------------------------
export async function listCompanies(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pagination = parsePagination(req);
    const search = req.query["search"] as string | undefined;

    const { companies, total } = await companyService.listCompanies(
      pagination,
      search
    );

    sendSuccess(
      res,
      { companies },
      HTTP_STATUS.OK,
      buildPaginationMeta(pagination.page, pagination.limit, total)
    );
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// getCompany
// GET /api/v1/companies/:companyId
// ---------------------------------------------------------------------------
export async function getCompany(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const company = await companyService.getCompanyById(getParam(req, "companyId"));
    sendSuccess(res, { company });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// updateCompany
// PATCH /api/v1/companies/:companyId
// ---------------------------------------------------------------------------
export async function updateCompany(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const company = await companyService.updateCompany(
      getParam(req, "companyId"),
      req.body as UpdateCompanyInput
    );
    sendSuccess(res, { company });
  } catch (error) {
    next(error);
  }
}

// ---------------------------------------------------------------------------
// getCompanyStats
// GET /api/v1/companies/:companyId/stats
// ---------------------------------------------------------------------------
export async function getCompanyStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const stats = await companyService.getCompanyStats(getParam(req, "companyId"));
    sendSuccess(res, stats);
  } catch (error) {
    next(error);
  }
}
