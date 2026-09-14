import app from '../backend/app.js';
import { connectDB } from '../backend/config/db.js';
import { checkJwtConfig } from '../backend/utils/jwt.js';

// Cache connection across serverless invocations
let isConnected = false;

export default async function handler(req, res) {
  // Validate JWT config
  const jwtConfig = checkJwtConfig();
  if (!jwtConfig.ok) {
    console.error(`Invalid JWT configuration: ${jwtConfig.message}`);
    return res.status(500).json({ error: 'Internal Server Error - Auth Config' });
  }

  // Connect to MongoDB (cached)
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed:', error.message);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  // Hand off to Express app
  return app(req, res);
}
