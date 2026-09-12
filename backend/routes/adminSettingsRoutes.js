import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminSettings,
  updateSettings,
} from '../controllers/adminSettingsController.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminSettings)
  .put(updateSettings);

export default router;
