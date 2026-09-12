import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminExperience,
  getAdminExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  updateExperienceStatus,
} from '../controllers/adminExperienceController.js';

const router = express.Router();

// Apply authentication and admin authorization to all routes in this router
router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminExperience)
  .post(createExperience);

router.route('/:id')
  .get(getAdminExperienceById)
  .put(updateExperience)
  .delete(deleteExperience);

router.patch('/:id/status', updateExperienceStatus);

export default router;
