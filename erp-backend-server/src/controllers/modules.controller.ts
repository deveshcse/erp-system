import { type Request, type Response, type NextFunction } from "express";
import { sendSuccess, buildPaginationMeta } from "@/utils/response.util";
import { parsePagination } from "@/utils/pagination.util";
import { getParam } from "@/utils/request.util";
import { HTTP_STATUS } from "@/constants";
import * as employeeService from "@/services/employee.service";
import * as attendanceService from "@/services/attendance.service";
import * as payslipService from "@/services/payslip.service";
import * as taskService from "@/services/task.service";
import * as crmService from "@/services/crm.service";
import {
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type ListEmployeesQuery,
} from "@/validators/employee.validator";
import {
  type MarkAttendanceInput,
  type AttendanceQuery,
  type GeneratePayslipInput,
  type CreateTaskInput,
  type UpdateTaskInput,
  type UpdateTaskStatusInput,
  type TaskQuery,
  type CreateLeadInput,
  type UpdateLeadInput,
  type LeadQuery,
  type CreateQuotationInput,
  type CreateInvoiceInput,
  type UpdatePaymentStatusInput,
} from "@/validators/modules.validator";

// ============================================================================
// EMPLOYEE CONTROLLER
// ============================================================================

export async function createEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employee = await employeeService.createEmployee(
      req.user.companyId!,
      req.body as CreateEmployeeInput,
      req.user.userId
    );
    sendSuccess(res, { employee }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listEmployees(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as ListEmployeesQuery;
    const { employees, total } = await employeeService.listEmployees(
      req.user.companyId!,
      query
    );
    sendSuccess(
      res,
      { employees },
      HTTP_STATUS.OK,
      buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employee = await employeeService.getEmployeeById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { employee });
  } catch (error) {
    next(error);
  }
}

export async function updateEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employee = await employeeService.updateEmployee(
      req.user.companyId!,
      getParam(req, "id"),
      req.body as UpdateEmployeeInput
    );
    sendSuccess(res, { employee });
  } catch (error) {
    next(error);
  }
}

export async function deleteEmployee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const employee = await employeeService.deleteEmployee(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { employee });
  } catch (error) {
    next(error);
  }
}

export async function getDepartments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const departments = await employeeService.getDepartments(req.user.companyId!);
    sendSuccess(res, { departments });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// ATTENDANCE CONTROLLER
// ============================================================================

export async function markAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const attendance = await attendanceService.markAttendance(
      req.user.companyId!,
      req.body as MarkAttendanceInput,
      req.user.userId
    );
    sendSuccess(res, { attendance }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listAttendance(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as AttendanceQuery;
    const { records, total } = await attendanceService.listAttendance(
      req.user.companyId!,
      query
    );
    sendSuccess(
      res,
      { records },
      HTTP_STATUS.OK,
      buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getMonthlyAttendanceReport(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const month = parseInt(getParam(req, "month"), 10);
    const year = parseInt(getParam(req, "year"), 10);
    const report = await attendanceService.getMonthlyReport(
      req.user.companyId!,
      month,
      year
    );
    sendSuccess(res, report);
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// PAYSLIP CONTROLLER
// ============================================================================

export async function generatePayslip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payslip = await payslipService.generatePayslip(
      req.user.companyId!,
      req.body as GeneratePayslipInput,
      req.user.userId
    );
    sendSuccess(res, { payslip }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listPayslips(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pagination = parsePagination(req);
    const { payslips, total } = await payslipService.listPayslips(
      req.user.companyId!,
      pagination,
      {
        employeeId: req.query["employeeId"] as string | undefined,
        month: req.query["month"]
          ? parseInt(req.query["month"] as string, 10)
          : undefined,
        year: req.query["year"]
          ? parseInt(req.query["year"] as string, 10)
          : undefined,
      }
    );
    sendSuccess(
      res,
      { payslips },
      HTTP_STATUS.OK,
      buildPaginationMeta(pagination.page, pagination.limit, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getPayslip(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payslip = await payslipService.getPayslipById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { payslip });
  } catch (error) {
    next(error);
  }
}

export async function markPayslipPaid(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const payslip = await payslipService.markPayslipPaid(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { payslip });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// TASK CONTROLLER
// ============================================================================

export async function createTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await taskService.createTask(
      req.user.companyId!,
      req.body as CreateTaskInput,
      req.user.userId
    );
    sendSuccess(res, { task }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listTasks(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as TaskQuery;
    const { tasks, total } = await taskService.listTasks(
      req.user.companyId!,
      query,
      req.user.userId,
      req.user.role
    );
    sendSuccess(
      res,
      { tasks },
      HTTP_STATUS.OK,
      buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await taskService.getTaskById(
      req.user.companyId!,
      getParam(req, "id"),
      req.user.userId,
      req.user.role
    );
    sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await taskService.updateTask(
      req.user.companyId!,
      getParam(req, "id"),
      req.body as UpdateTaskInput
    );
    sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await taskService.updateTaskStatus(
      req.user.companyId!,
      getParam(req, "id"),
      req.body as UpdateTaskStatusInput,
      req.user.userId
    );
    sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// LEAD CONTROLLER
// ============================================================================

export async function createLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lead = await crmService.createLead(
      req.user.companyId!,
      req.body as CreateLeadInput,
      req.user.userId
    );
    sendSuccess(res, { lead }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listLeads(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as LeadQuery;
    const { leads, total } = await crmService.listLeads(
      req.user.companyId!,
      query
    );
    sendSuccess(
      res,
      { leads },
      HTTP_STATUS.OK,
      buildPaginationMeta(query.page ?? 1, query.limit ?? 20, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lead = await crmService.getLeadById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { lead });
  } catch (error) {
    next(error);
  }
}

export async function updateLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const lead = await crmService.updateLead(
      req.user.companyId!,
      getParam(req, "id"),
      req.body as UpdateLeadInput
    );
    sendSuccess(res, { lead });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// QUOTATION CONTROLLER
// ============================================================================

export async function createQuotation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quotation = await crmService.createQuotation(
      req.user.companyId!,
      req.body as CreateQuotationInput,
      req.user.userId
    );
    sendSuccess(res, { quotation }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listQuotations(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pagination = parsePagination(req);
    const status = req.query["status"] as string | undefined;
    const { quotations, total } = await crmService.listQuotations(
      req.user.companyId!,
      pagination,
      status
    );
    sendSuccess(
      res,
      { quotations },
      HTTP_STATUS.OK,
      buildPaginationMeta(pagination.page, pagination.limit, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getQuotation(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const quotation = await crmService.getQuotationById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { quotation });
  } catch (error) {
    next(error);
  }
}

// ============================================================================
// INVOICE CONTROLLER
// ============================================================================

export async function createInvoice(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invoice = await crmService.createInvoice(
      req.user.companyId!,
      req.body as CreateInvoiceInput,
      req.user.userId
    );
    sendSuccess(res, { invoice }, HTTP_STATUS.CREATED);
  } catch (error) {
    next(error);
  }
}

export async function listInvoices(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const pagination = parsePagination(req);
    const paymentStatus = req.query["paymentStatus"] as string | undefined;
    const { invoices, total } = await crmService.listInvoices(
      req.user.companyId!,
      pagination,
      { paymentStatus }
    );
    sendSuccess(
      res,
      { invoices },
      HTTP_STATUS.OK,
      buildPaginationMeta(pagination.page, pagination.limit, total)
    );
  } catch (error) {
    next(error);
  }
}

export async function getInvoice(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invoice = await crmService.getInvoiceById(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { invoice });
  } catch (error) {
    next(error);
  }
}

export async function updateInvoicePayment(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const invoice = await crmService.updateInvoicePayment(
      req.user.companyId!,
      getParam(req, "id"),
      req.body as UpdatePaymentStatusInput
    );
    sendSuccess(res, { invoice });
  } catch (error) {
    next(error);
  }
}
