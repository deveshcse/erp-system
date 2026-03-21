import mongoose from "mongoose";
import { Company } from "../models/company.model.js";
import { User } from "@/modules/auth/models/user.model.js";
import { logger } from "@/config/logger.js";
import { ROLES } from "@/constants/index.js";
import { NotFoundError, ConflictError } from "@/utils/errors.util.js";
import {
  type CreateCompanyInput,
  type UpdateCompanyInput,
} from "../schemas/company.schema.js";
import { type PaginationQuery } from "@/types/index.js";
import { getPaginationSkip } from "@/utils/pagination.util.js";

// ---------------------------------------------------------------------------
// createCompany
//
// Atomically creates a Company and its initial CompanyAdmin user inside a
// MongoDB session so both succeed or both roll back.
// ---------------------------------------------------------------------------
export async function createCompany(input: CreateCompanyInput) {
  // 1. Pre-check for conflicts BEFORE opening a transaction (cheaper).
  const [existingCompany, existingAdmin] = await Promise.all([
    Company.findOne({ email: input.company.email }),
    User.findOne({ email: input.admin.email }),
  ]);

  if (existingCompany) {
    throw new ConflictError(
      `A company with email '${input.company.email}' already exists`
    );
  }
  if (existingAdmin) {
    throw new ConflictError(
      `A user with email '${input.admin.email}' already exists`
    );
  }

  // 2. Run company + admin creation in a MongoDB transaction.
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create the company first (without adminId — we'll set it after).
    const [company] = await Company.create(
      [
        {
          name: input.company.name,
          email: input.company.email,
          address: input.company.address,
          contactNumber: input.company.contactNumber,
          gstNumber: input.company.gstNumber ?? null,
        },
      ],
      { session }
    );

    // Create the CompanyAdmin user scoped to this company.
    const [admin] = await User.create(
      [
        {
          name: input.admin.name,
          email: input.admin.email,
          password: input.admin.password,
          role: ROLES.COMPANY_ADMIN,
          companyId: company!._id,
        },
      ],
      { session }
    );

    // Link the admin back to the company.
    company!.adminId = admin!._id;
    await company!.save({ session });

    await session.commitTransaction();

    logger.info(
      {
        companyId: company!._id.toString(),
        adminId: admin!._id.toString(),
      },
      "[Company] Company created with admin"
    );

    return {
      company: company!.toObject(),
      admin: admin!.toObject(), // password excluded via toObject transform
    };
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

// ---------------------------------------------------------------------------
// listCompanies — paginated list for SuperAdmin dashboard
// ---------------------------------------------------------------------------
export async function listCompanies(
  pagination: PaginationQuery,
  search?: string
) {
  const filter: Record<string, unknown> = {};

  if (search) {
    filter["$text"] = { $search: search };
  }

  const [companies, total] = await Promise.all([
    Company.find(filter)
      .populate("adminId", "name email")
      .sort({ createdAt: -1 })
      .skip(getPaginationSkip(pagination.page, pagination.limit))
      .limit(pagination.limit),
    Company.countDocuments(filter),
  ]);

  return { companies, total };
}

// ---------------------------------------------------------------------------
// getCompanyById
// ---------------------------------------------------------------------------
export async function getCompanyById(companyId: string) {
  const company = await Company.findById(companyId).populate(
    "adminId",
    "name email lastLoginAt"
  );

  if (!company) {
    throw new NotFoundError("Company");
  }

  return company;
}

// ---------------------------------------------------------------------------
// updateCompany
// ---------------------------------------------------------------------------
export async function updateCompany(
  companyId: string,
  input: UpdateCompanyInput
) {
  // Check for email conflict if email is being changed.
  if (input.email) {
    const conflict = await Company.findOne({
      email: input.email,
      _id: { $ne: new mongoose.Types.ObjectId(companyId) },
    });
    if (conflict) {
      throw new ConflictError(
        `A company with email '${input.email}' already exists`
      );
    }
  }

  const company = await Company.findByIdAndUpdate(
    companyId,
    { $set: input },
    { new: true, runValidators: true }
  );

  if (!company) {
    throw new NotFoundError("Company");
  }

  logger.info({ companyId }, "[Company] Company updated");
  return company;
}

// ---------------------------------------------------------------------------
// getCompanyStats — aggregate statistics for the SuperAdmin dashboard
// ---------------------------------------------------------------------------
export async function getCompanyStats(companyId: string) {
  const company = await Company.findById(companyId);
  if (!company) throw new NotFoundError("Company");

  const { Employee } = await import("@/modules/employee/models/employee.model");
  const { Attendance } = await import("@/modules/attendance/models/attendance.model");

  const [employeeStats, todayAttendance] = await Promise.all([
    Employee.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalSalary: { $sum: "$salary" },
        },
      },
    ]),
    Attendance.countDocuments({
      companyId: new mongoose.Types.ObjectId(companyId),
      date: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
      status: "Present",
    }),
  ]);

  return {
    company: company.toObject(),
    stats: {
      employees: employeeStats,
      todayPresent: todayAttendance,
    },
  };
}
