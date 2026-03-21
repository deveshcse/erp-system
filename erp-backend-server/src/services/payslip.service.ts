import mongoose from "mongoose";
import { Payslip } from "@/models/payslip.model";
import { Employee } from "@/models/employee.model";
import { Attendance } from "@/models/attendance.model";
import { logger } from "@/config/logger";
import { ATTENDANCE_STATUS, PAYMENT_STATUS } from "@/constants";
import { NotFoundError, ConflictError, AppError } from "@/utils/errors.util";
import { HTTP_STATUS, ERROR_CODES } from "@/constants";
import { type GeneratePayslipInput } from "@/validators/modules.validator";
import { getPaginationSkip } from "@/utils/pagination.util";
import { type PaginationQuery } from "@/types";

// ---------------------------------------------------------------------------
// generatePayslip
//
// Calculates net salary based on:
//   (basicSalary / workingDays) * presentDays + allowances - deductions
//
// Fetches present/leave days automatically from the Attendance collection
// for the given month/year.
// ---------------------------------------------------------------------------
export async function generatePayslip(
  companyId: string,
  input: GeneratePayslipInput,
  processedByUserId: string
) {
  // Prevent duplicate payslips for the same employee/month/year.
  const existing = await Payslip.findOne({
    companyId: new mongoose.Types.ObjectId(companyId),
    employeeId: new mongoose.Types.ObjectId(input.employeeId),
    month: input.month,
    year: input.year,
  });
  if (existing) {
    throw new ConflictError(
      `Payslip for this employee for ${input.month}/${input.year} already exists`
    );
  }

  // Verify employee belongs to this company.
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(input.employeeId),
    companyId: new mongoose.Types.ObjectId(companyId),
  });
  if (!employee) throw new NotFoundError("Employee");

  // Fetch attendance summary for the month.
  const startDate = new Date(Date.UTC(input.year, input.month - 1, 1));
  const endDate = new Date(Date.UTC(input.year, input.month, 0, 23, 59, 59));

  const attendanceSummary = await Attendance.aggregate([
    {
      $match: {
        companyId: new mongoose.Types.ObjectId(companyId),
        employeeId: new mongoose.Types.ObjectId(input.employeeId),
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: null,
        presentDays: {
          $sum: {
            $cond: [
              { $in: ["$status", [ATTENDANCE_STATUS.PRESENT, ATTENDANCE_STATUS.HALF_DAY]] },
              { $cond: [{ $eq: ["$status", ATTENDANCE_STATUS.HALF_DAY] }, 0.5, 1] },
              0,
            ],
          },
        },
        leaveDays: {
          $sum: { $cond: [{ $eq: ["$status", ATTENDANCE_STATUS.LEAVE] }, 1, 0] },
        },
      },
    },
  ]);

  const summary = attendanceSummary[0] ?? { presentDays: 0, leaveDays: 0 };
  const presentDays: number = summary.presentDays ?? 0;
  const leaveDays: number = summary.leaveDays ?? 0;

  // Calculate net salary.
  const perDayRate = employee.salary / input.workingDays;
  const earnedBasic = parseFloat((perDayRate * presentDays).toFixed(2));
  const netSalary = parseFloat(
    (earnedBasic + input.allowances - input.deductions).toFixed(2)
  );

  if (netSalary < 0) {
    throw new AppError(
      "Calculated net salary is negative — please check deductions",
      HTTP_STATUS.BAD_REQUEST,
      ERROR_CODES.VALIDATION_ERROR
    );
  }

  const payslip = await Payslip.create({
    companyId: new mongoose.Types.ObjectId(companyId),
    employeeId: new mongoose.Types.ObjectId(input.employeeId),
    month: input.month,
    year: input.year,
    basicSalary: employee.salary,
    allowances: input.allowances,
    deductions: input.deductions,
    workingDays: input.workingDays,
    presentDays,
    leaveDays,
    netSalary,
    paymentStatus: PAYMENT_STATUS.PENDING,
    processedBy: new mongoose.Types.ObjectId(processedByUserId),
    generatedAt: new Date(),
  });

  logger.info(
    {
      payslipId: payslip._id.toString(),
      employeeId: input.employeeId,
      month: input.month,
      year: input.year,
      netSalary,
    },
    "[Payslip] Payslip generated"
  );

  return payslip.populate("employeeId", "fullName employeeId department designation");
}

// ---------------------------------------------------------------------------
// listPayslips — paginated list scoped to company (optionally by employee)
// ---------------------------------------------------------------------------
export async function listPayslips(
  companyId: string,
  pagination: PaginationQuery,
  filters: { employeeId?: string; month?: number; year?: number }
) {
  const filter: Record<string, unknown> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  if (filters.employeeId) {
    filter["employeeId"] = new mongoose.Types.ObjectId(filters.employeeId);
  }
  if (filters.month) filter["month"] = filters.month;
  if (filters.year) filter["year"] = filters.year;

  const [payslips, total] = await Promise.all([
    Payslip.find(filter)
      .populate("employeeId", "fullName employeeId department")
      .sort({ year: -1, month: -1 })
      .skip(getPaginationSkip(pagination.page, pagination.limit))
      .limit(pagination.limit),
    Payslip.countDocuments(filter),
  ]);

  return { payslips, total };
}

// ---------------------------------------------------------------------------
// getPayslipById — employees can only access their own payslips (enforced
// at the controller layer by checking employeeId against req.user)
// ---------------------------------------------------------------------------
export async function getPayslipById(companyId: string, payslipId: string) {
  const payslip = await Payslip.findOne({
    _id: new mongoose.Types.ObjectId(payslipId),
    companyId: new mongoose.Types.ObjectId(companyId),
  }).populate("employeeId", "fullName employeeId department designation");

  if (!payslip) throw new NotFoundError("Payslip");
  return payslip;
}

// ---------------------------------------------------------------------------
// markPayslipPaid
// ---------------------------------------------------------------------------
export async function markPayslipPaid(companyId: string, payslipId: string) {
  const payslip = await Payslip.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(payslipId),
      companyId: new mongoose.Types.ObjectId(companyId),
    },
    { $set: { paymentStatus: PAYMENT_STATUS.PAID } },
    { new: true }
  );

  if (!payslip) throw new NotFoundError("Payslip");

  logger.info({ payslipId }, "[Payslip] Payslip marked as paid");
  return payslip;
}
