import express from 'express';
import { getServices } from '../controllers/serviceController.js';

const router = express.Router();

// GET /api/services
router.get('/', getServices);

export default router;
