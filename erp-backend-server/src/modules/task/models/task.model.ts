import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  TASK_STATUS,
  TASK_PRIORITY,
  type TaskStatus,
  type TaskPriority,
} from "@/constants/index.js";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface ITask extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  assignedTo: mongoose.Types.ObjectId; // Employee._id
  assignedBy: mongoose.Types.ObjectId; // User._id (CompanyAdmin)
  deadline: Date;
  priority: TaskPriority;
  status: TaskStatus;
  completedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const taskSchema = new Schema<ITask>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title must not exceed 200 characters"],
    },
    description: {
      type: String,
      required: [true, "Task description is required"],
      trim: true,
      maxlength: [2000, "Description must not exceed 2000 characters"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: [true, "Assigned employee is required"],
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Assigning user is required"],
    },
    deadline: {
      type: Date,
      required: [true, "Deadline is required"],
    },
    priority: {
      type: String,
      enum: Object.values(TASK_PRIORITY),
      default: TASK_PRIORITY.MEDIUM,
    },
    status: {
      type: String,
      enum: Object.values(TASK_STATUS),
      default: TASK_STATUS.PENDING,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      default: null,
      maxlength: [1000, "Notes must not exceed 1000 characters"],
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
taskSchema.index({ companyId: 1, assignedTo: 1, status: 1 });
taskSchema.index({ companyId: 1, status: 1, deadline: 1 });
taskSchema.index({ companyId: 1, priority: 1 });
taskSchema.index({ title: "text", description: "text" });

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Task: Model<ITask> = mongoose.model<ITask>("Task", taskSchema);
