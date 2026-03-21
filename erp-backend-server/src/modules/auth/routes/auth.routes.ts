import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { authenticate } from "@/middleware/authenticate.middleware";
import { validate } from "@/middleware/validate.middleware";
import { authRateLimiter } from "@/middleware/rate-limiter.middleware";
import { loginSchema } from "../schemas/auth.schema";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication — login, logout, token refresh, session management
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@company.com
 *               password:
 *                 type: string
 *                 example: "MyPassword@123"
 *     responses:
 *       200:
 *         description: Login successful — returns access token and sets refresh token cookie
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many login attempts
 */
router.post(
  "/login",
  authRateLimiter,
  validate(loginSchema, "body"),
  authController.login
);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using the refresh token cookie or body
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access token issued — refresh token rotated
 *       401:
 *         description: Refresh token missing, invalid, or reuse detected
 */
router.post("/refresh", authRateLimiter, authController.refresh);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout from current session
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", authenticate, authController.logout);

/**
 * @swagger
 * /auth/logout-all:
 *   post:
 *     summary: Logout from all devices (invalidates all sessions)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All sessions terminated
 */
router.post("/logout-all", authenticate, authController.logoutAll);

/**
 * @swagger
 * /auth/sessions:
 *   get:
 *     summary: List all active sessions for the current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions list
 */
router.get("/sessions", authenticate, authController.getSessions);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current authenticated user context
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user info from access token
 */
router.get("/me", authenticate, authController.getMe);

export default router;
