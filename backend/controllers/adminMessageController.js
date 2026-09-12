import mongoose from 'mongoose';
import Message from '../models/Message.js';

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ── GET ALL (WITH PAGINATION, SEARCH, AND FILTER) ─────────────────────────
export const getAdminMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '', status = '', projectType = '' } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Filter by status
    if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
      query.status = status;
    }

    // Filter by projectType
    if (projectType) {
      query.projectType = projectType;
    }

    // Search text across multiple fields
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'); // Escape regex
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { subject: searchRegex },
        { message: searchRegex },
        { projectType: searchRegex },
      ];
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Message.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Messages retrieved successfully',
      data: {
        messages,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE MESSAGE ──────────────────────────────────────────────────────
export const getAdminMessageById = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid message ID.');
    }
    const message = await Message.findById(req.params.id);
    if (!message) {
      res.status(404); throw new Error('Message not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Message retrieved successfully',
      data: { message },
    });
  } catch (error) {
    next(error);
  }
};

// ── UPDATE MESSAGE STATUS ───────────────────────────────────────────────────
export const updateMessageStatus = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid message ID.');
    }
    const { status } = req.body;
    const validStatuses = ['new', 'read', 'replied', 'archived'];
    
    if (!validStatuses.includes(status)) {
      res.status(400); throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const message = await Message.findById(req.params.id);
    if (!message) { res.status(404); throw new Error('Message not found.'); }

    message.status = status;
    const updatedMessage = await message.save();

    res.status(200).json({
      success: true,
      message: `Message status updated to ${status}`,
      data: { message: updatedMessage },
    });
  } catch (error) {
    next(error);
  }
};

// ── DELETE MESSAGE ──────────────────────────────────────────────────────────
export const deleteMessage = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      res.status(400); throw new Error('Invalid message ID.');
    }
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      res.status(404); throw new Error('Message not found.');
    }
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// ── GET UNREAD COUNT ────────────────────────────────────────────────────────
export const getUnreadMessageCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ status: 'new' });
    res.status(200).json({
      success: true,
      message: 'Unread message count retrieved',
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};
