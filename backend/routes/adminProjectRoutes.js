import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminProjects,
  getAdminProjectById,
  createProject,
  updateProject,
  deleteProject,
  updateProjectStatus,
  updateProjectFeatured,
} from '../controllers/adminProjectController.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminProjects)
  .post(createProject);

router.route('/:id')
  .get(getAdminProjectById)
  .put(updateProject)
  .delete(deleteProject);

router.patch('/:id/status', updateProjectStatus);
router.patch('/:id/featured', updateProjectFeatured);

export default router;
