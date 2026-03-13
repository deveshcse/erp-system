import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const createCompanyWithAdmin = async (companyData, adminData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if company or admin already exists
    const existingCompany = await Company.findOne({
      $or: [{ companyEmail: companyData.companyEmail }, { gstNumber: companyData.gstNumber }],
    });

    if (existingCompany) {
      throw new ApiError(409, "Company with this email or GST already exists");
    }

    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      throw new ApiError(409, "Admin user with this email already exists");
    }

    // 1. Create Company (temporary adminUserId)
    const company = new Company({
      ...companyData,
      adminUserId: new mongoose.Types.ObjectId(), // Placeholder
    });

    // 2. Create Admin User linked to company
    const adminUser = await User.create(
      [
        {
          ...adminData,
          role: "COMPANY_ADMIN",
          companyId: company._id,
        },
      ],
      { session }
    );

    // 3. Update Company with correct adminUserId
    company.adminUserId = adminUser[0]._id;
    await company.save({ session });

    await session.commitTransaction();
    return { company, admin: adminUser[0] };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getAllCompanies = async (filters) => {
  const { page = 1, limit = 10, search = "" } = filters;
  const skip = (page - 1) * limit;

  const query = {};
  if (search) {
    query.companyName = { $regex: search, $options: "i" };
  }

  const companies = await Company.find(query)
    .populate("adminUserId", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Company.countDocuments(query);

  return {
    companies,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCompanyById = async (companyId) => {
  const company = await Company.findById(companyId).populate("adminUserId", "name email");
  if (!company) {
    throw new ApiError(404, "Company not found");
  }
  return company;
};

export const getCompanyStats = async () => {
  const totalCompanies = await Company.countDocuments();
  const recentCompanies = await Company.find().sort({ createdAt: -1 }).limit(5);
  
  // Example of more complex stats if needed
  const stats = await Company.aggregate([
      {
          $group: {
              _id: null,
              count: { $sum: 1 }
          }
      }
  ]);

  return {
    totalCompanies,
    recentCompanies,
    stats: stats[0] || { count: 0 }
  };
};
