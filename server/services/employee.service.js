import mongoose from "mongoose";
import { Employee } from "../models/employee.model.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";

export const addEmployee = async (employeeData, companyId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const existingEmployee = await Employee.findOne({
      $or: [
        { email: employeeData.email },
        { employeeId: employeeData.employeeId }
      ]
    }).session(session);

    if (existingEmployee) {
      throw new ApiError(409, "Employee with this email or ID already exists");
    }

    const existingUser = await User.findOne({ email: employeeData.email }).session(session);
    if (existingUser) {
      throw new ApiError(409, "User with this email already exists");
    }

    // 1. Create User record for login
    const user = await User.create(
      [
        {
          name: employeeData.fullName,
          email: employeeData.email,
          password: "Employee@123", // Default initial password
          role: "EMPLOYEE",
          companyId,
        },
      ],
      { session }
    );

    // 2. Create Employee record linked to user
    const employee = await Employee.create(
      [
        {
          ...employeeData,
          companyId,
          userId: user[0]._id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return employee[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const updateEmployeeDetails = async (employeeId, updateData, companyId) => {
  const employee = await Employee.findOneAndUpdate(
    { _id: employeeId, companyId },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!employee) {
    throw new ApiError(404, "Employee not found or doesn't belong to your company");
  }

  return employee;
};

export const deleteEmployeeById = async (employeeId, companyId) => {
  const employee = await Employee.findOneAndDelete({ _id: employeeId, companyId });

  if (!employee) {
    throw new ApiError(404, "Employee not found or doesn't belong to your company");
  }

  return employee;
};

export const listEmployees = async (filters, companyId) => {
  const { page = 1, limit = 10, search = "", department = "" } = filters;
  const skip = (page - 1) * limit;

  const query = { companyId };

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: "i" } },
      { employeeId: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  if (department) {
    query.department = department;
  }

  const employees = await Employee.find(query)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Employee.countDocuments(query);

  return {
    employees,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
