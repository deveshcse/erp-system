import { Invoice } from "../models/invoice.model.js";
import ApiError from "../utils/ApiError.js";

export const createInvoice = async (invoiceData, companyId) => {
  const { invoiceNumber, items, tax = 0 } = invoiceData;

  // Check if invoice number already exists
  const existingInvoice = await Invoice.findOne({ invoiceNumber });
  if (existingInvoice) {
    throw new ApiError(400, "Invoice number already exists");
  }

  // Calculate total
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal + tax;

  const invoice = await Invoice.create({
    ...invoiceData,
    total,
    companyId,
  });

  return invoice;
};

export const getInvoiceById = async (invoiceId, companyId) => {
  const invoice = await Invoice.findOne({ _id: invoiceId, companyId });
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }
  return invoice;
};

export const listInvoices = async (filters, companyId) => {
  const { page = 1, limit = 10, invoiceNumber = "", customerName = "", paymentStatus = "" } = filters;
  const skip = (page - 1) * limit;

  const query = { companyId };
  
  if (invoiceNumber) {
    query.invoiceNumber = { $regex: invoiceNumber, $options: "i" };
  }
  if (customerName) {
    query.customerName = { $regex: customerName, $options: "i" };
  }
  if (paymentStatus) {
    query.paymentStatus = paymentStatus;
  }

  const invoices = await Invoice.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Invoice.countDocuments(query);

  return {
    invoices,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
