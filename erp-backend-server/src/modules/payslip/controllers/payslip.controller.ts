import { type Request, type Response, type NextFunction } from "express";
import { sendSuccess, buildPaginationMeta } from "@/utils/response.util.js";
import { getParam } from "@/utils/request.util.js";
import { HTTP_STATUS } from "@/constants/index.js";
import * as payslipService from "../services/payslip.service.js";
import {
  type CreatePayslipInput,
  type PayslipQuery,
} from "../schemas/payslip.schema.js";

// ============================================================================
// PAYSLIP CONTROLLER
// ============================================================================

export async function createPayslip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payslip = await payslipService.generatePayslip(
      req.user.companyId!,
      req.body as CreatePayslipInput,
      req.user.userId
    );
    sendSuccess(res, { payslip }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listPayslips(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as PayslipQuery;
    const { payslips, total } = await payslipService.listPayslips(
      req.user.companyId!,
      { page: query.page, limit: query.limit },
      query
    );
    sendSuccess(
      res,
      { payslips },
      HTTP_STATUS.OK,
      buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getPayslip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payslip = await payslipService.getPayslipById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { payslip });
  } catch (error) {
    next(error);
  }
}
