import { Payslip } from "../models/payslip.model.js";
import { Employee } from "../models/employee.model.js";
import ApiError from "../utils/ApiError.js";

export const processPayroll = async (payrollData, companyId) => {
  const { 
    employeeId, 
    month, 
    workingDays, 
    leaveDays = 0, 
    allowances = 0, 
    deductions = 0 
  } = payrollData;

  // 1. Verify employee belongs to company
  const employee = await Employee.findOne({ _id: employeeId, companyId });
  if (!employee) {
    throw new ApiError(404, "Employee not found in your company");
  }

  // 2. Calculate net salary
  // Basic salary comes from employee record
  const basicSalary = employee.salary;
  const netSalary = basicSalary + allowances - deductions;

  // 3. Create or Update Payslip
  // We use month format "YYYY-MM" as per model design
  const payslip = await Payslip.findOneAndUpdate(
    { employeeId, month },
    {
      basicSalary,
      allowances,
      deductions,
      workingDays,
      leaveDays,
      netSalary,
      companyId,
    },
    { new: true, upsert: true, runValidators: true }
  );

  return payslip;
};

export const getEmployeePayslips = async (employeeId, filters, user) => {
  const { month } = filters;
  const query = { employeeId };

  // RBAC check: Employees can only view their own payslips
  // We need to verify if the user is an employee and if the employeeId matches their record
  if (user.role === "EMPLOYEE") {
      const employeeRecord = await Employee.findOne({ email: user.email });
      if (!employeeRecord || employeeRecord._id.toString() !== employeeId) {
          throw new ApiError(403, "You can only access your own payslips");
      }
  }

  if (month) {
    query.month = month;
  }

  const payslips = await Payslip.find(query).sort({ month: -1 });
  return payslips;
};
