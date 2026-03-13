import express from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';

const router = express.Router();

/**
 * @swagger
 * /healthcheck:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a success message if the API is running.
 *     responses:
 *       200:
 *         description: A successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.route('/healthcheck').get(asyncHandler(async (req, res) => {
    return res.status(200).json(new ApiResponse(200, {}, "Health check passed"));
}));

export default router;
