import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import { getDashboardOverview } from '../controllers/adminDashboardController.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.get('/overview', getDashboardOverview);

export default router;
