import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import LockResetIcon from '@mui/icons-material/LockReset';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const ForgotPassword = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      return setError('Please enter your registered email address.');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setSuccess(res.message || 'If this email is registered, a 6-digit code has been sent.');
      setTimeout(() => {
        navigate('/verify-otp', {
          state: { email: email.trim().toLowerCase(), purpose: 'password_reset' },
        });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not process request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="page_bg">
        <form onSubmit={handleSubmit} className="form_container">
          <div className="logo_container">
            <LockResetIcon sx={{ fontSize: 44, color: '#115DFC' }} />
          </div>

          <div className="title_container">
            <h1 className="title">Forgot Password?</h1>
            <p className="subtitle">
              Enter the email address associated with your account and we’ll send you a 6-digit verification code to reset your password.
            </p>
          </div>

          {error && <div className="error_banner">{error}</div>}
          {success && <div className="success_banner">{success}</div>}

          <div className="input_container">
            <label className="input_label" htmlFor="forgot_email_field">Email Address</label>
            <svg fill="none" viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg" className="icon">
              <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5" />
              <path strokeLinejoin="round" strokeWidth="1.5" stroke="#141B34" d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" />
            </svg>
            <input
              id="forgot_email_field"
              type="email"
              name="email"
              placeholder="name@mail.com"
              className="input_field"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="submit_btn"
            disabled={loading || !email}
          >
            <span>{loading ? 'Sending Code...' : 'Send Reset Code'}</span>
          </button>

          <div className="back_link_wrapper">
            <Link to="/login" className="back_link">
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
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
    max-width: min(420px, 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: clamp(24px, 5vw, 40px) clamp(16px, 4.5vw, 36px);
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
    gap: 6px;
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
    font-size: clamp(0.75rem, 2.2vw, 0.82rem);
    line-height: 1.35rem;
    color: #6b7280;
    text-align: center;
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

  .input_container {
    width: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .icon {
    width: 20px;
    position: absolute;
    z-index: 2;
    left: 12px;
    bottom: 12px;
  }

  .input_label {
    font-size: 0.78rem;
    color: #4b5563;
    font-weight: 600;
  }

  .input_field {
    width: 100%;
    height: 44px;
    padding: 0 12px 0 40px;
    border-radius: 8px;
    outline: none;
    border: 1px solid #e5e7eb;
    background-color: #fafafa;
    box-sizing: border-box;
    font-size: 16px; /* 16px prevents iOS zoom on focus */
    color: #1f2937;
    transition: all 0.2s ease-in-out;
  }

  .input_field:focus {
    border-color: #115DFC;
    background-color: #ffffff;
    box-shadow: 0px 0px 0px 3px rgba(17, 93, 252, 0.15);
  }

  .submit_btn {
    width: 100%;
    min-height: 46px;
    border: 0;
    background: linear-gradient(135deg, #115DFC 0%, #0046d5 100%);
    border-radius: 8px;
    color: #ffffff;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 4px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
  }

  .submit_btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(17, 93, 252, 0.3);
  }

  .submit_btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .back_link_wrapper {
    margin-top: 4px;
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

export default ForgotPassword;
