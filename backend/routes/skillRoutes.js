import express from 'express';
import { getSkills } from '../controllers/skillController.js';

const router = express.Router();

// GET /api/skills
router.get('/', getSkills);

export default router;
