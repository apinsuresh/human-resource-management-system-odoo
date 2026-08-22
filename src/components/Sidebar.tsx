import { useState } from 'react';
import { type UserRole } from '../mockApi';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: UserRole;
  userName: string;
  loginId: string;
  onLogout: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Sidebar({
  currentView,
  onViewChange,
  userRole,
  userName,
  loginId,
  onLogout,
  theme,
  onToggleTheme
}: SidebarProps) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Log', icon: '📊', roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'directory', label: 'Employee Directory', icon: '👥', roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'profile', label: 'My Profile', icon: '👤', roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'timeoff', label: 'Time Off / Leaves', icon: '✈️', roles: ['ADMIN', 'HR_OFFICER', 'EMPLOYEE'] },
    { id: 'payroll', label: 'Salary & Payroll', icon: '💰', roles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleNavClick = (viewId: string) => {
    onViewChange(viewId);
    setMobileMenuOpen(false);
  };

  const getRoleLabel = (role: UserRole) => {
    if (role === 'ADMIN') return 'Administrator';
    if (role === 'HR_OFFICER') return 'HR Officer';
    return 'Employee';
  };

  return (
    <>
      {/* Mobile Header Menu Button */}
      <button 
        type="button" 
        className="mobile-toggle-btn"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label="Toggle Navigation Drawer"
        aria-expanded={mobileMenuOpen}
      >
        ☰
      </button>

      {/* Sidebar Drawer */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-logo">
          <h2>HRMS Console</h2>
          <span className="logo-dot"></span>
        </div>

        {/* User Quick Info */}
        <div className="sidebar-user-section">
          <button 
            type="button" 
            className="sidebar-avatar-trigger"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            aria-expanded={profileDropdownOpen}
            aria-haspopup="true"
          >
            <div className="avatar-circle">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="user-info-text">
              <span className="user-name-span">{userName} ({loginId})</span>
              <span className="user-role-span">{getRoleLabel(userRole)}</span>
            </div>
            <span className="dropdown-arrow">▼</span>
          </button>
          
          {profileDropdownOpen && (
            <div className="sidebar-profile-dropdown">
              <button 
                type="button" 
                className="dropdown-item" 
                onClick={() => {
                  handleNavClick('profile');
                  setProfileDropdownOpen(false);
                }}
              >
                👤 My Profile
              </button>
              <button 
                type="button" 
                className="dropdown-item logout-btn" 
                onClick={() => {
                  onLogout();
                  setProfileDropdownOpen(false);
                }}
              >
                ➔ Log Out
              </button>
            </div>
          )}
        </div>

        {/* Navigation Menu Links */}
        <nav className="sidebar-nav">
          <ul>
            {filteredNavItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className={`nav-link-btn ${currentView === item.id ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="sidebar-footer">
          <button 
            type="button" 
            className="theme-toggle-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </button>
          <div className="sidebar-ver">v1.0.0</div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setMobileMenuOpen(false)}
          role="presentation"
        />
      )}

      <style>{`
        .mobile-toggle-btn {
          display: none;
          position: fixed;
          top: 15px;
          left: 15px;
          z-index: 200;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          width: 40px;
          height: 40px;
          font-size: 1.25rem;
          cursor: pointer;
          color: var(--text-primary);
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-sm);
        }

        .app-sidebar {
          width: var(--sidebar-width);
          background-color: var(--bg-sidebar);
          color: var(--text-sidebar);
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          z-index: 150;
          display: flex;
          flex-direction: column;
          border-right: 1px solid rgba(255, 255, 255, 0.05);
          transition: transform var(--transition-speed);
        }

        .sidebar-logo {
          padding: 2rem 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .sidebar-logo h2 {
          color: #ffffff;
          font-size: 1.25rem;
          font-weight: 700;
          font-family: var(--font-heading);
          letter-spacing: -0.5px;
        }

        .logo-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent-primary);
        }

        .sidebar-user-section {
          padding: 1.25rem 1rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          position: relative;
        }

        .sidebar-avatar-trigger {
          width: 100%;
          background: none;
          border: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          text-align: left;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background-color var(--transition-speed);
        }

        .sidebar-avatar-trigger:hover {
          background-color: rgba(255, 255, 255, 0.05);
        }

        .avatar-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background-color: var(--accent-primary);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .user-info-text {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .user-name-span {
          color: #ffffff;
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-role-span {
          color: var(--text-muted);
          font-size: 0.75rem;
        }

        .dropdown-arrow {
          font-size: 0.6rem;
          color: var(--text-muted);
        }

        .sidebar-profile-dropdown {
          position: absolute;
          top: 100%;
          left: 1rem;
          right: 1rem;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          box-shadow: var(--shadow-lg);
          z-index: 10;
          display: flex;
          flex-direction: column;
          padding: 0.5rem 0;
          margin-top: 0.25rem;
        }

        .dropdown-item {
          background: none;
          border: none;
          padding: 0.6rem 1.25rem;
          text-align: left;
          font-family: var(--font-body);
          font-size: 0.85rem;
          color: var(--text-primary);
          cursor: pointer;
          transition: background-color var(--transition-speed);
          width: 100%;
        }

        .dropdown-item:hover {
          background-color: var(--accent-light);
          color: var(--accent-primary);
        }

        .dropdown-item.logout-btn {
          border-top: 1px solid var(--border-color);
          margin-top: 0.25rem;
          color: var(--error);
        }

        .dropdown-item.logout-btn:hover {
          background-color: var(--error-light);
          color: var(--error);
        }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0.75rem;
          overflow-y: auto;
        }

        .sidebar-nav ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
        }

        .nav-link-btn {
          width: 100%;
          background: none;
          border: none;
          font-family: var(--font-heading);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--text-sidebar);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.8rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all var(--transition-speed) ease;
          text-align: left;
        }

        .nav-link-btn:hover {
          background-color: rgba(255, 255, 255, 0.05);
          color: #ffffff;
        }

        .nav-link-btn.active {
          background-color: var(--accent-primary);
          color: #ffffff;
        }

        .sidebar-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .theme-toggle-btn {
          width: 100%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 0.6rem;
          color: #ffffff;
          font-family: var(--font-heading);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--transition-speed);
        }

        .theme-toggle-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .sidebar-ver {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-align: center;
        }

        .sidebar-backdrop {
          display: none;
          position: fixed;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 140;
          backdrop-filter: blur(4px);
        }

        @media (max-width: 768px) {
          .mobile-toggle-btn {
            display: flex;
          }

          .app-sidebar {
            transform: translateX(-100%);
            width: 260px;
          }

          .app-sidebar.mobile-open {
            transform: translateX(0);
          }

          .sidebar-backdrop {
            display: block;
          }
        }
      `}</style>
    </>
  );
}
