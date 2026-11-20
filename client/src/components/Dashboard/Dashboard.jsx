import React, { useState, useRef } from 'react';
import styles from './Dashboard.module.css';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import StarIcon from '@mui/icons-material/Star';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const Dashboard = () => {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [file, setFile]             = useState(null);
  const [jobDesc, setJobDesc]       = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [result, setResult]         = useState(null);

  // ─── File handling ──────────────────────────────────────────────────────────
  const handleFile = (f) => {
    if (f && f.type === 'application/pdf') {
      setFile(f);
      setError('');
    } else {
      setError('Only PDF files are accepted.');
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f);
  };

  // ─── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file)              return setError('Please upload a PDF resume.');
    if (jobDesc.trim().length < 20) return setError('Job description must be at least 20 characters.');

    setError('');
    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDesc.trim());

    try {
      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setJobDesc('');
    setResult(null);
    setError('');
  };

  // ─── Score formatting ───────────────────────────────────────────────────────
  const scoreColor = (s) => {
    if (s >= 75) return '#2dc08d';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const scoreBadgeText = (s) => {
    if (s >= 80) return 'Excellent ATS Match';
    if (s >= 60) return 'Good Match · Minor Fixes Needed';
    return 'Needs Optimization';
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <p className={styles.greeting}>Welcome back, {user?.name?.split(' ')[0]} 👋</p>
          <h1 className={styles.pageTitle}>ATS Resume Checker &amp; AI Grader</h1>
        </div>
      </div>

      {!result ? (
        /* ── Upload Form (Enhancv Style) ── */
        <div className={styles.formGrid}>
          {/* Left: Upload zone */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>📄 Upload Your Resume</h2>
            <p className={styles.cardSubtitle}>Upload PDF resume for 27-point ATS check</p>

            <div
              id="drop-zone"
              className={[styles.dropZone, isDragging ? styles.dragging : '', file ? styles.hasFile : ''].filter(Boolean).join(' ')}
              onClick={() => fileInputRef.current.click()}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
            >
              <input
                ref={fileInputRef}
                id="resume-file-input"
                type="file"
                accept=".pdf"
                className={styles.hiddenInput}
                onChange={(e) => handleFile(e.target.files[0])}
              />
              {file ? (
                <div className={styles.fileChosen}>
                  <InsertDriveFileIcon sx={{ fontSize: 48, color: '#2dc08d' }} />
                  <div className={styles.fileName}>{file.name}</div>
                  <div className={styles.fileSize}>{(file.size / 1024).toFixed(0)} KB</div>
                  <CheckCircleIcon sx={{ color: '#2dc08d', fontSize: 28, marginTop: 1 }} />
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <CloudUploadIcon sx={{ fontSize: 56, color: '#2dc08d', opacity: 0.8 }} />
                  <p className={styles.dropText}>Drag &amp; drop your PDF here</p>
                  <p className={styles.dropOr}>or click to browse from device</p>
                </div>
              )}
            </div>
          </div>

          {/* Right: JD + submit */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>💼 Target Job Description</h2>
            <p className={styles.cardSubtitle}>Paste the job listing to check keyword matching</p>

            <textarea
              id="job-description-input"
              className={styles.textarea}
              placeholder="Paste the full job description here…&#10;&#10;e.g. Seeking a Frontend Engineer with React, TypeScript, and modern web experience..."
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              rows={12}
            />

            <div className={styles.charCount}>
              {jobDesc.length} characters {jobDesc.length < 20 && '(min 20)'}
            </div>
          </div>

          {/* Instructions banner */}
          <div className={styles.instructionBanner}>
            <AutoAwesomeIcon sx={{ fontSize: 20, color: '#2dc08d' }} />
            <span>Our AI engine parses skills, formatting, action verbs, and ATS keywords to maximize your callback rate.</span>
          </div>

          {error && <div className={styles.errorMsg}>{error}</div>}

          <button
            id="analyze-submit"
            className={styles.analyzeBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <><span className={styles.btnSpinner} /> Running ATS Check &amp; AI Analysis…</>
            ) : '🚀 Check My Resume'}
          </button>
        </div>
      ) : (
        /* ── Enhancv-Style Report Results Panel ── */
        <div className={styles.results}>
          {/* Score hero */}
          <div className={styles.scoreCard}>
            <div className={styles.scoreRing} style={{ '--score-color': scoreColor(result.matchScore) }}>
              <svg viewBox="0 0 120 120" className={styles.scoreSvg}>
                <circle cx="60" cy="60" r="52" className={styles.scoreTrack} />
                <circle
                  cx="60" cy="60" r="52"
                  className={styles.scoreProgress}
                  style={{
                    stroke: scoreColor(result.matchScore),
                    strokeDashoffset: 327 - (327 * result.matchScore) / 100,
                  }}
                />
              </svg>
              <div className={styles.scoreInner}>
                <div className={styles.scoreNumber} style={{ color: scoreColor(result.matchScore) }}>
                  {result.matchScore}
                </div>
                <div className={styles.scoreLabel}>/ 100</div>
              </div>
            </div>
            <div className={styles.scoreInfo}>
              <div className={styles.scoreBadge} style={{ background: `${scoreColor(result.matchScore)}15`, color: scoreColor(result.matchScore), border: `1px solid ${scoreColor(result.matchScore)}40` }}>
                {scoreBadgeText(result.matchScore)}
              </div>
              <h2 className={styles.scoreTitle}>ATS Match &amp; Grader Summary</h2>
              <p className={styles.scoreSummary}>{result.summary}</p>
              <button id="analyze-again" className={styles.againBtn} onClick={resetForm}>
                🔄 Check Another Resume
              </button>
            </div>
          </div>

          {/* Results grid */}
          <div className={styles.resultsGrid}>
            <SkillBlock title="Matched Keywords &amp; Skills" items={result.extractedSkills} chipClass={styles.chipGreen} icon={<CheckCircleIcon sx={{ fontSize: 18, color: '#10b981' }} />} />
            <SkillBlock title="Missing Required Skills" items={result.missingSkills} chipClass={styles.chipRed} icon={<WarningAmberIcon sx={{ fontSize: 18, color: '#ef4444' }} />} />
            <SkillBlock title="Key Strengths" items={result.strengths} chipClass={styles.chipBlue} icon={<StarIcon sx={{ fontSize: 18, color: '#3b82f6' }} />} isList />
            <SkillBlock title="AI Fix Recommendations" items={result.improvements} chipClass={styles.chipOrange} icon={<AutoAwesomeIcon sx={{ fontSize: 18, color: '#f59e0b' }} />} isList />
          </div>

          {/* Job suggestions */}
          {result.jobSuggestions?.length > 0 && (
            <div className={styles.suggestCard}>
              <h3 className={styles.suggestTitle}>💼 Recommended Job Titles matching your profile</h3>
              <div className={styles.suggestGrid}>
                {result.jobSuggestions.map((job, i) => (
                  <div key={i} className={styles.jobChip}>{job}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Sub-component: Skill/Strength block ──────────────────────────────────────
const SkillBlock = ({ title, items, chipClass, icon, isList }) => (
  <div className={styles.skillCard}>
    <div className={styles.cardHeaderFlex}>
      {icon}
      <h3 className={styles.skillCardTitle}>{title}</h3>
    </div>
    {!items || items.length === 0 ? (
      <p className={styles.emptyMsg}>None identified</p>
    ) : isList ? (
      <ul className={styles.skillList}>
        {items.map((item, i) => <li key={i}>{item}</li>)}
      </ul>
    ) : (
      <div className={styles.chips}>
        {items.map((item, i) => <span key={i} className={[styles.chip, chipClass].join(' ')}>{item}</span>)}
      </div>
    )}
  </div>
);

export default Dashboard;