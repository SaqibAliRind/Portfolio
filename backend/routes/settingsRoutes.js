import express from 'express';
import { getPublicSettings } from '../controllers/adminSettingsController.js';

const router = express.Router();

router.route('/').get(getPublicSettings);

export default router;
