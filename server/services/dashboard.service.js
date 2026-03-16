import { Company } from "../models/company.model.js";
import { Lead } from "../models/lead.model.js";
import { Invoice } from "../models/invoice.model.js";
import { Task } from "../models/task.model.js";
import { Attendance } from "../models/attendance.model.js";
import { Employee } from "../models/employee.model.js";
import mongoose from "mongoose";

export const getSuperAdminStats = async () => {
  // Company Growth: Count per month for last 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const registrationTrend = await Company.aggregate([
    {
      $match: {
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  const totalCompanies = await Company.countDocuments();

  return {
    registrationTrend,
    totalCompanies
  };
};

export const getCompanyAdminStats = async (companyId) => {
  const cId = new mongoose.Types.ObjectId(companyId);

  // 1. Lead Pipeline (Pie Chart Data)
  const leadStats = await Lead.aggregate([
    { $match: { companyId: cId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  // 2. Revenue Trend (Last 6 Months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const revenueTrend = await Invoice.aggregate([
    {
      $match: {
        companyId: cId,
        createdAt: { $gte: sixMonthsAgo },
        paymentStatus: { $ne: "CANCELLED" }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        revenue: { $sum: "$total" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  return {
    leadStats,
    revenueTrend
  };
};

export const getEmployeeStats = async (user, companyId) => {
  const cId = new mongoose.Types.ObjectId(companyId);
  
  // Find employee record
  const employee = await Employee.findOne({ userId: user._id, companyId: cId });
  if (!employee) return null;

  // 1. Task Distribution
  const taskStats = await Task.aggregate([
    { $match: { assignedTo: employee._id, companyId: cId } },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  // 2. Attendance this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const attendanceStats = await Attendance.aggregate([
    { 
      $match: { 
        employeeId: employee._id, 
        companyId: cId,
        date: { $gte: startOfMonth }
      } 
    },
    { $group: { _id: "$status", count: { $sum: 1 } } }
  ]);

  return {
    taskStats,
    attendanceStats
  };
};
