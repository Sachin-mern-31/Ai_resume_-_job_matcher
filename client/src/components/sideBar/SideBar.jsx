import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styled from 'styled-components';

const SideBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <StyledWrapper>
      <div className="sidebar_container">
        {/* Brand Header */}
        <div className="brand_header" onClick={() => navigate('/')}>
          <div className="brand_icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#2dc08d" opacity="0.2"/>
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#2dc08d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="brand_title">
            Resume<span>Checker</span>
          </div>
        </div>

        {/* User Card Info */}
        {user && (
          <div className="user_badge">
            <div className="user_avatar">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user_info">
              <div className="user_name">{user.name}</div>
              <div className="user_role">{user.role}</div>
            </div>
          </div>
        )}

        {/* Menu Navigation */}
        <ul className="nav_list">
          {/* Dashboard */}
          <li className="nav_item">
            <Link
              to="/dashboard"
              className={`nav_button ${isActive('/dashboard') ? 'active' : ''}`}
            >
              <svg
                stroke="currentColor"
                className="icon size-6"
                id="dashboard-alt"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M14,10V22H4a2,2,0,0,1-2-2V10Z" />
                <path d="M22,10V20a2,2,0,0,1-2,2H16V10Z" />
                <path d="M22,4V8H2V4A2,2,0,0,1,4,2H20A2,2,0,0,1,22,4Z" />
              </svg>
              <span>Dashboard</span>
            </Link>
          </li>

          {/* History */}
          <li className="nav_item">
            <Link
              to="/history"
              className={`nav_button ${isActive('/history') ? 'active' : ''}`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                className="icon size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>History</span>
            </Link>
          </li>

          {/* Admin (Only if Admin) */}
          {user?.role === 'admin' && (
            <li className="nav_item">
              <Link
                to="/admin"
                className={`nav_button ${isActive('/admin') ? 'active' : ''}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="icon size-6"
                >
                  <g id="SVGRepo_iconCarrier">
                    <path
                      fill="currentColor"
                      d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z"
                      clipRule="evenodd"
                      fillRule="evenodd"
                    />
                  </g>
                </svg>
                <span>Admin</span>
              </Link>
            </li>
          )}

          {/* Logout */}
          <li className="nav_item logout_item">
            <button
              id="sidebar-logout"
              onClick={handleLogout}
              className="nav_button logout_button"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                className="icon size-6"
              >
                <g id="SVGRepo_iconCarrier">
                  <path
                    fill="currentColor"
                    d="M17.2929 14.2929C16.9024 14.6834 16.9024 15.3166 17.2929 15.7071C17.6834 16.0976 18.3166 16.0976 18.7071 15.7071L21.6201 12.7941C21.6351 12.7791 21.6497 12.7637 21.6637 12.748C21.87 12.5648 22 12.2976 22 12C22 11.7024 21.87 11.4352 21.6637 11.252C21.6497 11.2363 21.6351 11.2209 21.6201 11.2059L18.7071 8.29289C18.3166 7.90237 17.6834 7.90237 17.2929 8.29289C16.9024 8.68342 16.9024 9.31658 17.2929 9.70711L18.5858 11H13C12.4477 11 12 11.4477 12 12C12 12.5523 12.4477 13 13 13H18.5858L17.2929 14.2929Z"
                  />
                  <path
                    fill="currentColor"
                    d="M5 2C3.34315 2 2 3.34315 2 5V19C2 20.6569 3.34315 22 5 22H14.5C15.8807 22 17 20.8807 17 19.5V16.7326C16.8519 16.647 16.7125 16.5409 16.5858 16.4142C15.9314 15.7598 15.8253 14.7649 16.2674 14H13C11.8954 14 11 13.1046 11 12C11 10.8954 11.8954 10 13 10H16.2674C15.8253 9.23514 15.9314 8.24015 16.5858 7.58579C16.7125 7.4591 16.8519 7.35296 17 7.26738V4.5C17 3.11929 15.8807 2 14.5 2H5Z"
                  />
                </g>
              </svg>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  position: sticky;
  top: 0;
  height: 100vh;

  .sidebar_container {
    width: 260px;
    height: 100vh;
    box-sizing: border-box;
    background-color: #ffffff;
    padding: 24px 18px;
    box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 20px;
    border-right: 1px solid #e2e8f0;
    font-family: 'Inter', sans-serif;
  }

  .brand_header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 8px 16px;
    border-bottom: 1px solid #f1f5f9;
    cursor: pointer;
  }

  .brand_icon {
    width: 40px;
    height: 40px;
    background: #e6f7f2;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #b3ebd7;
  }

  .brand_title {
    font-size: 1.2rem;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
  }

  .brand_title span {
    color: #2dc08d;
  }

  .user_badge {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
  }

  .user_avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #2dc08d;
    color: #ffffff;
    font-weight: 700;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .user_info {
    overflow: hidden;
  }

  .user_name {
    font-size: 0.875rem;
    font-weight: 700;
    color: #0f172a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .user_role {
    font-size: 0.725rem;
    color: #2dc08d;
    text-transform: capitalize;
    font-weight: 600;
  }

  .nav_list {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 6px;
    list-style: none;
    padding: 0;
    margin: 0;
    flex: 1;
  }

  .nav_item {
    width: 100%;
    cursor: pointer;
    white-space: nowrap;
  }

  .logout_item {
    margin-top: auto;
  }

  .nav_button {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 11px 16px;
    font-size: 0.925rem;
    font-weight: 600;
    color: #475569;
    text-decoration: none;
    border: none;
    background: transparent;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-sizing: border-box;
  }

  .nav_button .icon {
    width: 22px;
    height: 22px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }

  .nav_button:hover {
    background-color: #f1f5f9;
    color: #0f172a;
  }

  .nav_button.active {
    background: #2dc08d;
    color: #ffffff;
    box-shadow: 0 4px 12px rgba(45, 192, 141, 0.3);
  }

  .nav_button.active .icon {
    fill: #ffffff;
    stroke: #ffffff;
  }

  .logout_button:hover {
    background-color: #fef2f2;
    color: #dc2626;
  }
`;

export default SideBar;