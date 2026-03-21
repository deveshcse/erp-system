import { type Request, type Response, type NextFunction } from "express";
import { sendSuccess, buildPaginationMeta } from "@/utils/response.util.js";
import { getParam } from "@/utils/request.util.js";
import { HTTP_STATUS } from "@/constants/index.js";
import * as attendanceService from "../services/attendance.service.js";
import {
  type MarkAttendanceInput,
  type AttendanceQuery,
} from "../schemas/attendance.schema.js";

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
