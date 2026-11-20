import express from 'express';
import {
  register,
  verifyEmailOtp,
  resendOtp,
  login,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  logout,
  getMe,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import {
  authLimiter,
  loginLimiter,
  otpRequestLimiter,
  otpVerifyLimiter,
} from '../middleware/rateLimiter.js';

const router = express.Router();

// Apply general auth rate limiter to all routes
router.use(authLimiter);

// Registration & Verification
router.post('/register', otpRequestLimiter, register);
router.post('/verify-email-otp', otpVerifyLimiter, verifyEmailOtp);
router.post('/resend-email-otp', otpRequestLimiter, resendOtp);

// Login & Logout
router.post('/login', loginLimiter, login);
router.post('/logout', logout);

// Password Reset Flow
router.post('/forgot-password', otpRequestLimiter, forgotPassword);
router.post('/verify-reset-otp', otpVerifyLimiter, verifyResetOtp);
router.post('/reset-password', resetPassword);

// Profile
router.get('/me', protect, getMe);

export default router;
