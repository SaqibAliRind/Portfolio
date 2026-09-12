import mongoose from 'mongoose';

/**
 * Health Controller
 * Reports API status and real Mongoose connection state.
 * Never exposes credentials, URI, or stack traces.
 */

// Map Mongoose readyState integer to a human-readable string
const getDbStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] ?? 'unknown';
};

export const getHealthStatus = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    data: {
      environment: process.env.NODE_ENV || 'development',
      database: getDbStatus(),
    },
  });
};
