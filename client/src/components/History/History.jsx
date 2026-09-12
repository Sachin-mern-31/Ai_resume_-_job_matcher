import React, { useEffect, useState } from 'react';
import styles from './History.module.css';
import api from '../../utils/api';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const History = () => {
  const [resumes, setResumes]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const { data } = await api.get('/resume/history');
      setResumes(data.data);
    } catch (err) {
      setError('Could not load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this analysis?')) return;
    try {
      await api.delete(`/resume/${id}`);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch {
      alert('Delete failed.');
    }
  };

  const scoreColor = (s) => {
    if (s >= 75) return '#27ae60';
    if (s >= 50) return '#f39c12';
    return '#e74c3c';
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) return <div className={styles.center}><span className={styles.spinner} /></div>;
  if (error)   return <div className={styles.center}><p className={styles.errMsg}>{error}</p></div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>Analysis History</h1>
        <p className={styles.pageSubtitle}>{resumes.length} past {resumes.length === 1 ? 'analysis' : 'analyses'}</p>
      </div>

      {resumes.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📄</div>
          <h3>No analyses yet</h3>
          <p>Upload your resume on the Dashboard to get started.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {resumes.map((r) => (
            <div key={r._id} className={styles.item}>
              <div className={styles.itemHeader} onClick={() => setExpanded(expanded === r._id ? null : r._id)}>
                <div className={styles.itemLeft}>
                  <div className={styles.fileBadge}>📄</div>
                  <div>
                    <div className={styles.itemFilename}>{r.originalFilename}</div>
                    <div className={styles.itemDate}>{formatDate(r.createdAt)}</div>
                  </div>
                </div>
                <div className={styles.itemRight}>
                  {r.status === 'completed' ? (
                    <div className={styles.scoreChip} style={{ background: scoreColor(r.matchScore) + '22', color: scoreColor(r.matchScore) }}>
                      {r.matchScore}% match
                    </div>
                  ) : (
                    <div className={styles.statusChip} data-status={r.status}>{r.status}</div>
                  )}
                  <button
                    id={`expand-${r._id}`}
                    className={styles.expandBtn}
                    onClick={(e) => { e.stopPropagation(); setExpanded(expanded === r._id ? null : r._id); }}
                  >
                    {expanded === r._id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </button>
                  <button
                    id={`delete-${r._id}`}
                    className={styles.deleteBtn}
                    onClick={(e) => { e.stopPropagation(); handleDelete(r._id); }}
                    title="Delete"
                  >
                    <DeleteOutlinedIcon />
                  </button>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded === r._id && r.status === 'completed' && (
                <div className={styles.detail}>
                  <p className={styles.summary}>{r.summary}</p>
                  <div className={styles.detailGrid}>
                    <ChipSection label="✅ Matched Skills" items={r.extractedSkills} colorClass={styles.green} />
                    <ChipSection label="❌ Missing Skills" items={r.missingSkills} colorClass={styles.red} />
                    <ChipSection label="💼 Job Suggestions" items={r.jobSuggestions} colorClass={styles.blue} />
                  </div>
                </div>
              )}
              {expanded === r._id && r.status === 'failed' && (
                <div className={styles.detail}>
                  <p className={styles.errMsg}>❌ {r.errorMessage || 'Analysis failed.'}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ChipSection = ({ label, items, colorClass }) => (
  <div>
    <div className={styles.detailLabel}>{label}</div>
    <div className={styles.chips}>
      {items?.length > 0
        ? items.map((item, i) => <span key={i} className={[styles.chip, colorClass].join(' ')}>{item}</span>)
        : <span className={styles.none}>None</span>}
    </div>
  </div>
);

export default History;
