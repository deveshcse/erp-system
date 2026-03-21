import mongoose, { Schema, type Document, type Model } from "mongoose";
import {
  LEAD_STATUS,
  LEAD_SOURCE,
  type LeadStatus,
  type LeadSource,
} from "@/constants/index.js";

// ---------------------------------------------------------------------------
// Interface
// ---------------------------------------------------------------------------
export interface ILead extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  customerName: string;
  customerCompanyName: string | null;
  phoneNumber: string;
  email: string;
  leadSource: LeadSource;
  status: LeadStatus;
  notes: string | null;
  assignedTo: mongoose.Types.ObjectId | null; // Employee handling the lead
  createdBy: mongoose.Types.ObjectId; // User who created the lead
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const leadSchema = new Schema<ILead>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    customerName: {
      type: String,
      required: [true, "Customer name is required"],
      trim: true,
      maxlength: [150, "Customer name must not exceed 150 characters"],
    },
    customerCompanyName: {
      type: String,
      default: null,
      trim: true,
      maxlength: [200, "Company name must not exceed 200 characters"],
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    leadSource: {
      type: String,
      enum: Object.values(LEAD_SOURCE),
      required: [true, "Lead source is required"],
    },
    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.NEW,
    },
    notes: {
      type: String,
      default: null,
      maxlength: [2000, "Notes must not exceed 2000 characters"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
leadSchema.index({ companyId: 1, status: 1 });
leadSchema.index({ companyId: 1, assignedTo: 1 });
leadSchema.index({ companyId: 1, createdAt: -1 });
leadSchema.index({ customerName: "text", email: "text", customerCompanyName: "text" });

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------
export const Lead: Model<ILead> = mongoose.model<ILead>("Lead", leadSchema);
