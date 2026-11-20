import rateLimit from 'express-rate-limit';

/**
 * Standard JSON response handler for rate limiting
 */
const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    success: false,
    message: message || 'Too many requests from this IP, please try again later.',
  });
};

/**
 * General auth endpoints rate limiter (60 requests per 15 minutes)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many requests to authentication services. Please try again later.'),
});

/**
 * Strict login rate limiter (10 attempts per 15 minutes)
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many login attempts. Please wait 15 minutes before trying again.'),
});

/**
 * OTP Request rate limiter (registration, resend, forgot password: 5 requests per 15 minutes)
 */
export const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many OTP requests from this address. Please wait a few minutes before trying again.'),
});

/**
 * OTP Verification rate limiter (15 verification attempts per 15 minutes)
 */
export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many verification attempts. Please wait a few minutes.'),
});
