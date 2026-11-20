import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';
import LockResetIcon from '@mui/icons-material/LockReset';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '#e5e7eb' };
  let score = 0;
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
  if (score === 3 || score === 4) return { score: 3, label: 'Good', color: '#3b82f6' };
  return { score: 4, label: 'Strong', color: '#10b981' };
};

const ResetPassword = () => {
  const { resetPassword } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const resetToken = location.state?.resetToken || queryParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = calculatePasswordStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!resetToken) {
      return setError('Reset token is missing or has expired. Please request a new code.');
    }
    if (newPassword.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }
    if (newPassword !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await resetPassword(resetToken, newPassword, confirmPassword);
      setSuccess(res.message || 'Password reset successfully! Redirecting to sign in...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Password reset successfully. Please log in with your new password.' },
        });
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not reset password. Please try requesting a new code.');
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
            <h1 className="title">Set New Password</h1>
            <p className="subtitle">
              Choose a strong, memorable password to secure your account.
            </p>
          </div>

          {error && <div className="error_banner">{error}</div>}
          {success && (
            <div className="success_banner">
              <CheckCircleIcon sx={{ fontSize: 18 }} />
              <span>{success}</span>
            </div>
          )}

          {!resetToken && !success && (
            <div className="error_banner">
              No reset authorization token found.{' '}
              <Link to="/forgot-password" className="link">Request a code</Link>
            </div>
          )}

          <div className="input_container">
            <label className="input_label" htmlFor="new_password_field">New Password</label>
            <div className="field_wrapper">
              <input
                id="new_password_field"
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                placeholder="At least 6 characters"
                className="input_field"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
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

            {/* Password strength bar */}
            {newPassword && (
              <div className="strength_wrapper">
                <div className="strength_bars">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className="bar_segment"
                      style={{
                        backgroundColor: level <= strength.score ? strength.color : '#e5e7eb',
                      }}
                    />
                  ))}
                </div>
                <span className="strength_label" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="input_container">
            <label className="input_label" htmlFor="confirm_password_field">Confirm New Password</label>
            <div className="field_wrapper">
              <input
                id="confirm_password_field"
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter your new password"
                className="input_field"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle_visibility"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
              >
                {showConfirm ? (
                  <VisibilityOffIcon sx={{ fontSize: 19, color: '#6b7280' }} />
                ) : (
                  <VisibilityIcon sx={{ fontSize: 19, color: '#6b7280' }} />
                )}
              </button>
            </div>
            {confirmPassword && newPassword && confirmPassword !== newPassword && (
              <span className="field_warning">Passwords do not match</span>
            )}
          </div>

          <button
            type="submit"
            className="submit_btn"
            disabled={loading || !newPassword || !confirmPassword || !resetToken}
          >
            <span>{loading ? 'Updating Password...' : 'Save New Password'}</span>
          </button>

          <p className="switch_prompt">
            Remember your credentials? <Link to="/login" className="link">Sign In</Link>
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
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    box-sizing: border-box;
  }

  .input_container {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .input_label {
    font-size: 0.78rem;
    color: #4b5563;
    font-weight: 600;
  }

  .field_wrapper {
    position: relative;
    width: 100%;
  }

  .input_field {
    width: 100%;
    height: 44px;
    padding: 0 42px 0 14px;
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

  .strength_wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 4px;
  }

  .strength_bars {
    display: flex;
    gap: 4px;
    flex: 1;
    max-width: 140px;
  }

  .bar_segment {
    height: 4px;
    flex: 1;
    border-radius: 2px;
    transition: background-color 0.2s ease;
  }

  .strength_label {
    font-size: 0.75rem;
    font-weight: 600;
    margin-left: 8px;
  }

  .field_warning {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 2px;
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

export default ResetPassword;
