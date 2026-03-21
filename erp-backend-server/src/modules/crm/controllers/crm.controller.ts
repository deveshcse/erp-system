import { type Request, type Response, type NextFunction } from "express";
import { sendSuccess, buildPaginationMeta } from "@/utils/response.util.js";
import { getParam } from "@/utils/request.util.js";
import { parsePagination } from "@/utils/pagination.util.js";
import { HTTP_STATUS } from "@/constants/index.js";
import * as crmService from "../services/crm.service.js";
import {
  type CreateLeadInput,
  type UpdateLeadInput,
  type LeadQuery,
  type CreateQuotationInput,
  type CreateInvoiceInput,
  type UpdatePaymentStatusInput,
} from "../schemas/crm.schema.js";

// ============================================================================
// LEAD CONTROLLER
// ============================================================================

export async function createLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lead = await crmService.createLead(
      req.user.companyId!,
      req.body as CreateLeadInput,
      req.user.userId
    );
    sendSuccess(res, { lead }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listLeads(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as LeadQuery;
    const { leads, total } = await crmService.listLeads(
      req.user.companyId!,
      query
    );
    sendSuccess(
      res,
      { leads },
      HTTP_STATUS.OK,
      buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lead = await crmService.getLeadById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { lead });
  } catch (error) {
    next(error);
  }
}

export async function updateLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lead = await crmService.updateLead(
      req.user.companyId!,
      getParam(req, "id"),
      req.body as UpdateLeadInput
    );
    sendSuccess(res, { lead });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// QUOTATION CONTROLLER
// ============================================================================

export async function createQuotation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quotation = await crmService.createQuotation(
      req.user.companyId!,
      req.body as CreateQuotationInput,
      req.user.userId
    );
    sendSuccess(res, { quotation }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listQuotations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pagination = parsePagination(req);
    const status = req.query["status"] as string | undefined;
    const { quotations, total } = await crmService.listQuotations(
      req.user.companyId!,
      pagination,
      status
    );
    sendSuccess(
      res,
      { quotations },
      HTTP_STATUS.OK,
      buildPaginationMeta(pagination.page, pagination.limit, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getQuotation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quotation = await crmService.getQuotationById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { quotation });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// INVOICE CONTROLLER
// ============================================================================

export async function createInvoice(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invoice = await crmService.createInvoice(
      req.user.companyId!,
      req.body as CreateInvoiceInput,
      req.user.userId
    );
    sendSuccess(res, { invoice }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listInvoices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pagination = parsePagination(req);
    const paymentStatus = req.query["paymentStatus"] as string | undefined;
    const { invoices, total } = await crmService.listInvoices(
      req.user.companyId!,
      pagination,
      { paymentStatus }
    );
    sendSuccess(
      res,
      { invoices },
      HTTP_STATUS.OK,
      buildPaginationMeta(pagination.page, pagination.limit, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getInvoice(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invoice = await crmService.getInvoiceById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { invoice });
  } catch (error) {
    next(error);
  }
}

export async function updateInvoicePayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invoice = await crmService.updateInvoicePayment(
      req.user.companyId!,
      getParam(req, "id"),
      req.body as UpdatePaymentStatusInput
    );
    sendSuccess(res, { invoice });
  } catch (error) {
    next(error);
  }
}
