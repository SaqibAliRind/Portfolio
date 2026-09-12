import express from 'express';
import { getExperience } from '../controllers/experienceController.js';

const router = express.Router();

// GET /api/experience
router.get('/', getExperience);

export default router;
