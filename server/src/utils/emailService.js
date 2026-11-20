import nodemailer from 'nodemailer';

/**
 * Creates and configures the Nodemailer transporter.
 */
const createTransporter = () => {
  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT, 10) || 587;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  // Check if SMTP credentials are provided and valid
  const hasValidCreds = Boolean(
    user &&
    pass &&
    user.trim().length > 0 &&
    pass.trim().length > 0 &&
    !user.includes('your_email') &&
    !pass.includes('your_password')
  );

  if (!hasValidCreds) {
    return null; // Fallback mode
  }

  const cleanPass = pass.replace(/\s+/g, '');
  const cleanUser = user.trim();

  // If Gmail is used, use Nodemailer's built-in gmail service
  if (host?.includes('gmail') || cleanUser.includes('@gmail.com')) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: { user: cleanUser, pass: cleanPass },
    });
  }

  return nodemailer.createTransport({
    host: host || 'smtp.gmail.com',
    port,
    secure: port === 465,
    auth: { user: cleanUser, pass: cleanPass },
    tls: { rejectUnauthorized: false },
  });
};

const getFromAddress = () => {
  return process.env.EMAIL_FROM || `"ResumeMatch AI" <${process.env.EMAIL_USER || 'no-reply@resumematch.ai'}>`;
};

/**
 * Shared HTML wrapper for all transactional emails
 */
const wrapEmailTemplate = ({ title, preheader, bodyContent }) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; }
    .container { max-width: 580px; margin: 30px auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); }
    .header { background: linear-gradient(135deg, #115DFC 0%, #003db3 100%); padding: 32px 30px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
    .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
    .content { padding: 36px 32px; }
    .otp-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 26px 0; }
    .otp-code { font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #115DFC; font-family: 'Courier New', monospace; margin: 0; }
    .otp-meta { font-size: 12px; color: #64748b; margin-top: 8px; }
    .notice { font-size: 13px; color: #64748b; line-height: 1.6; border-left: 3px solid #115DFC; padding-left: 12px; margin: 24px 0 16px; }
    .footer { background-color: #f8fafc; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
    .footer a { color: #115DFC; text-decoration: none; }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${preheader}
  </div>
  <div class="container">
    <div class="header">
      <h1>🚀 ResumeMatch AI</h1>
      <p>AI-Powered Resume Analysis & Job Matching</p>
    </div>
    <div class="content">
      ${bodyContent}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ResumeMatch AI. All rights reserved.</p>
      <p>This is an automated security notification. Please do not reply directly to this email.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * 1. Send Registration Email OTP
 */
export const sendRegistrationOtp = async (email, name, otp, expiresInMinutes = 5) => {
  const subject = `Your Verification Code: ${otp} - ResumeMatch AI`;
  const bodyContent = `
    <h2 style="margin-top:0; color:#0f172a; font-size:20px;">Verify Your Email Address</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Thank you for joining <strong>ResumeMatch AI</strong>. To activate your account and start analyzing your resumes against target jobs, please enter the 6-digit verification code below:</p>
    
    <div class="otp-box">
      <p class="otp-code">${otp}</p>
      <p class="otp-meta">Expires in <strong>${expiresInMinutes} minutes</strong></p>
    </div>
    
    <div class="notice">
      <strong>Security Notice:</strong> Never share this verification code with anyone. ResumeMatch representatives will never ask for your code.
    </div>
    <p style="font-size:13px; color:#64748b; margin-bottom:0;">If you didn't create a ResumeMatch account, you can safely ignore this email.</p>
  `;

  return deliverEmail({
    to: email,
    subject,
    preheader: `Your 6-digit ResumeMatch verification code is ${otp}`,
    html: wrapEmailTemplate({ title: 'Verify Email', preheader: `Code: ${otp}`, bodyContent }),
    plainOtp: otp,
    purpose: 'registration',
  });
};

/**
 * 2. Send Password Reset OTP
 */
export const sendForgotPasswordOtp = async (email, name, otp, expiresInMinutes = 5) => {
  const subject = `Password Reset Code: ${otp} - ResumeMatch AI`;
  const bodyContent = `
    <h2 style="margin-top:0; color:#0f172a; font-size:20px;">Reset Your Password</h2>
    <p>Hi ${name || 'there'},</p>
    <p>We received a request to reset the password for your ResumeMatch AI account. Use the 6-digit verification code below to proceed with resetting your password:</p>
    
    <div class="otp-box">
      <p class="otp-code">${otp}</p>
      <p class="otp-meta">Expires in <strong>${expiresInMinutes} minutes</strong></p>
    </div>
    
    <div class="notice">
      <strong>Security Notice:</strong> If you did not request a password reset, someone may be attempting to access your account. Please secure your email address.
    </div>
  `;

  return deliverEmail({
    to: email,
    subject,
    preheader: `Your password reset code is ${otp}`,
    html: wrapEmailTemplate({ title: 'Password Reset', preheader: `Reset Code: ${otp}`, bodyContent }),
    plainOtp: otp,
    purpose: 'password_reset',
  });
};

/**
 * 3. Send Email Verified Confirmation
 */
export const sendEmailVerifiedNotification = async (email, name) => {
  const subject = '🎉 Email Verified Successfully - Welcome to ResumeMatch AI!';
  const bodyContent = `
    <h2 style="margin-top:0; color:#0f172a; font-size:20px;">Welcome Aboard! 🎉</h2>
    <p>Hi ${name || 'there'},</p>
    <p>Your email address <strong>${email}</strong> has been successfully verified! Your ResumeMatch AI account is now fully active.</p>
    <p>You can now:</p>
    <ul>
      <li>Upload and parse resumes with ATS precision</li>
      <li>Match your skills against job descriptions</li>
      <li>Get instant AI-driven recommendations and skill gaps</li>
      <li>Access your complete analysis history</li>
    </ul>
    <p style="margin-top:24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" style="background:#115DFC; color:#ffffff; padding:12px 24px; text-decoration:none; border-radius:8px; font-weight:600; display:inline-block;">Go to Dashboard &rarr;</a>
    </p>
  `;

  return deliverEmail({
    to: email,
    subject,
    preheader: 'Your ResumeMatch account is now active!',
    html: wrapEmailTemplate({ title: 'Email Verified', preheader: 'Welcome to ResumeMatch AI', bodyContent }),
    purpose: 'welcome',
  });
};

/**
 * 4. Send Password Changed Confirmation
 */
export const sendPasswordChangedNotification = async (email, name) => {
  const subject = '🔒 Security Alert: Your Password Was Successfully Changed';
  const bodyContent = `
    <h2 style="margin-top:0; color:#0f172a; font-size:20px;">Password Changed Successfully</h2>
    <p>Hi ${name || 'there'},</p>
    <p>This is a confirmation that the password for your ResumeMatch AI account (<strong>${email}</strong>) was changed on <strong>${new Date().toUTCString()}</strong>.</p>
    <div class="notice">
      <strong>Didn't make this change?</strong> If you did not change your password, please contact our support team immediately or reset your password to protect your account.
    </div>
  `;

  return deliverEmail({
    to: email,
    subject,
    preheader: 'Your ResumeMatch password was updated',
    html: wrapEmailTemplate({ title: 'Password Updated', preheader: 'Password changed alert', bodyContent }),
    purpose: 'password_changed',
  });
};

/**
 * Internal delivery handler with graceful dev/sandbox fallback
 */
const deliverEmail = async ({ to, subject, html, plainOtp, purpose }) => {
  const transporter = createTransporter();

  if (!transporter) {
    // Console fallback mode for development without live SMTP
    console.log(`\n================== [EMAIL FALLBACK - LOCAL/DEV] ==================`);
    console.log(`[To]: ${to}`);
    console.log(`[Subject]: ${subject}`);
    console.log(`[Purpose]: ${purpose}`);
    if (plainOtp) {
      console.log(`[🔐 VERIFICATION OTP CODE]: >>> ${plainOtp} <<<`);
    }
    console.log(`[Tip]: To send live emails, configure EMAIL_USER and EMAIL_PASSWORD in server/.env`);
    console.log(`===================================================================\n`);
    return { success: true, mode: 'fallback' };
  }

  try {
    const info = await transporter.sendMail({
      from: getFromAddress(),
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to} [MessageId: ${info.messageId}]`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`❌ Failed to send email to ${to}:`, err.message);
    if (err.message.includes('535') || err.message.includes('Username and Password not accepted') || err.message.includes('Application-specific password required')) {
      console.error('👉 IMPORTANT: Google blocked the login because it is a regular Gmail password.');
      console.error('👉 Google requires a 16-character "App Password" for sending emails.');
      console.error('👉 Generate a 16-character App Password at: https://myaccount.google.com/apppasswords');
    }
    if (plainOtp) {
      console.log(`[🔐 FALLBACK OTP CODE]: >>> ${plainOtp} <<<`);
    }
    return { success: false, error: err.message };
  }
};
