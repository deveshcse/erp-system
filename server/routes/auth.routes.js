import { Router } from "express";
import { login, logout, register } from "../controllers/auth.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import { registerValidator, loginValidator } from "../validators/auth.validator.js";

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user (SUPER_ADMIN only)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *               role: { type: string, enum: [SUPER_ADMIN, COMPANY_ADMIN, EMPLOYEE] }
 *               companyId: { type: string }
 */
router.route("/register").post(verifyJWT, authorizeRoles("SUPER_ADMIN"), registerValidator, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 statusCode: { type: number, example: 200 }
 *                 data:
 *                   type: object
 *                   properties:
 *                     user: { type: object }
 *                     accessToken: { type: string }
 *                     refreshToken: { type: string }
 *                 message: { type: string, example: "User logged in successfully" }
 *                 success: { type: boolean, example: true }
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
router.route("/login").post(loginValidator, login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 */
router.route("/logout").post(verifyJWT, logout);

export default router;
