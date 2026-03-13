import { Employee } from "../models/employee.model.js";
import ApiError from "../utils/ApiError.js";

export const addEmployee = async (employeeData, companyId) => {
  const existingEmployee = await Employee.findOne({
    $or: [
        { email: employeeData.email },
        { employeeId: employeeData.employeeId }
    ]
  });

  if (existingEmployee) {
    throw new ApiError(409, "Employee with this email or ID already exists");
  }

  const employee = await Employee.create({
    ...employeeData,
    companyId,
  });

  return employee;
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
