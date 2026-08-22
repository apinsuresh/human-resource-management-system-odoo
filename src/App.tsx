import { useState, useEffect } from 'react';
import odooLogo from './assets/image copy.png';
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
import EmployeeAttendanceView from './views/EmployeeAttendanceView';
import AdminAttendanceView from './views/AdminAttendanceView';
import TimeOffView from './views/TimeOffView';
import PayrollView from './views/PayrollView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import SalaryInfoView from './views/SalaryInfoView';
import EmployerView from './views/EmployerView';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [settingsTab, setSettingsTab] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [selectedSalaryEmpId, setSelectedSalaryEmpId] = useState<string | undefined>(undefined);

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
    if (userSession.role === 'EMPLOYEE') {
      setCurrentView('directory');
    } else {
      setCurrentView('dashboard');
    }
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

  const getSidebarLinks = () => {
    if (!session) return [];
    
    if (session.role === 'ADMIN') {
      return [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Organizations', view: 'settings', tab: 'org_mgmt' },
        { label: 'Users', view: 'settings', tab: 'user_mgmt' },
        { label: 'Employees', view: 'directory' },
        { label: 'Salary Info', view: 'salary_info' },
        { label: 'Attendance', view: 'attendance' },
        { label: 'Leave Management', view: 'timeoff' },
        { label: 'Payroll', view: 'payroll' },
        { label: 'Reports', view: 'reports' },
        { label: 'Settings', view: 'settings', tab: 'overview' }
      ];
    }
    
    if (session.role === 'EMPLOYER') {
      return [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Workforce', view: 'directory' },
        { label: 'Attendance', view: 'attendance' },
        { label: 'Time Off', view: 'timeoff' },
        { label: 'Payroll', view: 'payroll' },
        { label: 'Reports & Analytics', view: 'reports' },
        { label: 'Employer Settings', view: 'settings', tab: 'employer' }
      ];
    }
    
    if (session.role === 'HR_OFFICER') {
      return [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'Employees', view: 'directory' },
        { label: 'Attendance', view: 'attendance' },
        { label: 'Time Off', view: 'timeoff' },
        { label: 'Payroll', view: 'payroll' },
        { label: 'Reports', view: 'reports' },
        { label: 'Settings', view: 'settings', tab: 'employer' }
      ];
    }
    
    // Default: EMPLOYEE
    return [
      { label: 'Dashboard', view: 'directory' },
      { label: 'Attendance', view: 'attendance' },
      { label: 'Leaves', view: 'timeoff' },
      { label: 'Account', view: 'profile' },
      { label: 'Reports', view: 'reports' },
      { label: 'Settings', view: 'settings', tab: 'employer' }
    ];
  };

  const getSidebarIcon = (label: string) => {
    switch (label.toLowerCase()) {
      case 'dashboard':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>;
      case 'organizations':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
      case 'users':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>;
      case 'employees':
      case 'workforce':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
      case 'salary info':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>;
      case 'attendance':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
      case 'leave management':
      case 'leaves':
      case 'time off':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>;
      case 'payroll':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>;
      case 'reports':
      case 'reports & analytics':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>;
      case 'account':
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
      default:
        return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>;
    }
  };

  // Render active view-only content
  const renderActiveView = () => {
    if (!session) return null;
    
    switch (currentView) {
      case 'attendance':
        if (session.role === 'EMPLOYEE') {
          return (
            <EmployeeAttendanceView
              employeeId={session.user.id}
              employeeName={session.user.firstName + ' ' + session.user.lastName}
            />
          );
        }
        return (
          <AdminAttendanceView
            userRole={session.role as UserRole}
            userId={session.user.id}
          />
        );
      case 'dashboard':
        if (session.role === 'EMPLOYER') {
          return <EmployerView onLogout={handleLogout} />;
        }
        return (
          <AttendanceView 
            employeeId={session.user.id} 
            userRole={session.role as UserRole} 
          />
        );
      case 'directory':
        return (
          <Directory 
            userRole={session.role} 
            onNavigateToSalaryInfo={(empId) => {
              setSelectedSalaryEmpId(empId);
              setCurrentView('salary_info');
            }}
          />
        );
      case 'salary_info':
        if (session.role === 'ADMIN') {
          return (
            <SalaryInfoView 
              adminUser={session.user} 
              preSelectedEmployeeId={selectedSalaryEmpId} 
            />
          );
        } else {
          return (
            <div className="card glass-card" style={{ padding: '3rem 2rem', textAlign: 'center', maxWidth: '500px', margin: '4rem auto' }}>
              <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></span>
              <h2 style={{ color: 'var(--status-leave)', fontWeight: 'bold' }}>Access Denied</h2>
              <p style={{ color: 'var(--text-secondary)', margin: '1rem 0 2rem 0', fontSize: '0.9rem' }}>
                You do not have permission to access confidential salary information.
              </p>
              <button 
                type="button" 
                className="btn-submit-request" 
                style={{ padding: '0.75rem 1.5rem', height: 'auto' }}
                onClick={() => setCurrentView('dashboard')}
              >
                Return to Dashboard
              </button>
            </div>
          );
        }
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
        return <ReportsView />;
      case 'settings':
        return <SettingsView onLogout={handleLogout} defaultTab={settingsTab} />;
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
        <div className="sidebar-brand-section" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img src={odooLogo} alt="Odoo Logo" style={{ maxHeight: '32px', width: 'auto', objectFit: 'contain' }} />
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
          <ul className="sidebar-nav-list">
            {getSidebarLinks().map((link) => {
              const isActive = currentView === link.view && (link.tab ? settingsTab === link.tab : true);
              return (
                <li key={`${link.label}-${link.view}`} className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                  <button 
                    type="button" 
                    onClick={() => {
                      setCurrentView(link.view);
                      if (link.tab) {
                        setSettingsTab(link.tab);
                      } else {
                        setSettingsTab(undefined);
                      }
                      setMobileSidebarOpen(false);
                      setProfileDropdownOpen(false);
                    }}
                  >
                    {getSidebarIcon(link.label)}
                    {link.label}
                  </button>
                </li>
              );
            })}
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
                aria-haspopup="true"
                aria-expanded={profileDropdownOpen}
              >
                <div className="header-avatar-circle">
                  {session.user.firstName.substring(0, 2).toUpperCase()}
                  <span className="header-avatar-status" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.2 }}>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{userDisplayName}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', letterSpacing: '0.02em' }}>{session.user.loginId}</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)', flexShrink: 0 }}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {profileDropdownOpen && (
                <>
                  {/* Backdrop to close on outside click */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 149 }}
                    onClick={() => setProfileDropdownOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="profile-dropdown-menu">
                    {/* Caret arrow at top */}
                    <div className="profile-dropdown-caret" />

                    {/* User header inside dropdown */}
                    <div className="profile-dropdown-header">
                      <div className="header-avatar-circle" style={{ width: '44px', height: '44px', fontSize: '1rem', flexShrink: 0 }}>
                        {session.user.firstName.substring(0, 2).toUpperCase()}
                        <span className="header-avatar-status" />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3 }}>
                        <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{userDisplayName}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', letterSpacing: '0.02em' }}>{session.user.loginId}</span>
                      </div>
                    </div>

                    <div className="profile-dropdown-divider" />

                    {/* Menu items */}
                    <button
                      type="button"
                      className="profile-dropdown-item active-item"
                      onClick={() => { setCurrentView('profile'); setProfileDropdownOpen(false); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                      My Profile
                    </button>

                    <button
                      type="button"
                      className="profile-dropdown-item"
                      onClick={() => { setCurrentView('settings'); setSettingsTab('employer'); setProfileDropdownOpen(false); }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                      </svg>
                      Account Settings
                    </button>

                    <button
                      type="button"
                      className="profile-dropdown-item"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
                        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
                        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
                      </svg>
                      Preferences
                    </button>

                    <div className="profile-dropdown-divider" />

                    <button
                      type="button"
                      className="profile-dropdown-item logout-item"
                      onClick={handleLogout}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Log Out
                    </button>
                  </div>
                </>
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
