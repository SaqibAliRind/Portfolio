import dotenv from 'dotenv';
// Load environment variables before anything else
dotenv.config();

import dns from 'dns';
// Force Node to use Google/Cloudflare DNS to fix querySrv ECONNREFUSED on some ISPs
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import app from './app.js';
import { connectDB } from './config/db.js';
import { checkJwtConfig } from './utils/jwt.js';

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

let server;

const startServer = async () => {
  try {
    // 1. Validate auth configuration before accepting traffic.
    //    Never logs the secret itself — only whether it is usable.
    const jwtConfig = checkJwtConfig();
    if (!jwtConfig.ok) {
      throw new Error(`Invalid JWT configuration: ${jwtConfig.message}`);
    }

    // 2. Connect to MongoDB before accepting traffic
    await connectDB();

    // 3. Start HTTP server only after successful DB connection
    server = app.listen(PORT, () => {
      console.log(`=================================`);
      console.log(`Backend is running on port: ${PORT}`);
      console.log(`Environment: ${NODE_ENV}`);
      console.log(`Auth: JWT enabled (expires in ${jwtConfig.expiresIn})`);
      console.log(`=================================`);
    });

  } catch (error) {
    // Safe error message — never log the URI, credentials, or JWT secret
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  }
};

// Graceful shutdown handler
const shutdown = async (signal) => {
  console.log(`\n${signal} received. Initiating graceful shutdown...`);

  try {
    // 1. Stop accepting new HTTP connections
    if (server) {
      server.close(() => {
        console.log('HTTP server closed.');
      });
    }

    // 2. Close Mongoose connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
    console.log('Graceful shutdown complete. Goodbye.');

    process.exit(0);
  } catch (err) {
    console.error('Error during shutdown:', err.message);
    process.exit(1);
  }
};

// Listen for termination signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Handle unhandled promise rejections globally
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  if (server) server.close(() => process.exit(1));
  else process.exit(1);
});

// Handle uncaught exceptions globally
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});

// Bootstrap the server
startServer();
