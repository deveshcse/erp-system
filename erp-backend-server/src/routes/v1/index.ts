import { Router } from "express";
import authRoutes from "./auth.routes";
import companyRoutes from "./company.routes";
import {
  employeeRouter,
  attendanceRouter,
  payslipRouter,
  taskRouter,
  leadRouter,
  quotationRouter,
  invoiceRouter,
} from "./modules.routes";

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
router.use("/leads", leadRouter);
router.use("/quotations", quotationRouter);
router.use("/invoices", invoiceRouter);

export default router;
