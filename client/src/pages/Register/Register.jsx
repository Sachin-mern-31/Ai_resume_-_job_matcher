import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from '../Login/Login.module.css';
import ArticleIcon from '@mui/icons-material/Article';

const Register = () => {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left brand panel */}
      <div className={styles.left}>
        <div className={styles.brand}>
          <ArticleIcon sx={{ fontSize: 52, color: '#fff' }} />
          <h1 className={styles.brandName}>ResumeMatch</h1>
          <p className={styles.brandTagline}>
            Join thousands of job seekers getting hired faster with AI-powered resume analysis.
          </p>
        </div>
        <div className={styles.leftFeatures}>
          {['🆓 Free to get started', '🤖 Powered by Gemini AI', '📈 Real match scores', '🔒 Your data is private'].map((f) => (
            <div key={f} className={styles.featureChip}>{f}</div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={styles.card}>
          <h2 className={styles.title}>Create account</h2>
          <p className={styles.subtitle}>Start analyzing your resume for free</p>

          {error && <div className={styles.errorBanner}>{error}</div>}

          <form onSubmit={handleSubmit} className={styles.form} id="register-form">
            <div className={styles.field}>
              <label htmlFor="register-name">Full Name</label>
              <input
                id="register-name"
                type="text"
                name="name"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
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
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={form.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <button
              id="register-submit"
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? <span className={styles.spinner} /> : 'Create Account'}
            </button>
          </form>

          <p className={styles.switchText}>
            Already have an account?{' '}
            <Link to="/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
