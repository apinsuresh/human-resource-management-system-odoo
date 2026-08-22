import { useState, useEffect } from 'react';
import { 
  initializeMockDB, 
  mockGetCurrentUser, 
  mockAuthLogout, 
  type UserRole 
} from './mockApi';

// Component Imports
import Toast, { showToast } from './components/Toast';

// View Imports
import Login from './views/Login';
import Profile from './views/Profile';
import Directory from './views/Directory';
import AttendanceView from './views/AttendanceView';
import TimeOffView from './views/TimeOffView';
import PayrollView from './views/PayrollView';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Initialize DB and Session
  useEffect(() => {
    initializeMockDB();
    const activeSession = mockGetCurrentUser();
    if (activeSession) {
      setSession(activeSession);
    }

    // Load theme
    const savedTheme = localStorage.getItem('hrms_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const handleLoginSuccess = (userSession: any) => {
    setSession(userSession);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    mockAuthLogout();
    setSession(null);
    setProfileDropdownOpen(false);
    setMobileSidebarOpen(false);
    showToast('Logged out successfully.', 'info');
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('hrms_theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Render active view-only content
  const renderActiveView = () => {
    if (!session) return null;
    
    switch (currentView) {
      case 'dashboard':
        return (
          <AttendanceView 
            employeeId={session.user.id} 
            userRole={session.role as UserRole} 
          />
        );
      case 'directory':
        return <Directory userRole={session.role} />;
      case 'profile':
        return (
          <Profile 
            userId={session.user.id} 
            userRole={session.role} 
          />
        );
      case 'timeoff':
        return (
          <TimeOffView 
            employeeId={session.user.id} 
            userRole={session.role} 
          />
        );
      case 'payroll':
        return <PayrollView userRole={session.role} />;
      case 'reports':
        return (
          <div className="card glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📈</span>
            <h3>Reports & Analytics Console</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Coming soon! Comprehensive employee activity and payroll logs will be viewable here.</p>
          </div>
        );
      case 'settings':
        return (
          <div className="card glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>⚙️</span>
            <h3>Settings & Configurations</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Coming soon! Configure system parameters, notifications rules, and profile visibility settings.</p>
          </div>
        );
      default:
        return <div>View not found.</div>;
    }
  };

  if (!session) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <Toast />
      </>
    );
  }

  const userDisplayName = `${session.user.firstName} ${session.user.lastName}`;

  return (
    <div className="app-layout-sidebar">
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className={`sidebar-glass ${mobileSidebarOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand-section">
          <div className="brand-chevron-mark">▲</div>
          <span className="brand-title-text">FORTHEYE</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <ul className="sidebar-nav-list">
            <li className={`sidebar-nav-item ${currentView === 'dashboard' ? 'active' : ''}`}>
              <button 
                type="button" 
                onClick={() => {
                  setCurrentView('dashboard');
                  setMobileSidebarOpen(false);
                  setProfileDropdownOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                Dashboard
              </button>
            </li>
            <li className={`sidebar-nav-item ${currentView === 'directory' ? 'active' : ''}`}>
              <button 
                type="button" 
                onClick={() => {
                  setCurrentView('directory');
                  setMobileSidebarOpen(false);
                  setProfileDropdownOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Attendance
              </button>
            </li>
            <li className={`sidebar-nav-item ${currentView === 'timeoff' ? 'active' : ''}`}>
              <button 
                type="button" 
                onClick={() => {
                  setCurrentView('timeoff');
                  setMobileSidebarOpen(false);
                  setProfileDropdownOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                Leaves
              </button>
            </li>
            <li className={`sidebar-nav-item ${currentView === 'profile' ? 'active' : ''}`}>
              <button 
                type="button" 
                onClick={() => {
                  setCurrentView('profile');
                  setMobileSidebarOpen(false);
                  setProfileDropdownOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                Account
              </button>
            </li>
            {session.role === 'ADMIN' && (
              <li className={`sidebar-nav-item ${currentView === 'payroll' ? 'active' : ''}`}>
                <button 
                  type="button" 
                  onClick={() => {
                    setCurrentView('payroll');
                    setMobileSidebarOpen(false);
                    setProfileDropdownOpen(false);
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  Payroll
                </button>
              </li>
            )}
            <li className={`sidebar-nav-item ${currentView === 'reports' ? 'active' : ''}`}>
              <button 
                type="button" 
                onClick={() => {
                  setCurrentView('reports');
                  setMobileSidebarOpen(false);
                  setProfileDropdownOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                Reports
              </button>
            </li>
            <li className={`sidebar-nav-item ${currentView === 'settings' ? 'active' : ''}`}>
              <button 
                type="button" 
                onClick={() => {
                  setCurrentView('settings');
                  setMobileSidebarOpen(false);
                  setProfileDropdownOpen(false);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }} aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
              </button>
            </li>
          </ul>
        </nav>

        {/* Sidebar Footer details */}
        <div className="sidebar-footer">
          <div className="sidebar-stats-pill" onClick={() => showToast('300 CC points available in your balance.', 'info')}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }} aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v3.5c0 1.66-1.34 3-3 3H9a3 3 0 0 1-3-3V8a6 6 0 0 1 6-6z"></path></svg>
              <span>Available Balance</span>
            </div>
            <span className="sidebar-stats-val">300 CC</span>
          </div>

          <button 
            type="button" 
            className="sidebar-profile-card"
            onClick={() => {
              setCurrentView('profile');
              setMobileSidebarOpen(false);
            }}
          >
            <div className="sidebar-profile-info">
              <div className="avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                {session.user.firstName.substring(0, 2).toUpperCase()}
              </div>
              <div className="sidebar-profile-text">
                <strong>{userDisplayName}</strong>
                <span>{session.role === 'ADMIN' ? 'Admin' : session.role === 'HR' ? 'HR Officer' : 'Employee'}</span>
              </div>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>▼</span>
          </button>
        </div>
      </aside>

      {/* 2. RIGHT LAYOUT CONTENT AREA */}
      <div className="main-layout-right">
        {/* Horizontal Top Header */}
        <header className="header-glass-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile hamburger menu toggle */}
            <button 
              type="button" 
              style={{ display: 'none', fontStyle: 'normal' }}
              className="mobile-toggle-btn header-action-btn"
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              aria-label="Toggle Navigation Drawer"
            >
              ☰
            </button>
            
            {/* Top Quick links */}
            <nav className="header-quick-nav" style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                type="button" 
                className={`header-nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                Home
              </button>
              <button 
                type="button" 
                className={`header-nav-btn ${currentView === 'directory' ? 'active' : ''}`}
                onClick={() => setCurrentView('directory')}
              >
                Attendance
              </button>
              <button 
                type="button" 
                className={`header-nav-btn ${currentView === 'timeoff' ? 'active' : ''}`}
                onClick={() => setCurrentView('timeoff')}
              >
                Leaves
              </button>
            </nav>
          </div>

          <div className="header-action-row">
            {/* Search Box */}
            <div className="header-search-bar">
              <span className="search-icon-glass">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input type="search" placeholder="Search for items, people..." className="form-control" />
              <kbd className="search-kbd-hint">⌘K</kbd>
            </div>

            {/* Light/Dark Toggle */}
            <button 
              type="button" 
              className="header-action-btn" 
              onClick={handleToggleTheme}
              title="Toggle theme"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            </button>

            {/* Notification triggers */}
            <button 
              type="button" 
              className="header-action-btn"
              title="Notifications"
              onClick={() => showToast('Leaves approved, no warnings today!', 'success')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
              <span className="header-badge-notify">2</span>
            </button>

            {/* User Dropdown Profile trigger */}
            <div className="user-dropdown-wrapper" style={{ position: 'relative' }}>
              <button 
                type="button" 
                className="header-avatar-btn"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              >
                <div className="header-avatar-circle">
                  {session.user.firstName.substring(0, 2).toUpperCase()}
                  <span className="header-avatar-status"></span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '2px' }}>▼</span>
              </button>

              {profileDropdownOpen && (
                <div className="profile-dropdown-menu">
                  <div className="dropdown-user-details">
                    <strong>{userDisplayName}</strong>
                    <span>{session.user.loginId}</span>
                  </div>
                  <button 
                    type="button" 
                    className="dropdown-item" 
                    onClick={() => {
                      setCurrentView('profile');
                      setProfileDropdownOpen(false);
                    }}
                  >
                    👤 My Profile
                  </button>
                  <button 
                    type="button" 
                    className="dropdown-item logout-btn" 
                    onClick={handleLogout}
                  >
                    ➔ Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Page content scrollport */}
        <main className="page-container" id="hrms-main-content-layout">
          {renderActiveView()}
        </main>
      </div>

      <Toast />
    </div>
  );
}
