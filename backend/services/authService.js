import bcrypt from 'bcryptjs';

/**
 * Authentication Service
 *
 * Single, reusable place for password cryptography.
 * Controllers/scripts must never call bcrypt directly, so the cost factor
 * and validation rules stay consistent across the whole application.
 *
 * Security notes:
 *  - bcryptjs only (no MD5 / SHA1 / SHA256 / custom hashing).
 *  - Passwords and hashes are NEVER logged or included in error messages.
 */

// bcrypt cost factor. 12 is a good 2024+ balance of safety vs. latency.
const SALT_ROUNDS = 12;

// bcrypt silently truncates input beyond 72 bytes — reject instead of
// giving a false sense of strength.
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 72;

/**
 * Hash a plaintext password using bcryptjs.
 *
 * @param {string} plainPassword
 * @returns {Promise<string>} bcrypt hash
 */
export const hashPassword = async (plainPassword) => {
  if (typeof plainPassword !== 'string' || plainPassword.length === 0) {
    // Deliberately generic — never echo the value back.
    throw new Error('A password is required for hashing.');
  }

  if (plainPassword.length < PASSWORD_MIN_LENGTH) {
    throw new Error(
      `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`
    );
  }

  if (plainPassword.length > PASSWORD_MAX_LENGTH) {
    throw new Error(
      `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters.`
    );
  }

  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  return bcrypt.hash(plainPassword, salt);
};

/**
 * Compare a plaintext password against a stored bcrypt hash.
 * Always resolves to a boolean — never throws for a simple mismatch.
 *
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  if (typeof plainPassword !== 'string' || typeof hashedPassword !== 'string') {
    return false;
  }

  if (plainPassword.length === 0 || hashedPassword.length === 0) {
    return false;
  }

  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch {
    // A malformed/corrupt hash must fail closed, and must not leak details.
    return false;
  }
};

/**
 * Verify a string looks like a bcrypt hash (used by scripts/tests to assert
 * that no plaintext password reached the database).
 *
 * @param {string} value
 * @returns {boolean}
 */
export const isBcryptHash = (value) =>
  typeof value === 'string' && /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(value);

export default {
  hashPassword,
  comparePassword,
  isBcryptHash,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
};
