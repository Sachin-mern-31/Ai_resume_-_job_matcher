import React, { useEffect, useState } from 'react';
import styles from './Admin.module.css';
import api from '../../utils/api';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const Admin = () => {
  const [users, setUsers]   = useState([]);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    Promise.all([api.get('/admin/users'), api.get('/admin/stats')])
      .then(([usersRes, statsRes]) => {
        setUsers(usersRes.data.data);
        setStats(statsRes.data.data);
      })
      .catch(() => setError('Failed to load admin data.'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}" and all their analyses?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed.');
    }
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>;
  if (error)   return <div className={styles.center}><p className={styles.errMsg}>{error}</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Admin Panel</h1>
        <p className={styles.pageSubtitle}>Manage users and monitor system activity</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsGrid}>
          <StatCard icon={<PeopleIcon sx={{ fontSize: 32, color: '#4848de' }} />} label="Total Users" value={stats.totalUsers} />
          <StatCard icon={<AssessmentIcon sx={{ fontSize: 32, color: '#27ae60' }} />} label="Total Analyses" value={stats.totalResumes} />
          <StatCard icon={<AssessmentIcon sx={{ fontSize: 32, color: '#f39c12' }} />} label="Completed" value={stats.completedResumes} />
          <StatCard icon={<EmojiEventsIcon sx={{ fontSize: 32, color: '#e74c3c' }} />} label="Avg Match Score" value={`${stats.avgMatchScore}%`} />
        </div>
      )}

      {/* Users table */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Registered Users</h2>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className={styles.userCell}>
                      <div className={styles.avatar}>{u.name.charAt(0).toUpperCase()}</div>
                      {u.name}
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td><span className={styles.roleBadge} data-role={u.role}>{u.role}</span></td>
                  <td>{formatDate(u.createdAt)}</td>
                  <td>
                    <button
                      id={`delete-user-${u._id}`}
                      className={styles.deleteBtn}
                      onClick={() => handleDelete(u._id, u.name)}
                      title="Delete user"
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 20 }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon}>{icon}</div>
    <div>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  </div>
);

export default Admin;
