import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminCertifications,
  getAdminCertificationById,
  createCertification,
  updateCertification,
  deleteCertification,
  updateCertificationStatus,
} from '../controllers/adminCertificationController.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminCertifications)
  .post(createCertification);

router.route('/:id')
  .get(getAdminCertificationById)
  .put(updateCertification)
  .delete(deleteCertification);

router.patch('/:id/status', updateCertificationStatus);

export default router;
