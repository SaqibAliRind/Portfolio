import dns from 'dns';
import mongoose from 'mongoose';
// Force Node to use reliable public DNS to resolve mongodb+srv:// SRV records.
// Fixes querySrv ECONNREFUSED on ISPs with non-compliant DNS.
dns.setServers(['8.8.8.8', '1.1.1.1']);

/**
 * Establish connection to MongoDB Atlas.
 * Validates existence of MONGODB_URI and cleanly logs the result.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables.');
  }

  try {
    const conn = await mongoose.connect(uri);
    // Log a safe success message without exposing credentials or full URI
    console.log(`MongoDB connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    // We throw the error so server.js can handle it appropriately
    throw error;
  }
};
