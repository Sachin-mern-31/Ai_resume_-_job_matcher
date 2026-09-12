import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Login.module.css';
import ArticleIcon from '@mui/icons-material/Article';

const Login = () => {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left panel */}
      <div className={styles.left}>
        <div className={styles.brand}>
          <ArticleIcon sx={{ fontSize: 52, color: '#fff' }} />
          <h1 className={styles.brandName}>ResumeMatch</h1>
          <p className={styles.brandTagline}>
            Upload your resume. Get AI-powered insights.<br />
            Land your dream job.
          </p>
        </div>
        <div className={styles.leftFeatures}>
          {['⚡ Instant match scoring', '🎯 Skill gap analysis', '💼 AI job suggestions', '📊 History & tracking'].map((f) => (
            <div key={f} className={styles.featureChip}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>Sign in to your account</p>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} id="login-form">
            <div className={styles.field}>
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner} /> : 'Sign In'}
            </button>
          </form>

          <p className={styles.switchText}>
            Don&apos;t have an account?{' '}
            <Link to="/register" className={styles.switchLink}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
