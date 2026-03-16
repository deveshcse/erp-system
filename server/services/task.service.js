import { Task } from "../models/task.model.js";
import { Employee } from "../models/employee.model.js";
import ApiError from "../utils/ApiError.js";

export const createTask = async (taskData, assignedBy, companyId) => {
  // Verify assignee belongs to the same company
  const assignee = await Employee.findOne({ _id: taskData.assignedTo, companyId });
  if (!assignee) {
    throw new ApiError(404, "Assignee not found in your company");
  }

  const task = await Task.create({
    ...taskData,
    assignedBy,
    companyId,
  });

  return task;
};

export const updateTaskStatus = async (taskId, status, user, companyId) => {
  const query = { _id: taskId, companyId };

  // RBAC: Employees can only update tasks assigned to them
  if (user.role === "EMPLOYEE") {
    // Find employee record for this user
    const empRecord = await Employee.findOne({ userId: user._id });
    if (!empRecord) throw new ApiError(404, "Employee record not found for your account");
    query.assignedTo = empRecord._id;
  }

  const task = await Task.findOneAndUpdate(
    query,
    { $set: { status } },
    { new: true, runValidators: true }
  );

  if (!task) {
    throw new ApiError(404, "Task not found or you don't have permission to update it");
  }

  return task;
};

export const listTasks = async (filters, user, companyId) => {
  const { page = 1, limit = 10, status, priority, assignedTo } = filters;
  const skip = (page - 1) * limit;

  const query = { companyId };

  // If Employee, only show tasks assigned to them
  if (user.role === "EMPLOYEE") {
    const empRecord = await Employee.findOne({ userId: user._id });
    if (!empRecord) throw new ApiError(404, "Employee record not found for your account");
    query.assignedTo = empRecord._id;
  } else if (assignedTo) {
    // Admin can filter by specific assignee
    query.assignedTo = assignedTo;
  }

  if (status) query.status = status;
  if (priority) query.priority = priority;

  const tasks = await Task.find(query)
    .populate("assignedTo", "fullName employeeId")
    .populate("assignedBy", "name email")
    .skip(skip)
    .limit(limit)
    .sort({ deadline: 1 });

  const total = await Task.countDocuments(query);

  return {
    tasks,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};
