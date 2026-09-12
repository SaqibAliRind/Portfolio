import express from 'express';
import { getProjects, getProjectBySlug } from '../controllers/projectController.js';

const router = express.Router();

// GET /api/projects
router.get('/', getProjects);

// GET /api/projects/:slug
router.get('/:slug', getProjectBySlug);

export default router;
