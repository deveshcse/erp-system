import mongoose from "mongoose";
import { Employee } from "../models/employee.model";
import { User } from "@/modules/auth/models/user.model";
import { logger } from "@/config/logger";
import { ROLES, EMPLOYEE_STATUS } from "@/constants";
import { NotFoundError, ConflictError } from "@/utils/errors.util";
import {
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type ListEmployeesQuery,
} from "../schemas/employee.schema";
import { generateDocumentNumber } from "@/utils/document-number.util";
import { getPaginationSkip } from "@/utils/pagination.util";

// ---------------------------------------------------------------------------
// createEmployee
//
// Creates an Employee record. If createUserAccount is true, also creates a
// User account so the employee can log in — done atomically in a transaction.
// ---------------------------------------------------------------------------
export async function createEmployee(
  companyId: string,
  input: CreateEmployeeInput,
  createdByUserId: string
) {
  // Check for email conflict within this company.
  const existing = await Employee.findOne({
    companyId: new mongoose.Types.ObjectId(companyId),
    email: input.email,
  });
  if (existing) {
    throw new ConflictError(
      `An employee with email '${input.email}' already exists in this company`
    );
  }

  // Generate the human-readable employee ID (e.g. EMP-00042).
  const employeeId = await generateDocumentNumber("EMP", companyId);

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Create the Employee record.
    const [employee] = await Employee.create(
      [
        {
          companyId: new mongoose.Types.ObjectId(companyId),
          employeeId,
          fullName: input.fullName,
          email: input.email,
          phoneNumber: input.phoneNumber,
          department: input.department,
          designation: input.designation,
          joiningDate: input.joiningDate,
          salary: input.salary,
          status: EMPLOYEE_STATUS.ACTIVE,
        },
      ],
      { session }
    );

    // Optionally create a login account for the employee.
    if (input.createUserAccount && input.password) {
      const existingUser = await User.findOne({ email: input.email }).session(session);
      if (existingUser) {
        throw new ConflictError(
          `A user account with email '${input.email}' already exists`
        );
      }

      const [user] = await User.create(
        [
          {
            name: input.fullName,
            email: input.email,
            password: input.password,
            role: ROLES.EMPLOYEE,
            companyId: new mongoose.Types.ObjectId(companyId),
          },
        ],
        { session }
      );

      // Link user to employee record.
      employee!.userId = user!._id;
      await employee!.save({ session });

      logger.info(
        { employeeId: employee!._id.toString(), userId: user!._id.toString() },
        "[Employee] User account created for employee"
      );
    }

    await session.commitTransaction();

    logger.info(
      { employeeId: employee!._id.toString(), companyId },
      "[Employee] Employee created"
    );

    return employee!;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    await session.endSession();
  }
}

// ---------------------------------------------------------------------------
// listEmployees — paginated, filterable, searchable
// ---------------------------------------------------------------------------
export async function listEmployees(
  companyId: string,
  query: ListEmployeesQuery
) {
  const filter: Record<string, unknown> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  if (query.status) filter["status"] = query.status;
  if (query.department) filter["department"] = query.department;
  if (query.search) {
    filter["$text"] = { $search: query.search };
  }

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .sort({ createdAt: -1 })
      .skip(getPaginationSkip(query.page, query.limit))
      .limit(query.limit),
    Employee.countDocuments(filter),
  ]);

  return { employees, total };
}

// ---------------------------------------------------------------------------
// getEmployeeById — enforces company boundary
// ---------------------------------------------------------------------------
export async function getEmployeeById(companyId: string, employeeId: string) {
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(employeeId),
    companyId: new mongoose.Types.ObjectId(companyId),
  });

  if (!employee) throw new NotFoundError("Employee");
  return employee;
}

// ---------------------------------------------------------------------------
// updateEmployee
// ---------------------------------------------------------------------------
export async function updateEmployee(
  companyId: string,
  employeeId: string,
  input: UpdateEmployeeInput
) {
  // If email is changing, check for conflict within the company.
  if (input.email) {
    const conflict = await Employee.findOne({
      companyId: new mongoose.Types.ObjectId(companyId),
      email: input.email,
      _id: { $ne: new mongoose.Types.ObjectId(employeeId) },
    });
    if (conflict) {
      throw new ConflictError(
        `An employee with email '${input.email}' already exists in this company`
      );
    }
  }

  const employee = await Employee.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(employeeId),
      companyId: new mongoose.Types.ObjectId(companyId),
    },
    { $set: input },
    { new: true, runValidators: true }
  );

  if (!employee) throw new NotFoundError("Employee");

  logger.info({ employeeId, companyId }, "[Employee] Employee updated");
  return employee;
}

// ---------------------------------------------------------------------------
// deleteEmployee — soft delete by setting status to Inactive
// ---------------------------------------------------------------------------
export async function deleteEmployee(companyId: string, employeeId: string) {
  const employee = await Employee.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(employeeId),
      companyId: new mongoose.Types.ObjectId(companyId),
    },
    { $set: { status: EMPLOYEE_STATUS.INACTIVE } },
    { new: true }
  );

  if (!employee) throw new NotFoundError("Employee");

  logger.info({ employeeId, companyId }, "[Employee] Employee deactivated");
  return employee;
}

// ---------------------------------------------------------------------------
// getDepartments — returns distinct departments for filter dropdowns
// ---------------------------------------------------------------------------
export async function getDepartments(companyId: string): Promise<string[]> {
  return Employee.distinct("department", {
    companyId: new mongoose.Types.ObjectId(companyId),
    status: EMPLOYEE_STATUS.ACTIVE,
  });
}
