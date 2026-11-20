import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import ArticleIcon from '@mui/icons-material/Article';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const initialSuccessMessage = location.state?.message || '';

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.requiresVerification) {
        setUnverifiedEmail(resp.email || form.email);
        setError(resp.message || 'Please verify your email address to log in.');
      } else {
        setError(resp?.message || 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="page_bg">
        <form onSubmit={handleSubmit} className="form_container" id="login-form">
          <div className="logo_container">
            <ArticleIcon sx={{ fontSize: 44, color: '#115DFC' }} />
          </div>
          <div className="title_container">
            <h1 className="title">Login to your Account</h1>
            <span className="subtitle">Welcome back! Sign in to get instant AI resume analysis & job insights.</span>
          </div>

          {initialSuccessMessage && (
            <div className="success_banner">
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              <span>{initialSuccessMessage}</span>
            </div>
          )}

          {error && <div className="error_banner">{error}</div>}

          {unverifiedEmail && (
            <div className="unverified_cta">
              <p>Email not verified yet?</p>
              <Link
                to="/verify-otp"
                state={{ email: unverifiedEmail, purpose: 'registration' }}
                className="verify_cta_btn"
              >
                Verify Email Now &rarr;
              </Link>
            </div>
          )}

          <div className="input_container">
            <label className="input_label" htmlFor="email_field">Email</label>
            <div className="field_inner">
              <svg fill="none" viewBox="0 0 24 24" height={22} width={22} xmlns="http://www.w3.org/2000/svg" className="icon">
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M7 8.5L9.94202 10.2394C11.6572 11.2535 12.3428 11.2535 14.058 10.2394L17 8.5" />
                <path strokeLinejoin="round" strokeWidth="1.5" stroke="#141B34" d="M2.01577 13.4756C2.08114 16.5412 2.11383 18.0739 3.24496 19.2094C4.37608 20.3448 5.95033 20.3843 9.09883 20.4634C11.0393 20.5122 12.9607 20.5122 14.9012 20.4634C18.0497 20.3843 19.6239 20.3448 20.7551 19.2094C21.8862 18.0739 21.9189 16.5412 21.9842 13.4756C22.0053 12.4899 22.0053 11.5101 21.9842 10.5244C21.9189 7.45886 21.8862 5.92609 20.7551 4.79066C19.6239 3.65523 18.0497 3.61568 14.9012 3.53657C12.9607 3.48781 11.0393 3.48781 9.09882 3.53656C5.95033 3.61566 4.37608 3.65521 3.24495 4.79065C2.11382 5.92608 2.08114 7.45885 2.01576 10.5244C1.99474 11.5101 1.99475 12.4899 2.01577 13.4756Z" />
              </svg>
              <input
                id="email_field"
                type="email"
                name="email"
                placeholder="name@mail.com"
                className="input_field"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className="input_container">
            <div className="label_row">
              <label className="input_label" htmlFor="password_field">Password</label>
              <Link to="/forgot-password" className="forgot_link">Forgot password?</Link>
            </div>
            <div className="field_inner">
              <svg fill="none" viewBox="0 0 24 24" height={22} width={22} xmlns="http://www.w3.org/2000/svg" className="icon">
                <path strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M18 11.0041C17.4166 9.91704 16.273 9.15775 14.9519 9.0993C13.477 9.03404 11.9788 9 10.329 9C8.67911 9 7.18091 9.03404 5.70604 9.0993C3.95328 9.17685 2.51295 10.4881 2.27882 12.1618C2.12602 13.2541 2 14.3734 2 15.5134C2 16.6534 2.12602 17.7727 2.27882 18.865C2.51295 20.5387 3.95328 21.8499 5.70604 21.9275C6.42013 21.9591 7.26041 21.9834 8 22" />
                <path strokeLinejoin="round" strokeLinecap="round" strokeWidth="1.5" stroke="#141B34" d="M6 9V6.5C6 4.01472 8.01472 2 10.5 2C12.9853 2 15 4.01472 15 6.5V9" />
              </svg>
              <input
                id="password_field"
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="••••••••"
                className="input_field"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                className="toggle_visibility"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <VisibilityOffIcon sx={{ fontSize: 19, color: '#6b7280' }} />
                ) : (
                  <VisibilityIcon sx={{ fontSize: 19, color: '#6b7280' }} />
                )}
              </button>
            </div>
          </div>

          <button id="login-submit" title="Sign In" type="submit" className="sign-in_btn" disabled={loading}>
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
          </button>

          <p className="switch_prompt">
            Don&apos;t have an account? <Link to="/register" className="link">Create one free</Link>
          </p>
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
    justify-content: center;
    gap: 16px;
    padding: clamp(24px, 5vw, 38px) clamp(16px, 4.5vw, 34px);
    background-color: #ffffff;
    box-shadow: 0px 20px 40px rgba(0, 0, 0, 0.25);
    border-radius: 16px;
    font-family: "Inter", sans-serif;
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
    font-size: clamp(0.75rem, 2.2vw, 0.8rem);
    max-width: 95%;
    text-align: center;
    line-height: 1.3;
    color: #6b7280;
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-sizing: border-box;
  }

  .unverified_cta {
    width: 100%;
    background: #fffbeb;
    border: 1px solid #fde68a;
    padding: 10px 14px;
    border-radius: 8px;
    text-align: center;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 4px;
    align-items: center;
  }

  .unverified_cta p {
    margin: 0;
    font-size: 0.8rem;
    color: #92400e;
    font-weight: 500;
  }

  .verify_cta_btn {
    color: #115DFC;
    font-weight: 700;
    font-size: 0.85rem;
    text-decoration: underline;
  }

  .input_container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .label_row {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .input_label {
    font-size: 0.78rem;
    color: #4b5563;
    font-weight: 600;
  }

  .forgot_link {
    font-size: 0.78rem;
    color: #115DFC;
    text-decoration: none;
    font-weight: 500;
  }

  .forgot_link:hover {
    text-decoration: underline;
  }

  .field_inner {
    position: relative;
    width: 100%;
  }

  .icon {
    position: absolute;
    z-index: 2;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
  }

  .input_field {
    width: 100%;
    height: 44px;
    padding: 0 42px 0 40px;
    border-radius: 8px;
    outline: none;
    border: 1px solid #e5e7eb;
    background-color: #fafafa;
    box-sizing: border-box;
    font-size: 16px; /* 16px prevents iOS browser auto-zoom */
    color: #1f2937;
    transition: all 0.2s ease-in-out;
  }

  .input_field:focus {
    border-color: #115DFC;
    background-color: #ffffff;
    box-shadow: 0px 0px 0px 3px rgba(17, 93, 252, 0.15);
  }

  .toggle_visibility {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    min-width: 36px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .sign-in_btn {
    width: 100%;
    min-height: 46px;
    border: 0;
    background: linear-gradient(135deg, #115DFC 0%, #0046d5 100%);
    border-radius: 8px;
    outline: none;
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

  .sign-in_btn:hover:not(:disabled) {
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(17, 93, 252, 0.3);
  }

  .sign-in_btn:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .switch_prompt {
    font-size: 0.825rem;
    color: #6b7280;
    margin: 8px 0 0;
    text-align: center;
  }

  .link {
    color: #115DFC;
    font-weight: 600;
    text-decoration: none;
  }

  .link:hover {
    text-decoration: underline;
  }
`;

export default Login;
