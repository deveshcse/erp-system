import { type Request, type Response, type NextFunction } from "express";
import { sendSuccess, buildPaginationMeta } from "@/utils/response.util";
import { getParam } from "@/utils/request.util";
import { HTTP_STATUS } from "@/constants";
import * as taskService from "../services/task.service";
import {
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskQuery,
} from "../schemas/task.schema";

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
      req.user.role as any
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
      req.user.role as any
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
      req.body as { status: any },
      req.user.userId
    );
    sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const task = await taskService.deleteTask(
      req.user.companyId!,
      getParam(req, "id")
    );
    sendSuccess(res, { task });
  } catch (error) {
    next(error);
  }
}
