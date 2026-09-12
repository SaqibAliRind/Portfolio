import express from 'express';
import { getCertifications } from '../controllers/certificationController.js';

const router = express.Router();

// GET /api/certifications
router.get('/', getCertifications);

export default router;
