import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminSkills,
  getAdminSkillById,
  createSkill,
  updateSkill,
  deleteSkill,
  updateSkillStatus,
  updateSkillFeatured,
} from '../controllers/adminSkillController.js';

const router = express.Router();

// All routes: protected + admin-only
router.use(protect);
router.use(requireAdmin);

router.route('/')
  .get(getAdminSkills)
  .post(createSkill);

router.route('/:id')
  .get(getAdminSkillById)
  .put(updateSkill)
  .delete(deleteSkill);

router.patch('/:id/status', updateSkillStatus);
router.patch('/:id/featured', updateSkillFeatured);

export default router;
