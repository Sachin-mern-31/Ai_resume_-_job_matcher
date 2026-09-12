import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Layout components
import SideBar from "./components/sideBar/SideBar";

// Pages
import Login    from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./components/Dashboard/Dashboard";
import History  from "./components/History/History";
import Admin    from "./components/Admin/Admin";

// ─── Protected Route Wrapper ──────────────────────────────────────────────────
const ProtectedRoute = ({ children, adminRequired = false }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loadingScreen">Loading…</div>;
  if (!user)   return <Navigate to="/login" replace />;
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
  </div>
);

// ─── Root App ─────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes — no sidebar */}
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected app shell — has sidebar */}
        <Route path="/*" element={<AppShell />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
