import app from '../app.js';
import { connectDB } from '../config/db.js';
import { checkJwtConfig } from '../utils/jwt.js';

let isConnected = false;

// Export a serverless handler function
export default async function handler(req, res) {
  // Validate JWT config (just like server.js)
  const jwtConfig = checkJwtConfig();
  if (!jwtConfig.ok) {
    console.error(`Invalid JWT configuration: ${jwtConfig.message}`);
    return res.status(500).json({ error: 'Internal Server Error - Auth Config' });
  }

  // Connect to DB if not already connected (Serverless environments reuse instances sometimes)
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
    } catch (error) {
      console.error('Database connection failed in serverless handler:', error);
      return res.status(500).json({ error: 'Database connection failed' });
    }
  }

  // Delegate the request to the Express app
  return app(req, res);
}
