import { type Request, type Response, type NextFunction } from "express";
import { sendSuccess, buildPaginationMeta } from "@/utils/response.util";
import { getParam } from "@/utils/request.util";
import { HTTP_STATUS } from "@/constants";
import * as employeeService from "../services/employee.service";
import {
  type CreateEmployeeInput,
  type UpdateEmployeeInput,
  type ListEmployeesQuery,
} from "../schemas/employee.schema";

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
