import { Payslip } from "../models/payslip.model.js";
import { Employee } from "../models/employee.model.js";
import ApiError from "../utils/ApiError.js";

import { Attendance } from "../models/attendance.model.js";

/**
 * Calculate total weekdays (Mon-Fri) in a given month.
 */
const getTotalWeekdaysInMonth = (year, month) => {
  const totalDays = new Date(year, month, 0).getDate();
  let weekdays = 0;
  for (let d = 1; d <= totalDays; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) weekdays++;
  }
  return weekdays;
};

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

  // Calculate total weekdays in the month for proration
  const totalWeekdays = getTotalWeekdaysInMonth(year, monthNum);

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

    // Prorate salary based on attendance: (basicSalary / totalWeekdays) * workingDays
    const dailyRate = totalWeekdays > 0 ? basicSalary / totalWeekdays : 0;
    const proratedSalary = Math.round(dailyRate * workingDays * 100) / 100;
    const netSalary = Math.round((proratedSalary + allowances - deductions) * 100) / 100;

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
      const employeeRecord = await Employee.findOne({ userId: user._id });
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
  const { month, page = 1, limit = 10 } = filters;
  const skip = (page - 1) * limit;
  const query = { companyId };

  if (month) {
    query.month = month;
  }

  const payslips = await Payslip.find(query)
    .populate("employeeId", "fullName employeeId email department designation")
    .skip(skip)
    .limit(Number(limit))
    .sort({ month: -1 });

  const total = await Payslip.countDocuments(query);

  return {
    payslips,
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Employee self-service: get own payslips using the logged-in user's email.
 */
export const getMyPayslips = async (user, filters) => {
  const { month } = filters;

  // Resolve the Employee record from the User's email
  const employeeRecord = await Employee.findOne({ userId: user._id });
  if (!employeeRecord) {
    throw new ApiError(404, "No employee record found for your account");
  }

  const query = { employeeId: employeeRecord._id };
  if (month) {
    query.month = month;
  }

  const payslips = await Payslip.find(query)
    .populate("employeeId", "fullName employeeId email department designation")
    .sort({ month: -1 });

  return payslips;
};
