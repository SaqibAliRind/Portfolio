import Admin from '../models/Admin.js';
import OTP from '../models/OTP.js';
import { comparePassword, PASSWORD_MAX_LENGTH } from '../services/authService.js';
import { sendOTPEmail } from '../services/emailService.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Authentication Controller — Two-Factor Auth (Email OTP)
 *
 * Flow:
 *   Step 1: POST /api/auth/login         → verify credentials → send OTP to Gmail
 *   Step 2: POST /api/auth/verify-otp    → verify OTP        → issue JWT token
 *
 * Admin accounts are provisioned via `scripts/createAdmin.js` only.
 */

const INVALID_CREDENTIALS = 'Invalid email or password.';
const INACTIVE_ACCOUNT = 'This account is inactive.';
const EMAIL_MAX_LENGTH = 254;
const EMAIL_PATTERN = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;

/** Generate a secure 6-digit numeric OTP */
const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

/** Validate + normalize login input */
const validateLoginInput = (rawEmail, rawPassword) => {
  if (rawEmail === undefined || rawEmail === null || rawPassword === undefined || rawPassword === null) {
    return { ok: false, message: 'Email and password are required.' };
  }
  if (typeof rawEmail !== 'string' || typeof rawPassword !== 'string') {
    return { ok: false, message: 'Email and password must be provided as text values.' };
  }

  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword;

  if (email.length === 0 || password.length === 0) {
    return { ok: false, message: 'Email and password cannot be empty.' };
  }
  if (email.length > EMAIL_MAX_LENGTH) {
    return { ok: false, message: 'Email address is too long.' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { ok: false, message: 'Please provide a valid email address.' };
  }
  if (password.length > PASSWORD_MAX_LENGTH) {
    return { ok: false, message: `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.` };
  }

  return { ok: true, email, password };
};

/**
 * @desc   Step 1 — Verify credentials, then send OTP to email
 * @route  POST /api/auth/login
 * @access Public
 */
export const loginAdmin = async (req, res, next) => {
  try {
    const { email: rawEmail, password: rawPassword } = req.body ?? {};

    const input = validateLoginInput(rawEmail, rawPassword);
    if (!input.ok) {
      res.status(400);
      throw new Error(input.message);
    }

    const { email, password } = input;

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      res.status(401);
      throw new Error(INVALID_CREDENTIALS);
    }

    if (admin.isActive !== true) {
      res.status(403);
      throw new Error(INACTIVE_ACCOUNT);
    }

    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      res.status(401);
      throw new Error(INVALID_CREDENTIALS);
    }

    // Credentials are valid — generate OTP
    const otpCode = generateOTP();

    // Delete any existing unused OTPs for this email (clean slate)
    await OTP.deleteMany({ email });

    // Save new OTP (expires in 5 min via TTL index)
    await OTP.create({ email, code: otpCode });

    // Send OTP to Gmail
    await sendOTPEmail(email, otpCode);

    // Respond — do NOT include the OTP or JWT here
    res.status(200).json({
      success: true,
      message: 'OTP sent to your email address. Please check your inbox.',
      data: {
        otpSent: true,
        email: email, // Return email so frontend can use it in Step 2
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      res.status(401);
      return next(new Error(INVALID_CREDENTIALS));
    }
    next(error);
  }
};

/**
 * @desc   Step 2 — Verify OTP, issue JWT token
 * @route  POST /api/auth/verify-otp
 * @access Public
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email: rawEmail, otp } = req.body ?? {};

    if (!rawEmail || typeof rawEmail !== 'string') {
      res.status(400);
      throw new Error('Email is required.');
    }
    if (!otp || typeof otp !== 'string') {
      res.status(400);
      throw new Error('OTP is required.');
    }

    const email = rawEmail.trim().toLowerCase();
    const otpCode = otp.trim();

    // Find the latest unused OTP for this email
    const otpRecord = await OTP.findOne({ email, used: false }).sort({ createdAt: -1 });

    if (!otpRecord) {
      res.status(401);
      throw new Error('OTP has expired or is invalid. Please login again.');
    }

    if (otpRecord.code !== otpCode) {
      res.status(401);
      throw new Error('Incorrect OTP. Please try again.');
    }

    // Mark OTP as used immediately (prevent replay)
    await OTP.deleteMany({ email });

    // Load the admin record
    const admin = await Admin.findOne({ email });

    if (!admin || admin.isActive !== true) {
      res.status(403);
      throw new Error('Account is no longer active.');
    }

    // Issue JWT
    const token = generateToken({ id: admin._id.toString(), role: admin.role });

    // Update last login timestamp
    admin.lastLoginAt = new Date();
    await admin.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: admin.toSafeObject(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Resend OTP (if expired or not received)
 * @route  POST /api/auth/resend-otp
 * @access Public
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { email: rawEmail } = req.body ?? {};

    if (!rawEmail || typeof rawEmail !== 'string') {
      res.status(400);
      throw new Error('Email is required.');
    }

    const email = rawEmail.trim().toLowerCase();

    // Verify admin exists before resending
    const admin = await Admin.findOne({ email });
    if (!admin || admin.isActive !== true) {
      // Generic response — prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If your email is registered, a new OTP has been sent.',
      });
    }

    const otpCode = generateOTP();
    await OTP.deleteMany({ email });
    await OTP.create({ email, code: otpCode });
    await sendOTPEmail(email, otpCode);

    res.status(200).json({
      success: true,
      message: 'A new OTP has been sent to your email.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get the currently authenticated admin
 * @route  GET /api/auth/me
 * @access Private
 */
export const getCurrentAdmin = async (req, res, next) => {
  try {
    if (!req.admin) {
      res.status(401);
      throw new Error('Not authorized. A valid authentication token is required.');
    }

    res.status(200).json({
      success: true,
      message: 'Admin profile retrieved successfully',
      data: {
        admin: {
          id: req.admin.id,
          name: req.admin.name,
          email: req.admin.email,
          role: req.admin.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
