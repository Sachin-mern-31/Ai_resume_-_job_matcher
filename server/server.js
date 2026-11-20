import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env'), override: true });
dotenv.config({ override: true });

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// ─── Security & Base Middleware ───────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://resumematchwithsachin.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    message: '🚀 ResumeMatch API is running',
    status: 'ok',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    ...(mongoose.connection.readyState !== 1 && {
      hint: 'MongoDB is disconnected. Check your database password in server/.env',
    }),
  });
});

// ─── Database Readiness Guard for /api ─────────────────────────────────────────
app.use('/api', (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: 'Database is not connected. Please verify your MongoDB credentials in server/.env.',
    });
  }
  next();
});

// ─── Routes ───────────────────────────────────────────────────────────────────
import authRoutes   from './src/routes/authRoutes.js';
import resumeRoutes from './src/routes/resumeRoutes.js';
import adminRoutes  from './src/routes/adminRoutes.js';

app.use('/api/auth',   authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/admin',  adminRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// ─── Database + Server Start ───────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  if (process.env.EMAIL_USER) {
    console.log(`📧 Email service active: ${process.env.EMAIL_USER}`);
  } else {
    console.log('📧 Email service: Console Fallback Mode (Set EMAIL_USER in .env)');
  }
});

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in server/.env');
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, { authSource: 'admin' });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    if (err.message.includes('bad auth')) {
      const userMatch = (process.env.MONGO_URI || '').match(/mongodb(?:\+srv)?:\/\/([^:]+):/);
      const dbUser = userMatch ? userMatch[1] : 'database user';
      console.error(`👉 The password for "${dbUser}" in MONGO_URI is incorrect.`);
      console.error('👉 Please check the password in server/.env');
    }
  }
};

connectDB();
