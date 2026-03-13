import { Lead } from "../models/lead.model.js";
import ApiError from "../utils/ApiError.js";

export const createLead = async (leadData, companyId) => {
  const lead = await Lead.create({
    ...leadData,
    companyId,
  });

  return lead;
};

export const updateLeadDetails = async (leadId, updateData, companyId) => {
  const lead = await Lead.findOneAndUpdate(
    { _id: leadId, companyId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!lead) {
    throw new ApiError(404, "Lead not found or doesn't belong to your company");
  }

  return lead;
};

export const listLeads = async (filters, companyId) => {
  const { page = 1, limit = 10, search = "", status = "" } = filters;
  const skip = (page - 1) * limit;

  const query = { companyId };
  
  if (search) {
    query.$or = [
      { customerName: { $regex: search, $options: "i" } },
      { companyName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  if (status) {
    query.status = status;
  }

  const leads = await Lead.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Lead.countDocuments(query);

  return {
    leads,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
