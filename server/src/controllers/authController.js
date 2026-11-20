import User from '../models/User.js';
import Otp from '../models/Otp.js';
import jwt from 'jsonwebtoken';
import {
  sendRegistrationOtp,
  sendForgotPasswordOtp,
  sendEmailVerifiedNotification,
  sendPasswordChangedNotification,
} from '../utils/emailService.js';

/**
 * Generates regular JWT auth token
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/**
 * Generates short-lived, single-use password reset token (10 minutes)
 */
const generateResetToken = (userId, email) =>
  jwt.sign({ id: userId, email, scope: 'password_reset' }, process.env.JWT_SECRET, {
    expiresIn: '10m',
  });

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

// ─── POST /api/auth/register ───────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address.' });
    }

    if (cleanPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && confirmPassword.trim() !== cleanPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Check if user already exists
    let user = await User.findOne({ email: cleanEmail });

    if (user) {
      // If user exists and is already verified, return conflict
      if (user.isEmailVerified !== false) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists. Please sign in.',
        });
      }

      // If user exists but is NOT verified, update name & password
      user.name = cleanName;
      user.password = cleanPassword; // Pre-save hook will hash it
      await user.save();
    } else {
      // Create new unverified user
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        isEmailVerified: false,
      });
    }

    // Generate cryptographically secure 6-digit OTP
    const rawOtp = Otp.generateRawOtp();
    const otpHash = Otp.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Invalidate any existing registration OTPs for this email
    await Otp.deleteMany({ email: cleanEmail, purpose: 'registration' });

    // Store new OTP
    await Otp.create({
      email: cleanEmail,
      otpHash,
      purpose: 'registration',
      expiresAt,
      lastResendAt: new Date(),
    });

    // Send registration email with OTP
    await sendRegistrationOtp(cleanEmail, cleanName, rawOtp, 5);

    res.status(201).json({
      success: true,
      requiresVerification: true,
      email: cleanEmail,
      message: 'Account created! A 6-digit verification code has been sent to your email.',
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// ─── POST /api/auth/verify-email-otp ───────────────────────────────────────────
export const verifyEmailOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ success: false, message: 'Verification code must be 6 digits.' });
    }

    // Find the latest active OTP for registration
    const otpRecord = await Otp.findOne({ email: cleanEmail, purpose: 'registration' }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active verification code found. Please request a new one.',
      });
    }

    // Check expiration
    if (otpRecord.isExpired()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Check brute-force attempt limits
    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    // Verify OTP using timing-safe comparison
    const isValid = otpRecord.verifyOtp(cleanOtp);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      });
    }

    // OTP is valid! Invalidate all registration OTPs for this email
    await Otp.deleteMany({ email: cleanEmail, purpose: 'registration' });

    // Mark user as verified
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    user.isEmailVerified = true;
    user.emailVerifiedAt = new Date();
    await user.save();

    // Send confirmation email
    sendEmailVerifiedNotification(user.email, user.name).catch((e) =>
      console.warn('Welcome email error:', e.message)
    );

    res.json({
      success: true,
      message: 'Email verified successfully! Welcome to ResumeMatch AI.',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: true,
      },
    });
  } catch (err) {
    console.error('Verify email OTP error:', err);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// ─── POST /api/auth/resend-email-otp ───────────────────────────────────────────
export const resendOtp = async (req, res) => {
  try {
    const { email, purpose = 'registration' } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!['registration', 'password_reset'].includes(purpose)) {
      return res.status(400).json({ success: false, message: 'Invalid OTP purpose.' });
    }

    const user = await User.findOne({ email: cleanEmail });

    if (purpose === 'registration') {
      if (!user) {
        return res.status(404).json({ success: false, message: 'No registration pending for this email.' });
      }
      if (user.isEmailVerified !== false) {
        return res.status(400).json({ success: false, message: 'This account is already verified. Please sign in.' });
      }
    } else if (purpose === 'password_reset') {
      // Account enumeration protection: if user doesn't exist, respond with generic success
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account exists with this email, a new code has been sent.',
        });
      }
    }

    // Check resend cooldown (60 seconds)
    const existingOtp = await Otp.findOne({ email: cleanEmail, purpose }).sort({ createdAt: -1 });

    if (existingOtp) {
      const elapsed = Date.now() - new Date(existingOtp.lastResendAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsed < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} second${remainingSec === 1 ? '' : 's'} before requesting another code.`,
          remainingSeconds: remainingSec,
        });
      }
    }

    // Invalidate previous OTPs
    await Otp.deleteMany({ email: cleanEmail, purpose });

    // Generate new OTP
    const rawOtp = Otp.generateRawOtp();
    const otpHash = Otp.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({
      email: cleanEmail,
      otpHash,
      purpose,
      expiresAt,
      lastResendAt: new Date(),
    });

    // Send email
    if (purpose === 'registration') {
      await sendRegistrationOtp(cleanEmail, user?.name, rawOtp, 5);
    } else {
      await sendForgotPasswordOtp(cleanEmail, user?.name, rawOtp, 5);
    }

    res.json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email.',
    });
  } catch (err) {
    console.error('Resend OTP error:', err);
    res.status(500).json({ success: false, message: 'Could not resend code. Please try again.' });
  }
};

// ─── POST /api/auth/login ──────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');

    // Generic error response to prevent user enumeration
    if (!user || !(await user.matchPassword(cleanPassword))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Check verification status
    // Legacy accounts created prior to this upgrade where isEmailVerified === undefined are grandfathered
    if (user.isEmailVerified === false) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: user.email,
        message: 'Your email address has not been verified yet. Please verify your email to log in.',
      });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified !== false,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Authentication failed. Please try again.' });
  }
};

// ─── POST /api/auth/forgot-password ───────────────────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // Account enumeration protection: if user not found, return generic success
    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
        email: cleanEmail,
      });
    }

    // Check resend cooldown (60 seconds)
    const existingOtp = await Otp.findOne({ email: cleanEmail, purpose: 'password_reset' }).sort({ createdAt: -1 });

    if (existingOtp) {
      const elapsed = Date.now() - new Date(existingOtp.lastResendAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsed < cooldownMs) {
        const remainingSec = Math.ceil((cooldownMs - elapsed) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${remainingSec} second${remainingSec === 1 ? '' : 's'} before requesting another reset code.`,
          remainingSeconds: remainingSec,
        });
      }
    }

    // Invalidate existing reset OTPs
    await Otp.deleteMany({ email: cleanEmail, purpose: 'password_reset' });

    // Generate new OTP
    const rawOtp = Otp.generateRawOtp();
    const otpHash = Otp.hashOtp(rawOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await Otp.create({
      email: cleanEmail,
      otpHash,
      purpose: 'password_reset',
      expiresAt,
      lastResendAt: new Date(),
    });

    // Send email
    await sendForgotPasswordOtp(cleanEmail, user.name, rawOtp, 5);

    res.json({
      success: true,
      message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
      email: cleanEmail,
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ success: false, message: 'Could not process password reset request. Please try again.' });
  }
};

// ─── POST /api/auth/verify-reset-otp ──────────────────────────────────────────
export const verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and reset code are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ success: false, message: 'Reset code must be 6 digits.' });
    }

    const otpRecord = await Otp.findOne({ email: cleanEmail, purpose: 'password_reset' }).sort({ createdAt: -1 });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'No active password reset code found. Please request a new one.',
      });
    }

    if (otpRecord.isExpired()) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({
        success: false,
        message: 'Reset code has expired. Please request a new one.',
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteOne({ _id: otpRecord._id });
      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new reset code.',
      });
    }

    const isValid = otpRecord.verifyOtp(cleanOtp);

    if (!isValid) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      const remainingAttempts = 5 - otpRecord.attempts;
      return res.status(400).json({
        success: false,
        message: `Invalid reset code. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`,
      });
    }

    // Invalidate OTP immediately upon verification
    await Otp.deleteMany({ email: cleanEmail, purpose: 'password_reset' });

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Generate signed, single-use, 10-minute reset token
    const resetToken = generateResetToken(user._id, user.email);

    res.json({
      success: true,
      message: 'Code verified successfully. You may now enter your new password.',
      resetToken,
    });
  } catch (err) {
    console.error('Verify reset OTP error:', err);
    res.status(500).json({ success: false, message: 'Code verification failed. Please try again.' });
  }
};

// ─── POST /api/auth/reset-password ────────────────────────────────────────────
export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({ success: false, message: 'Reset token and new password are required.' });
    }

    const cleanPassword = newPassword.trim();

    if (cleanPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    if (confirmPassword && confirmPassword.trim() !== cleanPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({
        success: false,
        message: 'Your password reset session has expired or is invalid. Please request a new code.',
      });
    }

    if (decoded.scope !== 'password_reset') {
      return res.status(401).json({ success: false, message: 'Invalid token scope for password reset.' });
    }

    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found.' });
    }

    // Update password (triggers User pre-save bcrypt hash)
    user.password = cleanPassword;
    user.passwordChangedAt = new Date();
    await user.save();

    // Send confirmation alert
    sendPasswordChangedNotification(user.email, user.name).catch((e) =>
      console.warn('Password changed alert error:', e.message)
    );

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.',
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ success: false, message: 'Failed to reset password. Please try again.' });
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully.' });
};

// ─── GET /api/auth/me (protected) ─────────────────────────────────────────────
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};
