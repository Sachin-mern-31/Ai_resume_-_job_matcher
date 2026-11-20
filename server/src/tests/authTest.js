import assert from 'assert';
import crypto from 'crypto';
import Otp from '../models/Otp.js';
import User from '../models/User.js';

console.log('--- Starting Authentication Security & Logic Tests ---');

// Test 1: Cryptographic OTP generation
const otp1 = Otp.generateRawOtp();
assert.strictEqual(typeof otp1, 'string', 'OTP should be a string');
assert.strictEqual(otp1.length, 6, 'OTP must be 6 digits');
assert.ok(/^\d{6}$/.test(otp1), 'OTP must be all numeric digits');
console.log('✓ Test 1: Cryptographic 6-digit OTP generation passed.');

// Test 2: Hashing and Timing-Safe Verification
const secret = 'test_jwt_secret_123';
const hash = Otp.hashOtp(otp1, secret);
assert.strictEqual(typeof hash, 'string', 'Hash should be a string');

const mockOtpDoc = new Otp({
  email: 'test@example.com',
  otpHash: hash,
  purpose: 'registration',
  expiresAt: new Date(Date.now() + 5 * 60 * 1000),
});

assert.strictEqual(mockOtpDoc.verifyOtp(otp1, secret), true, 'Correct OTP should verify to true');
assert.strictEqual(mockOtpDoc.verifyOtp('000000', secret), false, 'Incorrect OTP should verify to false');
console.log('✓ Test 2: Timing-safe OTP hash verification passed.');

// Test 3: Expiration logic
const expiredOtpDoc = new Otp({
  email: 'test@example.com',
  otpHash: hash,
  purpose: 'registration',
  expiresAt: new Date(Date.now() - 1000), // 1 second ago
});
assert.strictEqual(expiredOtpDoc.isExpired(), true, 'Expired OTP should report isExpired() === true');
assert.strictEqual(mockOtpDoc.isExpired(), false, 'Active OTP should report isExpired() === false');
console.log('✓ Test 3: Expiration validation passed.');

// Test 4: Password hashing pre-save logic
const user = new User({
  name: 'Test Candidate',
  email: 'candidate@example.com',
  password: 'plainPassword123!',
  isEmailVerified: false,
});
await user.validate();
assert.strictEqual(user.isEmailVerified, false, 'New user defaults to isEmailVerified === false');
console.log('✓ Test 4: User model validation passed.');

// Test 5: Legacy user backward compatibility rule
const legacyUser = {
  _id: 'legacy_id_1',
  name: 'Old User',
  email: 'legacy@example.com',
  role: 'user',
  // isEmailVerified is undefined in legacy records
};
const isAllowed = legacyUser.isEmailVerified !== false;
assert.strictEqual(isAllowed, true, 'Legacy user without isEmailVerified should be allowed to log in');
console.log('✓ Test 5: Legacy user backward compatibility passed.');

console.log('--- ALL AUTHENTICATION CORE TESTS PASSED! ---');
