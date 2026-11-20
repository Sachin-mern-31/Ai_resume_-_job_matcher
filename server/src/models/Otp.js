import mongoose from 'mongoose';
import crypto from 'crypto';

const OtpSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required for OTP'],
      lowercase: true,
      trim: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    purpose: {
      type: String,
      enum: ['registration', 'password_reset'],
      required: [true, 'OTP purpose is required'],
      index: true,
    },
    attempts: {
      type: Number,
      default: 0,
      max: 5,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration timestamp is required'],
      index: true,
    },
    lastResendAt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // MongoDB TTL index: removes document after 15 minutes
    },
  },
  { timestamps: false }
);

// Compound index for fast queries by email + purpose
OtpSchema.index({ email: 1, purpose: 1 });

/**
 * Static: generate a cryptographically random 6-digit OTP
 */
OtpSchema.statics.generateRawOtp = function () {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Static: securely hash the OTP with a salt / pepper
 */
OtpSchema.statics.hashOtp = function (rawOtp, secret = process.env.JWT_SECRET || 'otp_salt_fallback') {
  return crypto.createHmac('sha256', secret).update(rawOtp).digest('hex');
};

/**
 * Instance method: verify entered plain OTP against stored hash
 */
OtpSchema.methods.verifyOtp = function (rawOtp, secret = process.env.JWT_SECRET || 'otp_salt_fallback') {
  const enteredHash = crypto.createHmac('sha256', secret).update(rawOtp).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(this.otpHash, 'hex'), Buffer.from(enteredHash, 'hex'));
};

/**
 * Instance method: check if OTP is expired
 */
OtpSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

const Otp = mongoose.model('Otp', OtpSchema);
export default Otp;
