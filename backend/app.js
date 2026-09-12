import express from 'express';
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Route imports
import healthRoutes from './routes/healthRoutes.js';
import profileRoutes from './routes/profileRoutes.js';
import skillRoutes from './routes/skillRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import educationRoutes from './routes/educationRoutes.js';
import certificationRoutes from './routes/certificationRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminProfileRoutes from './routes/adminProfileRoutes.js';
import adminSkillRoutes from './routes/adminSkillRoutes.js';
import adminProjectRoutes from './routes/adminProjectRoutes.js';
import adminExperienceRoutes from './routes/adminExperienceRoutes.js';
import adminEducationRoutes from './routes/adminEducationRoutes.js';
import adminCertificationRoutes from './routes/adminCertificationRoutes.js';
import adminServiceRoutes from './routes/adminServiceRoutes.js';
import adminMessageRoutes from './routes/adminMessageRoutes.js';
import adminSettingsRoutes from './routes/adminSettingsRoutes.js';
import adminDashboardRoutes from './routes/adminDashboardRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Initialize Express App
const app = express();

// ── Middleware: CORS ──────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean); // Remove undefined/null values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin} is not allowed.`));
    }
  },
  credentials: true,
}));

// ── Middleware: Body Parsing ──────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── API Routes: Admin Authentication ──────────────────────────
// POST /api/auth/login  (public)
// GET  /api/auth/me     (protected — Authorization: Bearer <JWT>)
app.use('/api/auth', authRoutes);

// ── API Routes: Admin Content ─────────────────────────────────
app.use('/api/admin/profile', adminProfileRoutes);
app.use('/api/admin/skills', adminSkillRoutes);
app.use('/api/admin/projects', adminProjectRoutes);
app.use('/api/admin/experience', adminExperienceRoutes);
app.use('/api/admin/education', adminEducationRoutes);
app.use('/api/admin/certifications', adminCertificationRoutes);
app.use('/api/admin/services', adminServiceRoutes);
app.use('/api/admin/messages', adminMessageRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/admin/dashboard', adminDashboardRoutes);
app.use('/api/admin/upload', uploadRoutes);

// ── API Routes: Public Portfolio (unchanged, remain public) ───
app.use('/api/health', healthRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/certifications', certificationRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/messages', messageRoutes);

// ── Unmatched API Routes → JSON 404 ──────────────────────────
app.use('/api/*', notFound);

// ── Centralized Error Handler (must be last) ─────────────────
app.use(errorHandler);

export default app;
