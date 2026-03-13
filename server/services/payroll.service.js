import { Payslip } from "../models/payslip.model.js";
import { Employee } from "../models/employee.model.js";
import ApiError from "../utils/ApiError.js";

import { Attendance } from "../models/attendance.model.js";

export const processPayroll = async (payrollData, companyId) => {
  const { 
    employeeId, 
    month, // YYYY-MM
    workingDays: manualWorkingDays, 
    leaveDays: manualLeaveDays, 
    allowances: manualAllowances, 
    deductions: manualDeductions 
  } = payrollData;

  // Derive start and end date for attendance lookup
  const [year, monthNum] = month.split("-").map(Number);
  const startDate = new Date(year, monthNum - 1, 1);
  const endDate = new Date(year, monthNum, 0);

  // If employeeId is provided, process single, otherwise process all active employees
  const query = { companyId, status: "ACTIVE" };
  if (employeeId) query._id = employeeId;

  const employees = await Employee.find(query);
  if (employeeId && employees.length === 0) {
    throw new ApiError(404, "Employee not found in your company");
  }

  const generatedPayslips = [];

  for (const employee of employees) {
    let workingDays = manualWorkingDays;
    let leaveDays = manualLeaveDays || 0;
    let allowances = manualAllowances ?? employee.allowances ?? 0;
    let deductions = manualDeductions ?? employee.deductions ?? 0;

    // If workingDays not provided, calculate from attendance
    if (workingDays === undefined) {
      const attendance = await Attendance.find({
        employeeId: employee._id,
        date: { $gte: startDate, $lte: endDate }
      });

      workingDays = attendance.filter(a => a.status === "PRESENT").length;
      leaveDays = attendance.filter(a => a.status === "ABSENT" || a.status === "LEAVE").length;
    }

    const basicSalary = employee.salary;
    const netSalary = basicSalary + allowances - deductions;

    const payslip = await Payslip.findOneAndUpdate(
      { employeeId: employee._id, month },
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

    generatedPayslips.push(payslip);
  }

  return employeeId ? generatedPayslips[0] : generatedPayslips;
};

export const getEmployeePayslips = async (employeeId, filters, user) => {
  const { month } = filters;
  const query = { employeeId };

  // RBAC check: Employees can only view their own payslips
  if (user.role === "EMPLOYEE") {
      const employeeRecord = await Employee.findOne({ email: user.email });
      if (!employeeRecord || employeeRecord._id.toString() !== employeeId) {
          throw new ApiError(403, "You can only access your own payslips");
      }
  }

  if (month) {
    query.month = month;
  }

  const payslips = await Payslip.find(query)
    .populate("employeeId", "fullName employeeId email department designation")
    .sort({ month: -1 });
    
  return payslips;
};

export const getAllCompanyPayslips = async (companyId, filters) => {
  const { month } = filters;
  const query = { companyId };

  if (month) {
    query.month = month;
  }

  const payslips = await Payslip.find(query)
    .populate("employeeId", "fullName employeeId email department designation")
    .sort({ month: -1 });

  return payslips;
};
