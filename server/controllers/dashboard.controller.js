import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import * as dashboardService from "../services/dashboard.service.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { role, companyId } = req.user;
  let stats = {};

  if (role === 'SUPER_ADMIN') {
    stats = await dashboardService.getSuperAdminStats();
  } else if (role === 'COMPANY_ADMIN') {
    stats = await dashboardService.getCompanyAdminStats(companyId);
  } else if (role === 'EMPLOYEE') {
    stats = await dashboardService.getEmployeeStats(req.user, companyId);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, stats, "Dashboard statistics fetched successfully"));
});
