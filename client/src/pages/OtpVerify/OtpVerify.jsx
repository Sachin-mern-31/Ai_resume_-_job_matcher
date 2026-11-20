import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const OtpVerify = () => {
  const { verifyEmailOtp, verifyResetOtp, resendOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Read email & purpose from URL query or location state
  const queryParams = new URLSearchParams(location.search);
  const email = (location.state?.email || queryParams.get('email') || '').trim();
  const purpose = (location.state?.purpose || queryParams.get('purpose') || 'registration').trim();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);

  const inputRefs = useRef([]);

  // Auto-focus first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  // 60-second resend countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    // Only accept numeric character
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...otp];
      updated[index] = '';
      setOtp(updated);
      return;
    }

    const updated = [...otp];
    updated[index] = cleaned[cleaned.length - 1]; // take last entered digit
    setOtp(updated);
    setError('');

    // Auto-focus next input
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/\D/g, '');
    if (!pasteData) return;

    const pasteDigits = pasteData.slice(0, 6).split('');
    const updated = [...otp];

    pasteDigits.forEach((digit, i) => {
      updated[i] = digit;
    });

    setOtp(updated);
    setError('');

    // Focus last filled or next input
    const nextIdx = Math.min(pasteDigits.length, 5);
    if (inputRefs.current[nextIdx]) {
      inputRefs.current[nextIdx].focus();
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      return setError('Please enter the complete 6-digit code.');
    }

    if (!email) {
      return setError('Email address is missing. Please start again from registration or login.');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (purpose === 'password_reset') {
        const res = await verifyResetOtp(email, fullOtp);
        setSuccess('Code verified successfully! Redirecting to password reset...');
        setTimeout(() => {
          navigate('/reset-password', {
            state: { resetToken: res.resetToken, email },
          });
        }, 1000);
      } else {
        await verifyEmailOtp(email, fullOtp);
        setSuccess('Email verified successfully! Taking you to your dashboard...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending || !email) return;

    setError('');
    setSuccess('');
    setResending(true);

    try {
      await resendOtp(email, purpose);
      setSuccess('A fresh 6-digit code has been sent to your email.');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) inputRefs.current[0].focus();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend code. Please try again later.');
    } finally {
      setResending(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="page_bg">
        <div className="form_container">
          <div className="logo_container">
            <MarkEmailReadIcon sx={{ fontSize: 44, color: '#115DFC' }} />
          </div>

          <div className="title_container">
            <h1 className="title">
              {purpose === 'password_reset' ? 'Verify Reset Code' : 'Verify Your Email'}
            </h1>
            <p className="subtitle">
              We sent a 6-digit security code to:
            </p>
            <div className="email_badge">{email || 'your email'}</div>
            <p className="expiry_notice">Code expires in <strong>5 minutes</strong></p>
          </div>

          {error && <div className="error_banner">{error}</div>}
          {success && <div className="success_banner">{success}</div>}

          <form onSubmit={handleVerify} className="otp_form">
            <div className="otp_inputs_wrapper" onPaste={handlePaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`otp_box ${digit ? 'filled' : ''}`}
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            <button
              type="submit"
              className="verify_btn"
              disabled={loading || otp.join('').length !== 6}
            >
              <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
            </button>
          </form>

          <div className="resend_section">
            <p className="resend_text">Didn't receive the email?</p>
            {countdown > 0 ? (
              <span className="cooldown_badge">
                Resend code in <strong>{countdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="resend_btn"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>

          <div className="back_link_wrapper">
            <Link to={purpose === 'password_reset' ? '/login' : '/register'} className="back_link">
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <span>Back to {purpose === 'password_reset' ? 'Sign In' : 'Sign Up'}</span>
            </Link>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .page_bg {
    min-height: 100dvh;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%);
    padding: clamp(12px, 3vw, 24px);
    box-sizing: border-box;
  }

  .form_container {
    width: 100%;
    max-width: min(440px, 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: clamp(24px, 5vw, 36px) clamp(14px, 4vw, 32px);
    background-color: #ffffff;
    border-radius: 16px;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.25);
    font-family: 'Inter', sans-serif;
    box-sizing: border-box;
  }

  .logo_container {
    width: clamp(56px, 14vw, 72px);
    height: clamp(56px, 14vw, 72px);
    background: linear-gradient(180deg, #f0f4ff 0%, #e0e8ff 100%);
    border: 1px solid #d0deff;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    box-shadow: 0px 4px 12px rgba(17, 93, 252, 0.15);
  }

  .title_container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    text-align: center;
    width: 100%;
  }

  .title {
    margin: 0;
    font-size: clamp(1.15rem, 4.5vw, 1.35rem);
    font-weight: 700;
    color: #111827;
  }

  .subtitle {
    margin: 0;
    font-size: clamp(0.78rem, 2.2vw, 0.85rem);
    color: #6b7280;
  }

  .email_badge {
    background: #f1f5f9;
    color: #0f172a;
    font-weight: 600;
    font-size: clamp(0.78rem, 2.2vw, 0.85rem);
    padding: 4px 12px;
    border-radius: 20px;
    margin-top: 4px;
    word-break: break-all;
    border: 1px solid #e2e8f0;
    max-width: 100%;
    box-sizing: border-box;
    text-align: center;
  }

  .expiry_notice {
    font-size: 0.78rem;
    color: #64748b;
    margin: 4px 0 0;
  }

  .error_banner {
    width: 100%;
    background-color: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 0.825rem;
    text-align: center;
    box-sizing: border-box;
  }

  .success_banner {
    width: 100%;
    background-color: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #15803d;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 0.825rem;
    text-align: center;
    box-sizing: border-box;
  }

  .otp_form {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 18px;
    margin-top: 8px;
    box-sizing: border-box;
  }

  .otp_inputs_wrapper {
    display: flex;
    gap: clamp(4px, 1.5vw, 10px);
    justify-content: center;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
  }

  .otp_box {
    width: clamp(34px, 11vw, 48px);
    height: clamp(42px, 13vw, 54px);
    font-size: clamp(1.1rem, 4vw, 1.4rem);
    font-weight: 700;
    text-align: center;
    border-radius: clamp(6px, 1.8vw, 10px);
    border: 1.5px solid #d1d5db;
    background-color: #f9fafb;
    color: #111827;
    outline: none;
    transition: all 0.2s ease;
    padding: 0;
    box-sizing: border-box;
    flex: 0 1 48px;
  }

  .otp_box:focus {
    border-color: #115DFC;
    background-color: #ffffff;
    box-shadow: 0 0 0 3px rgba(17, 93, 252, 0.15);
    transform: translateY(-2px);
  }

  .otp_box.filled {
    border-color: #115DFC;
    background-color: #f0f5ff;
  }

  .verify_btn {
    width: 100%;
    min-height: 46px;
    border: 0;
    background: linear-gradient(135deg, #115DFC 0%, #0046d5 100%);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .verify_btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(17, 93, 252, 0.3);
  }

  .verify_btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .resend_section {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
  }

  .resend_text {
    font-size: 0.82rem;
    color: #6b7280;
    margin: 0;
  }

  .cooldown_badge {
    font-size: 0.8rem;
    color: #64748b;
    background: #f8fafc;
    padding: 4px 12px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
  }

  .resend_btn {
    background: none;
    border: none;
    color: #115DFC;
    font-weight: 600;
    font-size: 0.85rem;
    cursor: pointer;
    padding: 6px 10px;
    text-decoration: underline;
    min-height: 36px;
  }

  .resend_btn:hover {
    color: #0046d5;
  }

  .back_link_wrapper {
    margin-top: 8px;
    border-top: 1px solid #f1f5f9;
    padding-top: 14px;
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .back_link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: #64748b;
    font-size: 0.825rem;
    text-decoration: none;
    font-weight: 500;
    min-height: 36px;
  }

  .back_link:hover {
    color: #0f172a;
    text-decoration: underline;
  }
`;

export default OtpVerify;
