import express from 'express';
import { loginAdmin, verifyOTP, resendOTP, getCurrentAdmin } from '../controllers/authController.js';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate an admin, return a JWT + safe admin data
 * @access  Public
 *
 * Future hardening: attach a login rate limiter here, e.g.
 *   router.post('/login', loginRateLimiter, loginAdmin);
 * No rate limiting exists at this stage.
 */
router.post('/login', loginAdmin);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

/**
 * @route   GET /api/auth/me
 * @desc    Get the currently authenticated admin
 * @access  Private — Authorization: Bearer <JWT_TOKEN>
 */
router.get('/me', protect, requireAdmin, getCurrentAdmin);

/**
 * Intentionally NOT implemented:
 *  - POST /api/auth/register → admin accounts are created via
 *    `scripts/createAdmin.js` only. No public registration.
 *  - POST /api/auth/logout   → JWT is stateless; there is nothing
 *    meaningful to invalidate server-side without a blacklist/refresh-token
 *    store. The frontend will discard the token in a later milestone.
 */

export default router;
