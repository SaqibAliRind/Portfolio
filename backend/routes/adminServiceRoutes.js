import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminServices,
  getAdminServiceById,
  createService,
  updateService,
  deleteService,
  updateServiceStatus,
  updateServiceFeatured,
  updateServiceAvailability,
} from '../controllers/adminServiceController.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminServices)
  .post(createService);

router.route('/:id')
  .get(getAdminServiceById)
  .put(updateService)
  .delete(deleteService);

router.patch('/:id/status', updateServiceStatus);
router.patch('/:id/featured', updateServiceFeatured);
router.patch('/:id/availability', updateServiceAvailability);

export default router;
