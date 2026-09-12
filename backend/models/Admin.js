import mongoose from 'mongoose';

/**
 * Admin Model
 *
 * Represents an administrative account allowed to manage portfolio content.
 *
 * Security notes:
 *  - `password` stores ONLY a bcrypt hash. Plaintext is never persisted.
 *  - `password` uses `select: false`, so it is excluded from every query
 *    result unless explicitly requested with `.select('+password')`.
 *    This makes accidental exposure through an API response very unlikely.
 *  - There is no public registration flow. Accounts are created through
 *    `scripts/createAdmin.js` (CLI, environment-driven).
 */
const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Admin name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Admin email is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      maxlength: [254, 'Email cannot exceed 254 characters'],
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },

    // bcrypt hash only — never plaintext
    password: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false,
    },

    role: {
      type: String,
      enum: {
        values: ['admin'],
        message: 'Role must be "admin"',
      },
      default: 'admin',
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Returns a safe, client-facing representation of the admin.
 * Guarantees the password hash is never included.
 */
adminSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id.toString(),
    name: this.name,
    email: this.email,
    role: this.role,
  };
};

/**
 * Defence-in-depth: strip the password hash from any serialization
 * (res.json / JSON.stringify) even if the document was loaded with
 * `.select('+password')`.
 */
const stripSensitive = (doc, ret) => {
  delete ret.password;
  delete ret.__v;
  return ret;
};

adminSchema.set('toJSON', { transform: stripSensitive });
adminSchema.set('toObject', { transform: stripSensitive });

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
