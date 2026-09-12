import jwt from 'jsonwebtoken';

/**
 * JWT Utility
 *
 * Reusable token signing/verification helpers.
 *
 * Security notes:
 *  - The secret comes exclusively from `process.env.JWT_SECRET`.
 *    There is no hard-coded fallback: a missing secret is a hard failure.
 *  - The payload holds the minimum required claims only: `{ id, role }`.
 *    No password, no hash, no email, no connection strings.
 *  - Signature and expiry are always verified (HS256 pinned to prevent
 *    algorithm-confusion / `alg: none` attacks).
 */

const DEFAULT_EXPIRES_IN = '1d';
const ALGORITHM = 'HS256';

// Values that must never be accepted as a real secret.
const FORBIDDEN_SECRETS = new Set([
  'secret',
  'mysecret',
  'jwtsecret',
  'password',
  'admin',
  'admin123',
  '123456',
  'changeme',
  'replace_with_a_long_random_secret',
]);

const MIN_SECRET_LENGTH = 32;

/**
 * Read and validate the JWT secret from the environment.
 * @returns {string}
 */
const getSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret || typeof secret !== 'string' || secret.trim().length === 0) {
    throw new Error('JWT_SECRET is not defined in environment variables.');
  }

  const trimmed = secret.trim();

  if (FORBIDDEN_SECRETS.has(trimmed.toLowerCase())) {
    throw new Error('JWT_SECRET is a known placeholder/weak value. Set a strong random secret.');
  }

  if (trimmed.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `JWT_SECRET must be at least ${MIN_SECRET_LENGTH} characters long.`
    );
  }

  return trimmed;
};

/**
 * Read the token lifetime from the environment.
 * @returns {string|number}
 */
const getExpiresIn = () => {
  const value = process.env.JWT_EXPIRES_IN;
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return DEFAULT_EXPIRES_IN;
  }
  return value.trim();
};

/**
 * Sign a JWT for an authenticated admin.
 *
 * @param {{ id: string, role: string }} payload minimal claims
 * @returns {string} signed JWT
 */
export const generateToken = ({ id, role }) => {
  if (!id) {
    throw new Error('Cannot generate a token without a subject id.');
  }

  // Whitelist claims explicitly — never spread an arbitrary object in here.
  const claims = {
    id: String(id),
    role: role || 'admin',
  };

  return jwt.sign(claims, getSecret(), {
    algorithm: ALGORITHM,
    expiresIn: getExpiresIn(),
  });
};

/**
 * Verify a JWT signature and expiry.
 *
 * @param {string} token
 * @returns {{ id: string, role: string, iat: number, exp: number }} decoded payload
 * @throws {jwt.JsonWebTokenError|jwt.TokenExpiredError} on invalid/expired tokens
 */
export const verifyToken = (token) => {
  if (!token || typeof token !== 'string') {
    // Same error class the middleware already handles as a 401.
    throw new jwt.JsonWebTokenError('jwt must be provided');
  }

  return jwt.verify(token, getSecret(), { algorithms: [ALGORITHM] });
};

/**
 * Extract a Bearer token from an Authorization header value.
 * Returns null when the header is missing or not a well-formed Bearer header.
 *
 * @param {string|undefined} authorizationHeader
 * @returns {string|null}
 */
export const extractBearerToken = (authorizationHeader) => {
  if (!authorizationHeader || typeof authorizationHeader !== 'string') {
    return null;
  }

  const [scheme, ...rest] = authorizationHeader.trim().split(/\s+/);

  if (!scheme || scheme.toLowerCase() !== 'bearer') {
    return null;
  }

  const token = rest.join(' ').trim();
  return token.length > 0 ? token : null;
};

export default {
  generateToken,
  verifyToken,
  extractBearerToken,
};

/**
 * Startup sanity check for the JWT configuration.
 * Returns { ok: true } or { ok: false, message } — never throws, and never
 * includes the secret itself in the message.
 */
export const checkJwtConfig = () => {
  try {
    getSecret();
    return { ok: true, expiresIn: getExpiresIn() };
  } catch (error) {
    return { ok: false, message: error.message };
  }
};
