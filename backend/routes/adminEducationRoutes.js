import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminEducation,
  getAdminEducationById,
  createEducation,
  updateEducation,
  deleteEducation,
  updateEducationStatus,
} from '../controllers/adminEducationController.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminEducation)
  .post(createEducation);

router.route('/:id')
  .get(getAdminEducationById)
  .put(updateEducation)
  .delete(deleteEducation);

router.patch('/:id/status', updateEducationStatus);

export default router;
