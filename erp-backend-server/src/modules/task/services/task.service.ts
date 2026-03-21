import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { Employee } from "@/modules/employee/models/employee.model.js";
import { logger } from "@/config/logger.js";
import { TASK_STATUS, ROLES } from "@/constants/index.js";
import { NotFoundError, ForbiddenError } from "@/utils/errors.util.js";
import {
  type CreateTaskInput,
  type UpdateTaskInput,
  type TaskQuery,
} from "../schemas/task.schema.js";
export type UpdateTaskStatusInput = { status: (typeof TASK_STATUS)[keyof typeof TASK_STATUS] };
import { getPaginationSkip } from "@/utils/pagination.util.js";
import { type Role } from "@/constants/index.js";

// ---------------------------------------------------------------------------
// createTask — admin assigns task to an employee
// ---------------------------------------------------------------------------
export async function createTask(
  companyId: string,
  input: CreateTaskInput,
  assignedByUserId: string
) {
  // Verify the target employee belongs to this company.
  const employee = await Employee.findOne({
    _id: new mongoose.Types.ObjectId(input.assignedTo),
    companyId: new mongoose.Types.ObjectId(companyId),
  });
  if (!employee) throw new NotFoundError("Employee");

  const task = await Task.create({
    companyId: new mongoose.Types.ObjectId(companyId),
    title: input.title,
    description: input.description,
    assignedTo: new mongoose.Types.ObjectId(input.assignedTo),
    assignedBy: new mongoose.Types.ObjectId(assignedByUserId),
    deadline: input.deadline,
    priority: input.priority,
    status: TASK_STATUS.PENDING,
    notes: input.notes ?? null,
  });

  logger.info(
    { taskId: task._id.toString(), assignedTo: input.assignedTo, companyId },
    "[Task] Task created"
  );

  return task.populate([
    { path: "assignedTo", select: "fullName employeeId" },
    { path: "assignedBy", select: "name email" },
  ]);
}

// ---------------------------------------------------------------------------
// listTasks — filtered by role:
//   - CompanyAdmin sees all tasks in the company
//   - Employee sees only tasks assigned to them (via their Employee record)
// ---------------------------------------------------------------------------
export async function listTasks(
  companyId: string,
  query: TaskQuery,
  requestingUserId: string,
  requestingRole: Role
) {
  const filter: Record<string, unknown> = {
    companyId: new mongoose.Types.ObjectId(companyId),
  };

  // Employees can only see their own tasks.
  if (requestingRole === ROLES.EMPLOYEE) {
    const employee = await Employee.findOne({
      userId: new mongoose.Types.ObjectId(requestingUserId),
      companyId: new mongoose.Types.ObjectId(companyId),
    });
    if (!employee) throw new NotFoundError("Employee record for current user");
    filter["assignedTo"] = employee._id;
  } else if (query.assignedTo) {
    filter["assignedTo"] = new mongoose.Types.ObjectId(query.assignedTo);
  }

  if (query.status) filter["status"] = query.status;
  if (query.priority) filter["priority"] = query.priority;
  if (query.search) filter["$text"] = { $search: query.search };

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate("assignedTo", "fullName employeeId")
      .populate("assignedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(getPaginationSkip(query.page, query.limit))
      .limit(query.limit),
    Task.countDocuments(filter),
  ]);

  return { tasks, total };
}

// ---------------------------------------------------------------------------
// getTaskById
// ---------------------------------------------------------------------------
export async function getTaskById(
  companyId: string,
  taskId: string,
  requestingUserId: string,
  requestingRole: Role
) {
  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    companyId: new mongoose.Types.ObjectId(companyId),
  })
    .populate("assignedTo", "fullName employeeId department")
    .populate("assignedBy", "name email");

  if (!task) throw new NotFoundError("Task");

  // Employees can only view tasks assigned to them.
  if (requestingRole === ROLES.EMPLOYEE) {
    const employee = await Employee.findOne({
      userId: new mongoose.Types.ObjectId(requestingUserId),
      companyId: new mongoose.Types.ObjectId(companyId),
    });
    const assignedTo = task.assignedTo as { _id: mongoose.Types.ObjectId };
    if (!employee || !employee._id.equals(assignedTo._id)) {
      throw new ForbiddenError();
    }
  }

  return task;
}

// ---------------------------------------------------------------------------
// updateTask — full update for CompanyAdmin
// ---------------------------------------------------------------------------
export async function updateTask(
  companyId: string,
  taskId: string,
  input: UpdateTaskInput
) {
  type TaskUpdatePayload = Record<string, unknown>;
  const updateData: TaskUpdatePayload = { ...input };

  // Set completedAt timestamp when status becomes Completed.
  const inputStatus = input.status as string | undefined;
  if (inputStatus === TASK_STATUS.COMPLETED) {
    updateData["completedAt"] = new Date();
  } else if (inputStatus && inputStatus !== TASK_STATUS.COMPLETED) {
    updateData["completedAt"] = null;
  }

  const task = await Task.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(taskId),
      companyId: new mongoose.Types.ObjectId(companyId),
    },
    { $set: updateData },
    { new: true, runValidators: true }
  );

  if (!task) throw new NotFoundError("Task");

  logger.info({ taskId, companyId }, "[Task] Task updated");
  return task;
}

// ---------------------------------------------------------------------------
// updateTaskStatus — Employee-only: update the status of their own task
// ---------------------------------------------------------------------------
export async function updateTaskStatus(
  companyId: string,
  taskId: string,
  input: UpdateTaskStatusInput,
  requestingUserId: string
) {
  // Verify the task belongs to this employee.
  const employee = await Employee.findOne({
    userId: new mongoose.Types.ObjectId(requestingUserId),
    companyId: new mongoose.Types.ObjectId(companyId),
  });
  if (!employee) throw new NotFoundError("Employee record for current user");

  const task = await Task.findOne({
    _id: new mongoose.Types.ObjectId(taskId),
    companyId: new mongoose.Types.ObjectId(companyId),
    assignedTo: employee._id,
  });
  if (!task) throw new NotFoundError("Task");

  task.status = input.status;
  if (input.status === TASK_STATUS.COMPLETED) {
    task.completedAt = new Date();
  }
  await task.save();

  logger.info({ taskId, status: input.status }, "[Task] Task status updated by employee");
  return task;
}

// ---------------------------------------------------------------------------
// deleteTask
// ---------------------------------------------------------------------------
export async function deleteTask(companyId: string, taskId: string) {
  const task = await Task.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(taskId),
    companyId: new mongoose.Types.ObjectId(companyId),
  });

  if (!task) throw new NotFoundError("Task");

  logger.info({ taskId, companyId }, "[Task] Task deleted");
  return task;
}

