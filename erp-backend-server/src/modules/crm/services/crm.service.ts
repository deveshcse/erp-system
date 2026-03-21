import mongoose from "mongoose";
import { Lead } from "../models/lead.model";
import { Quotation } from "../models/quotation.model";
import { Invoice } from "../models/invoice.model";
import { logger } from "@/config/logger";
import { PAYMENT_STATUS } from "@/constants";
import { NotFoundError } from "@/utils/errors.util";
import {
  type CreateLeadInput,
  type UpdateLeadInput,
  type LeadQuery,
  type CreateQuotationInput,
  type CreateInvoiceInput,
  type UpdatePaymentStatusInput,
} from "../schemas/crm.schema";
import { generateDocumentNumber } from "@/utils/document-number.util";
import { getPaginationSkip } from "@/utils/pagination.util";
import { type PaginationQuery } from "@/types";

// ============================================================================
// LEAD SERVICE
// ============================================================================

export async function createLead(
  companyId: string,
  input: CreateLeadInput,
  createdByUserId: string
) {
  const lead = await Lead.create({
    companyId: new mongoose.Types.ObjectId(companyId),
    customerName: input.customerName,
    customerCompanyName: input.customerCompanyName ?? null,
    phoneNumber: input.phoneNumber,
    email: input.email,
    leadSource: input.leadSource,
    notes: input.notes ?? null,
    assignedTo: input.assignedTo
      ? new mongoose.Types.ObjectId(input.assignedTo)
      : null,
    createdBy: new mongoose.Types.ObjectId(createdByUserId),
  });

  logger.info({ leadId: lead._id.toString(), companyId }, "[Lead] Lead created");
  return lead;
}

export async function listLeads(companyId: string, query: LeadQuery) {
  const filter: Record<string, unknown> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  if (query.status) filter["status"] = query.status;
  if (query.source) filter["leadSource"] = query.source;
  if (query.search) filter["$text"] = { $search: query.search };

  const [leads, total] = await Promise.all([
    Lead.find(filter)
      .populate("assignedTo", "fullName employeeId")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(getPaginationSkip(query.page, query.limit))
      .limit(query.limit),
    Lead.countDocuments(filter),
  ]);

  return { leads, total };
}

export async function getLeadById(companyId: string, leadId: string) {
  const lead = await Lead.findOne({
    _id: new mongoose.Types.ObjectId(leadId),
    companyId: new mongoose.Types.ObjectId(companyId),
  })
    .populate("assignedTo", "fullName employeeId")
    .populate("createdBy", "name email");

  if (!lead) throw new NotFoundError("Lead");
  return lead;
}

export async function updateLead(
  companyId: string,
  leadId: string,
  input: UpdateLeadInput
) {
  const lead = await Lead.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(leadId),
      companyId: new mongoose.Types.ObjectId(companyId),
    },
    { $set: input },
    { new: true, runValidators: true }
  );

  if (!lead) throw new NotFoundError("Lead");
  logger.info({ leadId, companyId }, "[Lead] Lead updated");
  return lead;
}

// ============================================================================
// QUOTATION SERVICE
// ============================================================================

// ---------------------------------------------------------------------------
// calculateTotals — derives subTotal, totalTax, grandTotal from line items
// and computes each item's totalPrice. Called before saving quotation/invoice.
// ---------------------------------------------------------------------------
function calculateTotals(lineItems: CreateQuotationInput["lineItems"]) {
  let subTotal = 0;
  let totalTax = 0;

  const processedItems = lineItems.map((item) => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemTax = (itemSubtotal * item.taxPercent) / 100;
    const totalPrice = parseFloat((itemSubtotal + itemTax).toFixed(2));

    subTotal += itemSubtotal;
    totalTax += itemTax;

    return { ...item, totalPrice };
  });

  return {
    lineItems: processedItems,
    subTotal: parseFloat(subTotal.toFixed(2)),
    totalTax: parseFloat(totalTax.toFixed(2)),
    grandTotal: parseFloat((subTotal + totalTax).toFixed(2)),
  };
}

export async function createQuotation(
  companyId: string,
  input: CreateQuotationInput,
  createdByUserId: string
) {
  const quotationNumber = await generateDocumentNumber("QUO", companyId);
  const totals = calculateTotals(input.lineItems);

  const quotation = await Quotation.create({
    companyId: new mongoose.Types.ObjectId(companyId),
    quotationNumber,
    customerId: input.customerId
      ? new mongoose.Types.ObjectId(input.customerId)
      : null,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    lineItems: totals.lineItems,
    subTotal: totals.subTotal,
    totalTax: totals.totalTax,
    grandTotal: totals.grandTotal,
    validityDate: input.validityDate,
    notes: input.notes ?? null,
    status: "Draft",
    createdBy: new mongoose.Types.ObjectId(createdByUserId),
  });

  logger.info(
    { quotationId: quotation._id.toString(), quotationNumber, companyId },
    "[Quotation] Quotation created"
  );

  return quotation;
}

export async function listQuotations(
  companyId: string,
  pagination: PaginationQuery,
  status?: string
) {
  const filter: Record<string, unknown> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };
  if (status) filter["status"] = status;

  const [quotations, total] = await Promise.all([
    Quotation.find(filter)
      .sort({ createdAt: -1 })
      .skip(getPaginationSkip(pagination.page, pagination.limit))
      .limit(pagination.limit),
    Quotation.countDocuments(filter),
  ]);

  return { quotations, total };
}

export async function getQuotationById(companyId: string, quotationId: string) {
  const quotation = await Quotation.findOne({
    _id: new mongoose.Types.ObjectId(quotationId),
    companyId: new mongoose.Types.ObjectId(companyId),
  });
  if (!quotation) throw new NotFoundError("Quotation");
  return quotation;
}

// ============================================================================
// INVOICE SERVICE
// ============================================================================

export async function createInvoice(
  companyId: string,
  input: CreateInvoiceInput,
  createdByUserId: string
) {
  const invoiceNumber = await generateDocumentNumber("INV", companyId);
  const totals = calculateTotals(input.lineItems);

  const invoice = await Invoice.create({
    companyId: new mongoose.Types.ObjectId(companyId),
    invoiceNumber,
    quotationId: input.quotationId
      ? new mongoose.Types.ObjectId(input.quotationId)
      : null,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    lineItems: totals.lineItems,
    subTotal: totals.subTotal,
    totalTax: totals.totalTax,
    grandTotal: totals.grandTotal,
    amountPaid: 0,
    balanceDue: totals.grandTotal,
    paymentStatus: PAYMENT_STATUS.PENDING,
    dueDate: input.dueDate,
    notes: input.notes ?? null,
    createdBy: new mongoose.Types.ObjectId(createdByUserId),
  });

  logger.info(
    { invoiceId: invoice._id.toString(), invoiceNumber, companyId },
    "[Invoice] Invoice created"
  );

  return invoice;
}

export async function listInvoices(
  companyId: string,
  pagination: PaginationQuery,
  filters: { paymentStatus?: string }
) {
  const filter: Record<string, unknown> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };
  if (filters.paymentStatus) filter["paymentStatus"] = filters.paymentStatus;

  const [invoices, total] = await Promise.all([
    Invoice.find(filter)
      .sort({ createdAt: -1 })
      .skip(getPaginationSkip(pagination.page, pagination.limit))
      .limit(pagination.limit),
    Invoice.countDocuments(filter),
  ]);

  return { invoices, total };
}

export async function getInvoiceById(companyId: string, invoiceId: string) {
  const invoice = await Invoice.findOne({
    _id: new mongoose.Types.ObjectId(invoiceId),
    companyId: new mongoose.Types.ObjectId(companyId),
  });
  if (!invoice) throw new NotFoundError("Invoice");
  return invoice;
}

export async function updateInvoicePayment(
  companyId: string,
  invoiceId: string,
  input: UpdatePaymentStatusInput
) {
  const invoice = await Invoice.findOne({
    _id: new mongoose.Types.ObjectId(invoiceId),
    companyId: new mongoose.Types.ObjectId(companyId),
  });
  if (!invoice) throw new NotFoundError("Invoice");

  invoice.paymentStatus = input.paymentStatus;

  if (input.amountPaid !== undefined) {
    invoice.amountPaid = input.amountPaid;
    invoice.balanceDue = parseFloat(
      Math.max(0, invoice.grandTotal - input.amountPaid).toFixed(2)
    );
  }

  await invoice.save();
  logger.info({ invoiceId, paymentStatus: input.paymentStatus }, "[Invoice] Payment status updated");
  return invoice;
}
