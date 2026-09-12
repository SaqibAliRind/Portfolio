/**
 * Error Handling Middleware
 * Centralized error handling for all Express routes.
 */

// Handle undefined 404 API routes
export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
  // If the status is still 200, set it to 500 (Internal Server Error)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isDev = process.env.NODE_ENV !== 'production';

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    // In development: include a debug flag; NEVER include full stack with file paths
    ...(isDev && { debug: true }),
  });
};
