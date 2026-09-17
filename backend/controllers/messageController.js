import Message from '../models/Message.js';
import Settings from '../models/Settings.js';
import { sendContactNotificationEmail } from '../services/emailService.js';

/**
 * @desc    Submit a new contact message
 * @route   POST /api/messages
 * @access  Public
 */
export const createMessage = async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    if (settings && settings.contactFormEnabled === false) {
      res.status(503);
      throw new Error('Contact form is currently unavailable.');
    }

    const { name, email, subject, message, projectType } = req.body;

    // 1. Basic validation for missing required fields
    if (!name || !email || !subject || !message) {
      res.status(400);
      throw new Error('Please provide all required contact fields (name, email, subject, message).');
    }

    // 2. Prevent empty strings/whitespace
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      res.status(400);
      throw new Error('Please provide valid text for all required contact fields.');
    }

    // 3. Construct explicitly allowed fields (Mass Assignment Protection)
    // We do NOT use req.body directly, and we do NOT allow the client to set 'status', 'role', etc.
    const newMessageData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      ...(projectType && projectType.trim() ? { projectType: projectType.trim() } : {}),
      status: 'new', // Hardcoded default for safety
    };

    // 4. Save to MongoDB
    const createdMessage = await Message.create(newMessageData);

    // 4.5 Send email notification to Admin
    try {
      if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        await sendContactNotificationEmail(createdMessage);
      }
    } catch (emailError) {
      console.error('Failed to send contact notification email:', emailError);
      // We don't fail the request if email fails, message is already saved in DB
    }

    // 5. Return success response (avoiding exposing full document unnecessarily)
    res.status(201).json({
      success: true,
      message: 'Message submitted successfully',
      data: {
        id: createdMessage._id,
      },
    });
  } catch (error) {
    // Handle Mongoose validation errors nicely
    if (error.name === 'ValidationError') {
      res.status(400);
      const messages = Object.values(error.errors).map((val) => val.message);
      return next(new Error(messages.join('. ')));
    }
    
    // Pass unexpected errors to centralized error handler
    next(error);
  }
};
