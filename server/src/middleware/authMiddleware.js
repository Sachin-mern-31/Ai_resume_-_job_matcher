import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * protect — verifies JWT, ensures account exists & is verified, attaches user to req
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    // Ensure unverified accounts cannot access protected features
    if (req.user.isEmailVerified === false) {
      return res.status(403).json({
        success: false,
        requiresVerification: true,
        email: req.user.email,
        message: 'Account not verified. Please verify your email to access this feature.',
      });
    }

    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized, token invalid or expired' });
  }
};

/**
 * adminOnly — must come after protect()
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ success: false, message: 'Access denied: administrators only' });
};
