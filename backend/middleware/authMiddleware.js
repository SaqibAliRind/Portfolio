import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import { verifyToken, extractBearerToken } from '../utils/jwt.js';

/**
 * Authentication & Authorization Middleware
 *
 * Expected request header:
 *   Authorization: Bearer <JWT_TOKEN>
 *
 * Flow:
 *   read header → verify Bearer format → extract token → verify JWT
 *   → load Admin by decoded id → confirm exists → confirm isActive
 *   → attach safe admin to req.admin → next()
 *
 * Security notes:
 *  - Identity is resolved server-side from the DB on every request.
 *    A stale token for a deleted or deactivated admin is rejected.
 *  - `req.admin` never contains the password hash.
 *  - The role attached to req.admin comes from the database record,
 *    not from the client and not from the token claim.
 */

// Uniform 401 message for all token problems — avoids leaking which
// specific check failed.
const AUTH_FAILED_MESSAGE = 'Not authorized. A valid authentication token is required.';
const INACTIVE_MESSAGE = 'This account is inactive.';

/**
 * Require a valid JWT belonging to an existing, active admin.
 */
export const protect = async (req, res, next) => {
  try {
    // 1-3. Read header, verify Bearer format, extract token
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401);
      throw new Error(AUTH_FAILED_MESSAGE);
    }

    // 4-6. Verify signature + expiry; handle invalid/expired tokens
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      res.status(401);

      if (error.name === 'TokenExpiredError') {
        throw new Error('Session expired. Please log in again.');
      }

      // JsonWebTokenError (bad signature / malformed / tampered),
      // NotBeforeError, and any config error all collapse to a generic 401.
      throw new Error(AUTH_FAILED_MESSAGE);
    }

    // Guard against a well-signed token carrying a non-ObjectId id.
    if (!decoded?.id || !mongoose.Types.ObjectId.isValid(decoded.id)) {
      res.status(401);
      throw new Error(AUTH_FAILED_MESSAGE);
    }

    // 7-8. Load the admin from the database and confirm it still exists.
    // Password is `select: false`, so it is not loaded here.
    const admin = await Admin.findById(decoded.id).select('-password');

    if (!admin) {
      res.status(401);
      throw new Error(AUTH_FAILED_MESSAGE);
    }

    // 9. Confirm the account is still enabled
    if (admin.isActive !== true) {
      res.status(403);
      throw new Error(INACTIVE_MESSAGE);
    }

    // 10. Attach only safe, server-derived information
    req.admin = {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      role: admin.role,
    };

    // 11. Continue
    next();
  } catch (error) {
    // Never let an unexpected error fall through as a 200.
    if (res.statusCode === 200) res.status(401);
    next(error);
  }
};

/**
 * Role authorization factory.
 * Roles are compared against `req.admin.role`, which is always populated
 * from the database by `protect` — never from req.body or query params.
 *
 * @param {...string} allowedRoles
 */
export const authorizeRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.admin || !req.admin.role) {
    res.status(401);
    return next(new Error(AUTH_FAILED_MESSAGE));
  }

  if (!allowedRoles.includes(req.admin.role)) {
    res.status(403);
    return next(new Error('You do not have permission to perform this action.'));
  }

  return next();
};

/**
 * Convenience guard for admin-only routes.
 * Use after `protect`:  router.get('/x', protect, requireAdmin, handler)
 */
export const requireAdmin = authorizeRoles('admin');

export default { protect, requireAdmin, authorizeRoles };
