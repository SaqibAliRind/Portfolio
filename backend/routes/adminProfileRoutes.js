import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminProfile,
  createAdminProfile,
  updateAdminProfile,
  updateAdminProfileStatus,
} from '../controllers/adminProfileController.js';

const router = express.Router();

// All routes in this file are protected and require admin role
router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminProfile)
  .post(createAdminProfile)
  .put(updateAdminProfile);

router.patch('/status', updateAdminProfileStatus);

export default router;
