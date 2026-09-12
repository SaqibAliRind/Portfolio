import express from 'express';
import { createMessage } from '../controllers/messageController.js';

const router = express.Router();

/**
 * @route   POST /api/messages
 * @desc    Submit a contact form message
 * @access  Public
 */
router.post('/', createMessage);

// Note: GET, PUT, DELETE for messages are intentionally omitted 
// to prevent public exposure of private contact submissions.
// They will be implemented in future Admin API milestones.

export default router;
