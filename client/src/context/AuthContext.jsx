import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on app start
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser  = localStorage.getItem('user');
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';
    const { data } = await api.post('/auth/login', { email: cleanEmail, password: cleanPassword });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (name, email, password, confirmPassword) => {
    const cleanName = name ? name.trim() : '';
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    const cleanPassword = password ? password.trim() : '';
    const cleanConfirm = confirmPassword ? confirmPassword.trim() : '';
    const { data } = await api.post('/auth/register', {
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      confirmPassword: cleanConfirm,
    });
    return data;
  };

  const verifyEmailOtp = async (email, otp) => {
    const { data } = await api.post('/auth/verify-email-otp', {
      email: email ? email.trim().toLowerCase() : '',
      otp: otp ? otp.trim() : '',
    });
    if (data.token && data.user) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const resendOtp = async (email, purpose = 'registration') => {
    const { data } = await api.post('/auth/resend-email-otp', {
      email: email ? email.trim().toLowerCase() : '',
      purpose,
    });
    return data;
  };

  const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgot-password', {
      email: email ? email.trim().toLowerCase() : '',
    });
    return data;
  };

  const verifyResetOtp = async (email, otp) => {
    const { data } = await api.post('/auth/verify-reset-otp', {
      email: email ? email.trim().toLowerCase() : '',
      otp: otp ? otp.trim() : '',
    });
    return data;
  };

  const resetPassword = async (resetToken, newPassword, confirmPassword) => {
    const { data } = await api.post('/auth/reset-password', {
      resetToken,
      newPassword: newPassword ? newPassword.trim() : '',
      confirmPassword: confirmPassword ? confirmPassword.trim() : '',
    });
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        verifyEmailOtp,
        resendOtp,
        forgotPassword,
        verifyResetOtp,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
