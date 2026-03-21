import { Router } from "express";
import authRoutes from "@/modules/auth/routes/auth.routes";
import companyRoutes from "@/modules/company/routes/company.routes";
import employeeRouter from "@/modules/employee/routes/employee.routes";
import attendanceRouter from "@/modules/attendance/routes/attendance.routes";
import payslipRouter from "@/modules/payslip/routes/payslip.routes";
import taskRouter from "@/modules/task/routes/task.routes";
import crmRouter from "@/modules/crm/routes/crm.routes";

const router = Router();

// ─── Health check ──────────────────────────────────────────────────────────

/**
 * @swagger
 * /health:
 *   get:
 *     summary: API health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is running
 */
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    data: {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env["npm_package_version"] ?? "1.0.0",
    },
  });
});

// ─── Module routes ─────────────────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/companies", companyRoutes);
router.use("/employees", employeeRouter);
router.use("/attendance", attendanceRouter);
router.use("/payslips", payslipRouter);
router.use("/tasks", taskRouter);
router.use("/", crmRouter); // Leads, Quotations, Invoices are nested inside

export default router;
