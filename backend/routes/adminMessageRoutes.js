import express from 'express';
import { protect, requireAdmin } from '../middleware/authMiddleware.js';
import {
  getAdminMessages,
  getAdminMessageById,
  updateMessageStatus,
  deleteMessage,
  getUnreadMessageCount,
} from '../controllers/adminMessageController.js';

const router = express.Router();

router.use(protect);
router.use(requireAdmin);

// Order matters: /unread-count must come before /:id
router.get('/unread-count', getUnreadMessageCount);

router.route('/')
  .get(getAdminMessages);

router.route('/:id')
  .get(getAdminMessageById)
  .delete(deleteMessage);

router.patch('/:id/status', updateMessageStatus);

export default router;
