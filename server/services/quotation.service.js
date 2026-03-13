import { Quotation } from "../models/quotation.model.js";
import ApiError from "../utils/ApiError.js";

export const createQuotation = async (quotationData, companyId) => {
  const { items, tax = 0 } = quotationData;

  // Calculate total amount
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalAmount = subtotal + tax;

  const quotation = await Quotation.create({
    ...quotationData,
    totalAmount,
    companyId,
  });

  return quotation;
};

export const getQuotationById = async (quotationId, companyId) => {
  const quotation = await Quotation.findOne({ _id: quotationId, companyId });
  if (!quotation) {
    throw new ApiError(404, "Quotation not found");
  }
  return quotation;
};

export const listQuotations = async (filters, companyId) => {
  const { page = 1, limit = 10, customerName = "", status = "" } = filters;
  const skip = (page - 1) * limit;

  const query = { companyId };
  if (customerName) {
    query.customerName = { $regex: customerName, $options: "i" };
  }
  if (status) {
    query.status = status;
  }

  const quotations = await Quotation.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Quotation.countDocuments(query);

  return {
    quotations,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
