import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout components
import SideBar from "./components/sideBar/SideBar";

// Pages
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import OtpVerify from "./pages/OtpVerify/OtpVerify";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import Dashboard from "./components/Dashboard/Dashboard";
import History from "./components/History/History";
import Admin from "./components/Admin/Admin";
import Landing from "./pages/Landing/Landing";
import CookieConsent from "./components/CookieConsent/CookieConsent";

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loadingScreen">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.isEmailVerified === false) {
    return <Navigate to="/verify-otp" state={{ email: user.email, purpose: 'registration' }} replace />;
  }
  if (adminRequired && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

// ─── App Shell: Sidebar + Routes ─────────────────────────────────────────────
const AppShell = () => (
  <div className="App">
    <SideBar />
    <div className="mainContent">
      <Routes>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/history"   element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/admin"     element={<ProtectedRoute adminRequired><Admin /></ProtectedRoute>} />
        <Route path="*"          element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
    <CookieConsent />
  </div>
);

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* Public Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<OtpVerify />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected app shell — has sidebar */}
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
