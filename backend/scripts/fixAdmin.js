import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { connectDB } = await import('../config/db.js');
const { default: Admin } = await import('../models/Admin.js');

const fixAdmin = async () => {
  try {
    await connectDB();
    
    const email = 'saqibrind46@gmail.com';
    const rawPassword = '325531167';
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);
    
    // Find the admin
    const admin = await Admin.findOne({ email });
    
    if (admin) {
      admin.name = 'Saqib Ali Rind';
      admin.password = hashedPassword;
      await admin.save();
      console.log('✅ Admin updated successfully with hashed password and new name!');
    } else {
      // Create if doesn't exist just in case
      await Admin.create({
        name: 'Saqib Ali Rind',
        email: email,
        password: hashedPassword,
        role: 'admin',
        isActive: true
      });
      console.log('✅ Admin created successfully with hashed password!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

fixAdmin();
