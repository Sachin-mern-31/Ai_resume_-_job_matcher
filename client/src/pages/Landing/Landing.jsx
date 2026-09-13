import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import WorkIcon from '@mui/icons-material/Work';
import SecurityIcon from '@mui/icons-material/Security';
import StarIcon from '@mui/icons-material/Star';
import DescriptionIcon from '@mui/icons-material/Description';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from '../../context/AuthContext';

const Landing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <StyledWrapper>
      {/* ── Navbar ── */}
      <header className="navbar">
        <div className="nav_container">
          <div className="brand" onClick={() => navigate('/')}>
            <div className="logo_box">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#2dc08d" opacity="0.2"/>
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#2dc08d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="brand_name">Resume<span>Checker</span></span>
          </div>

          <nav className="nav_links">
            <a href="#checker">ATS Checker</a>
            <a href="#features">27 Checks</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#reviews">Reviews</a>
          </nav>

          <div className="nav_actions">
            {user ? (
              <Link to="/dashboard" className="btn_primary">
                Go to Dashboard <ArrowForwardIcon sx={{ fontSize: 18 }} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn_secondary">Sign In</Link>
                <Link to="/register" className="btn_primary">
                  Check Resume Free <ArrowForwardIcon sx={{ fontSize: 18 }} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Hero Section (Enhancv Style) ── */}
      <section className="hero" id="checker">
        <div className="hero_container">
          <div className="eyebrow_badge">
            <span className="dot"></span>
            <span>FREE ATS RESUME CHECKER &amp; AI GRADER</span>
          </div>

          <h1 className="hero_title">
            Is your resume <br />
            <span>good enough?</span>
          </h1>

          <p className="hero_subtitle">
            A free and fast AI resume checker doing 27 crucial checks to ensure your resume’s
            content, layout, and ATS compatibility gets you interview callbacks.
          </p>

          <div className="rating_bar">
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <StarIcon key={i} sx={{ color: '#f59e0b', fontSize: 18 }} />
              ))}
            </div>
            <span className="rating_text"><strong>4.8/5</strong> score based on 2,000,000+ analyzed resumes</span>
          </div>

          <div className="hero_ctas">
            <Link to="/register" className="cta_main">
              <DescriptionIcon sx={{ fontSize: 20 }} />
              <span>Analyze My Resume Now</span>
            </Link>
            <Link to="/login" className="cta_sub">
              <span>Sign In</span>
            </Link>
          </div>

          {/* Enhancv Sample Live Score Report Preview */}
          <div className="score_card_preview">
            <div className="report_header">
              <div className="report_meta">
                <span className="file_name">📄 Senior_Software_Engineer.pdf</span>
                <span className="status_pill green">ATS Parsed Successfully</span>
              </div>
              <div className="score_circle">
                <span className="score_val">88</span>
                <span className="score_max">/100</span>
              </div>
            </div>

            <div className="checks_summary">
              <div className="summary_chip pass">
                <CheckCircleIcon sx={{ fontSize: 16, color: '#10b981' }} />
                <span>24 / 27 Checks Passed</span>
              </div>
              <div className="summary_chip warn">
                <AutoAwesomeIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                <span>3 Critical Improvements Needed</span>
              </div>
            </div>

            <div className="preview_items">
              <div className="preview_item">
                <span className="item_tag pass">Matched</span>
                <span className="item_text">Technical Skills: React, Node.js, TypeScript, Docker</span>
              </div>
              <div className="preview_item warn">
                <span className="item_tag fix">Action Needed</span>
                <span className="item_text">Missing key industry term: &quot;Cloud Architecture&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 27 Crucial Checks Showcase ── */}
      <section className="checks_section" id="features">
        <div className="section_container">
          <div className="section_header">
            <h2>Our 27 Crucial Resume Checks</h2>
            <p>Our AI model checks every section of your resume to make sure recruiters and ATS software love it.</p>
          </div>

          <div className="checks_grid">
            <div className="check_card">
              <div className="icon_circle emerald">
                <AnalyticsIcon sx={{ fontSize: 26 }} />
              </div>
              <h3>ATS Compatibility</h3>
              <p>Verifies section headings, font readability, file format, and text extractability.</p>
            </div>

            <div className="check_card">
              <div className="icon_circle blue">
                <SpellcheckIcon sx={{ fontSize: 26 }} />
              </div>
              <h3>Repetition &amp; Grammar</h3>
              <p>Identifies repetitive buzzwords, weak verbs, typos, and passive phrasing.</p>
            </div>

            <div className="check_card">
              <div className="icon_circle purple">
                <WorkIcon sx={{ fontSize: 26 }} />
              </div>
              <h3>Hard &amp; Soft Skill Match</h3>
              <p>Compares your listed skills directly against the target job description requirements.</p>
            </div>

            <div className="check_card">
              <div className="icon_circle amber">
                <VerifiedUserIcon sx={{ fontSize: 26 }} />
              </div>
              <h3>Contact Info &amp; Format</h3>
              <p>Ensures LinkedIn link, email, phone number, and location formatting match standards.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="how_it_works" id="how-it-works">
        <div className="section_container">
          <div className="section_header">
            <h2>How The Resume Checker Works</h2>
            <p>Get a complete ATS review report in less than 60 seconds.</p>
          </div>

          <div className="steps_row">
            <div className="step_box">
              <div className="step_num">1</div>
              <h3>Upload PDF Resume</h3>
              <p>Drag and drop your PDF resume for instant parsing.</p>
            </div>
            <div className="step_arrow">➔</div>
            <div className="step_box">
              <div className="step_num">2</div>
              <h3>Add Job Description</h3>
              <p>Paste the job posting to analyze keyword match.</p>
            </div>
            <div className="step_arrow">➔</div>
            <div className="step_box">
              <div className="step_num">3</div>
              <h3>Get AI Score &amp; Fixes</h3>
              <p>View your 0-100 score, skill gaps, and AI fix suggestions.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer">
        <div className="footer_container">
          <h2>Ready to test your resume?</h2>
          <p>Join over 2,000,000 job seekers who used our ATS checker to land interviews.</p>
          <Link to="/register" className="btn_primary large">
            Run Free ATS Check Now
          </Link>
          <div className="footer_copy">
            &copy; {new Date().getFullYear()} ResumeMatch Checker. Inspired by modern ATS standards.
          </div>
        </div>
      </footer>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #0f172a;
  background-color: #f8fafc;
  min-height: 100vh;
  overflow-x: hidden;

  /* ── Navbar ── */
  .navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #e2e8f0;
  }

  .nav_container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .logo_box {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .brand_name {
    font-size: 1.3rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
  }

  .brand_name span {
    color: #2dc08d;
  }

  .nav_links {
    display: flex;
    gap: 28px;
  }

  .nav_links a {
    color: #475569;
    text-decoration: none;
    font-size: 0.925rem;
    font-weight: 600;
    transition: color 0.2s;
  }

  .nav_links a:hover {
    color: #2dc08d;
  }

  .nav_actions {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .btn_primary {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 22px;
    background: #2dc08d;
    color: #ffffff;
    font-weight: 700;
    font-size: 0.9rem;
    border-radius: 8px;
    text-decoration: none;
    transition: all 0.2s ease;
    box-shadow: 0 4px 12px rgba(45, 192, 141, 0.3);
  }

  .btn_primary:hover {
    background: #26a97b;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(45, 192, 141, 0.4);
  }

  .btn_primary.large {
    padding: 14px 32px;
    font-size: 1rem;
    margin-top: 16px;
    border-radius: 10px;
  }

  .btn_secondary {
    padding: 10px 18px;
    color: #334155;
    font-weight: 600;
    font-size: 0.9rem;
    text-decoration: none;
    transition: color 0.2s;
  }

  .btn_secondary:hover {
    color: #2dc08d;
  }

  /* ── Hero (Enhancv Style) ── */
  .hero {
    padding: 70px 24px 60px;
    text-align: center;
    background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%);
  }

  .hero_container {
    max-width: 820px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .eyebrow_badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 14px;
    background: #e6f7f2;
    border: 1px solid #b3ebd7;
    border-radius: 9999px;
    font-size: 0.78rem;
    font-weight: 700;
    color: #178a63;
    letter-spacing: 0.5px;
    margin-bottom: 20px;
  }

  .dot {
    width: 6px;
    height: 6px;
    background-color: #2dc08d;
    border-radius: 50%;
  }

  .hero_title {
    font-size: 3.4rem;
    font-weight: 900;
    line-height: 1.12;
    letter-spacing: -1.2px;
    color: #0f172a;
    margin: 0 0 20px;
  }

  .hero_title span {
    color: #2dc08d;
  }

  .hero_subtitle {
    font-size: 1.15rem;
    color: #475569;
    line-height: 1.6;
    max-width: 680px;
    margin: 0 0 24px;
  }

  .rating_bar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 32px;
  }

  .stars {
    display: flex;
    gap: 2px;
  }

  .rating_text {
    font-size: 0.88rem;
    color: #64748b;
  }

  .hero_ctas {
    display: flex;
    gap: 14px;
    align-items: center;
    justify-content: center;
    margin-bottom: 48px;
  }

  .cta_main {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 14px 30px;
    background: #2dc08d;
    color: #ffffff;
    font-weight: 700;
    font-size: 1rem;
    border-radius: 10px;
    text-decoration: none;
    box-shadow: 0 8px 24px rgba(45, 192, 141, 0.35);
    transition: all 0.2s ease;
  }

  .cta_main:hover {
    background: #26a97b;
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(45, 192, 141, 0.45);
  }

  .cta_sub {
    padding: 14px 24px;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    color: #334155;
    font-weight: 600;
    font-size: 1rem;
    border-radius: 10px;
    text-decoration: none;
    transition: all 0.2s ease;
  }

  .cta_sub:hover {
    border-color: #94a3b8;
    background: #f8fafc;
  }

  /* Enhancv Score Preview Card */
  .score_card_preview {
    width: 100%;
    max-width: 620px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 24px 28px;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08);
    text-align: left;
  }

  .report_header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #f1f5f9;
  }

  .report_meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .file_name {
    font-weight: 700;
    font-size: 0.95rem;
    color: #0f172a;
  }

  .status_pill.green {
    font-size: 0.78rem;
    color: #10b981;
    font-weight: 600;
  }

  .score_circle {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: #e6f7f2;
    border: 3px solid #2dc08d;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .score_val {
    font-size: 1.2rem;
    font-weight: 900;
    color: #0f172a;
  }

  .score_max {
    font-size: 0.7rem;
    color: #64748b;
  }

  .checks_summary {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;
  }

  .summary_chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 8px;
    font-size: 0.825rem;
    font-weight: 600;
  }

  .summary_chip.pass { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
  .summary_chip.warn { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

  .preview_items {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .preview_item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #f8fafc;
    border-radius: 8px;
    font-size: 0.85rem;
  }

  .item_tag.pass {
    background: #dcfce7;
    color: #15803d;
    font-weight: 700;
    font-size: 0.725rem;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .item_tag.fix {
    background: #fee2e2;
    color: #b91c1c;
    font-weight: 700;
    font-size: 0.725rem;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .item_text {
    color: #334155;
    font-weight: 500;
  }

  /* ── 27 Checks Section ── */
  .checks_section, .how_it_works {
    padding: 80px 24px;
  }

  .section_container {
    max-width: 1100px;
    margin: 0 auto;
  }

  .section_header {
    text-align: center;
    margin-bottom: 56px;
  }

  .section_header h2 {
    font-size: 2.2rem;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 12px;
  }

  .section_header p {
    font-size: 1.05rem;
    color: #64748b;
    margin: 0;
  }

  .checks_grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
  }

  .check_card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 28px 24px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.03);
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .check_card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  }

  .icon_circle {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 16px;
  }

  .icon_circle.emerald { background: #e6f7f2; color: #2dc08d; }
  .icon_circle.blue { background: #eff6ff; color: #3b82f6; }
  .icon_circle.purple { background: #faf5ff; color: #a855f7; }
  .icon_circle.amber { background: #fffbeb; color: #f59e0b; }

  .check_card h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px;
  }

  .check_card p {
    font-size: 0.9rem;
    color: #64748b;
    line-height: 1.5;
    margin: 0;
  }

  /* How It Works Steps */
  .steps_row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    flex-wrap: wrap;
  }

  .step_box {
    flex: 1;
    min-width: 220px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 28px 24px;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
  }

  .step_num {
    width: 40px;
    height: 40px;
    background: #e6f7f2;
    color: #2dc08d;
    font-weight: 900;
    font-size: 1.2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  .step_box h3 {
    font-size: 1.1rem;
    font-weight: 700;
    margin: 0 0 8px;
    color: #0f172a;
  }

  .step_box p {
    font-size: 0.88rem;
    color: #64748b;
    margin: 0;
    line-height: 1.45;
  }

  .step_arrow {
    font-size: 1.4rem;
    color: #94a3b8;
  }

  /* Footer */
  .footer {
    background: #0f172a;
    color: #ffffff;
    padding: 70px 24px 40px;
    text-align: center;
  }

  .footer_container {
    max-width: 600px;
    margin: 0 auto;
  }

  .footer h2 {
    font-size: 2.1rem;
    font-weight: 800;
    margin: 0 0 12px;
  }

  .footer p {
    font-size: 1.05rem;
    color: #94a3b8;
    margin: 0 0 24px;
  }

  .footer_copy {
    margin-top: 50px;
    font-size: 0.825rem;
    color: #64748b;
  }

  @media (max-width: 768px) {
    .hero_title { font-size: 2.3rem; }
    .nav_links { display: none; }
    .step_arrow { display: none; }
  }
`;

export default Landing;
