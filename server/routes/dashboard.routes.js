import { Router } from "express";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { getDashboardStats } from "../controllers/dashboard.controller.js";

const router = Router();

router.use(verifyJWT);

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get role-based dashboard statistics for charts
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Stats fetched successfully
 */
router.get("/stats", getDashboardStats);

export default router;
