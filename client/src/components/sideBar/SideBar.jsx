import styles from './SideBar.module.css'
import ArticleIcon from '@mui/icons-material/Article';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const SideBar = () => {
  const location = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLink = (path) =>
    [styles.sideBarOption, location.pathname === path ? styles.selectedOption : null]
      .filter(Boolean).join(' ');

  return (
    <div className={styles.sideBar}>
      {/* Brand */}
      <div className={styles.sideBarIcon}>
        <ArticleIcon sx={{ fontSize: 48, marginBottom: 1 }} />
        <div className={styles.sideBarTopContent}>Resume<span className={styles.aiLabel}>Match</span></div>
      </div>

      {/* Navigation */}
      <nav className={styles.sideBarNav}>
        <Link to="/dashboard" className={navLink('/dashboard')}>
          <DashboardIcon sx={{ fontSize: 22 }} />
          <div>Dashboard</div>
        </Link>
        <Link to="/history" className={navLink('/history')}>
          <ManageSearchIcon sx={{ fontSize: 22 }} />
          <div>History</div>
        </Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className={navLink('/admin')}>
            <AdminPanelSettingsIcon sx={{ fontSize: 22 }} />
            <div>Admin</div>
          </Link>
        )}
      </nav>

      {/* User + Logout at bottom */}
      <div className={styles.sideBarBottom}>
        {user && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>{user.name}</div>
              <div className={styles.userRole}>{user.role}</div>
            </div>
          </div>
        )}
        <button id="sidebar-logout" className={styles.sideBarOption} onClick={handleLogout}>
          <LogoutIcon sx={{ fontSize: 22 }} />
          <div>Log Out</div>
        </button>
      </div>
    </div>
  );
};

export default SideBar;