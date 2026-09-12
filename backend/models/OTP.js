import mongoose from 'mongoose';

/**
 * OTP Model — Temporary one-time passwords for 2FA admin login.
 * Documents auto-expire after 5 minutes via TTL index.
 */
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  code: {
    type: String,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    // TTL index: MongoDB auto-deletes documents after 300 seconds (5 minutes)
    expires: 300,
  },
});

// Index for fast lookup by email
otpSchema.index({ email: 1 });

const OTP = mongoose.model('OTP', otpSchema);

export default OTP;
