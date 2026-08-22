import { useState } from 'react';
import odooLogo from '../assets/image copy.png';
import { 
  mockAuthLogin, 
  mockResetPassword, 
  mockForgotPassword, 
  mockVerifyOtpAndResetPassword 
} from '../mockApi';
import { showToast } from '../components/Toast';

interface LoginProps {
  onLoginSuccess: (session: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Navigation States: 'login' | 'forgot' | 'reset_otp' | 'force_change'
  const [authMode, setAuthMode] = useState<'login' | 'forgot' | 'reset_otp' | 'force_change'>('login');
  
  // Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'hr' | 'admin' | 'employer'>('hr');
  const [rememberMe, setRememberMe] = useState(false);
  const [language, setLanguage] = useState('English (US)');
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  // Autofill credentials map for each workspace
  const WORKSPACE_CREDENTIALS: Record<'hr' | 'admin' | 'employer', { id: string; pw: string }> = {
    hr:       { id: 'OIHRMS20260002', pw: 'HRPassword123' },
    admin:    { id: 'OIADMI20260001', pw: 'AdminPassword123' },
    employer: { id: 'OIANRA20260003', pw: 'EmpPassword123' },
  };

  const handleWorkspaceSelect = (role: 'hr' | 'admin' | 'employer') => {
    setSelectedRole(role);
    setIdentifier(WORKSPACE_CREDENTIALS[role].id);
    setPassword(WORKSPACE_CREDENTIALS[role].pw);
  };

  // Hidden Dev helpers panel state (toggled by clicking the security shield or logo)
  const [showDevPanel, setShowDevPanel] = useState(false);

  // Forced Password Change States (First Login)
  const [tempSession, setTempSession] = useState<any>(null);
  const [currentTempPassword, setCurrentTempPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showForcePw, setShowForcePw] = useState(false);

  // Forgot Password / OTP Recovery States
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [recoveredPassword, setRecoveredPassword] = useState('');
  const [confirmRecoveredPassword, setConfirmRecoveredPassword] = useState('');
  const [showRecoverPw, setShowRecoverPw] = useState(false);

  // 1. Sign In Submit Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showToast('Please enter both Login ID/Email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const session = await mockAuthLogin(identifier.trim(), password);
      
      // Role validation checks
      if (selectedRole === 'admin' && session.role !== 'ADMIN') {
        showToast('This account does not have access to this workspace.', 'error');
        setLoading(false);
        return;
      }
      if (selectedRole === 'hr' && session.role !== 'HR_OFFICER') {
        showToast('This account does not have access to this workspace.', 'error');
        setLoading(false);
        return;
      }
      if (selectedRole === 'employer' && session.role !== 'EMPLOYEE') {
        showToast('This account does not have access to this workspace.', 'error');
        setLoading(false);
        return;
      }

      if (session.mustResetPassword) {
        showToast('Password change required on first login.', 'info');
        setTempSession(session);
        setCurrentTempPassword(password);
        setAuthMode('force_change');
      } else {
        showToast(`Welcome back, ${session.user.firstName}!`, 'success');
        onLoginSuccess(session);
      }
    } catch (err: any) {
      showToast(err.message || 'Invalid login credentials. Please check your details and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 2. Forced Temporary Password Change Handler
  const handleForceChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTempPassword || !newPassword || !confirmPassword) {
      showToast('Please fill all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await mockResetPassword(tempSession.user.id, currentTempPassword, newPassword);
      showToast('Password updated successfully! Logging you in...', 'success');
      const updatedSession = { ...tempSession, mustResetPassword: false };
      onLoginSuccess(updatedSession);
    } catch (err: any) {
      showToast(err.message || 'Password update failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 3. Forgot Password / Request OTP Code
  const handleRequestOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) {
      showToast('Please enter your Login ID or Email.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await mockForgotPassword(forgotIdentifier.trim());
      showToast(res.message, 'success');
      // For developer verification convenience, reveal simulated code 123456
      showToast('Simulated OTP sent: 123456', 'info');
      setAuthMode('reset_otp');
    } catch (err: any) {
      showToast(err.message || 'Verification request failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 4. Verify OTP and Commit New Password
  const handleOtpResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !recoveredPassword || !confirmRecoveredPassword) {
      showToast('Please fill all fields.', 'error');
      return;
    }

    if (recoveredPassword !== confirmRecoveredPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await mockVerifyOtpAndResetPassword(forgotIdentifier.trim(), otpCode, recoveredPassword);
      showToast('Password reset complete. You can now log in.', 'success');
      setIdentifier(forgotIdentifier);
      setAuthMode('login');
      setPassword('');
    } catch (err: any) {
      showToast(err.message || 'OTP reset verification failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Testing helper logins
  const quickFill = (role: 'admin' | 'hr' | 'employee') => {
    setAuthMode('login');
    if (role === 'admin') {
      setSelectedRole('admin');
      setIdentifier('OIADMI20260001');
      setPassword('AdminPassword123');
    } else if (role === 'hr') {
      setSelectedRole('hr');
      setIdentifier('OIHRMS20260002');
      setPassword('HRPassword123');
    } else {
      setSelectedRole('employer');
      setIdentifier('OIANRA20260003');
      setPassword('EmpPassword123');
    }
  };

  const resetDatabase = () => {
    localStorage.clear();
    showToast('Database reset to defaults. Reloading...', 'success');
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  return (
    <div className="login-page-container">
      {/* LEFT PANEL: BRANDING / PRESENTATION */}
      <div className="login-brand-panel">
        <div className="brand-panel-top">
          <div className="brand-logo-area" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <img src={odooLogo} alt="Odoo Logo" style={{ maxHeight: '52px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <div className="brand-panel-content">
          <h1 className="brand-main-title">
            Human Resource<br />
            Management System
          </h1>
          <p className="brand-sub-desc">
            Manage employees, payroll, attendance, leave, and workforce operations from one secure platform.
          </p>

          <div className="brand-features-list">
            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="brand-feature-text">
                <h3>EMPLOYEE MANAGEMENT</h3>
                <p>Maintain employee records, profiles, departments and workforce information.</p>
              </div>
            </div>

            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="brand-feature-text">
                <h3>PAYROLL & COMPLIANCE</h3>
                <p>Manage payroll information, salary, deductions and compliance workflows.</p>
              </div>
            </div>

            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="brand-feature-text">
                <h3>ATTENDANCE & LEAVE</h3>
                <p>Track attendance, working hours, leave requests and approvals.</p>
              </div>
            </div>

            <div className="brand-feature-item">
              <div className="brand-feature-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div className="brand-feature-text">
                <h3>WORKFORCE ANALYTICS</h3>
                <p>Monitor workforce performance, trends and organizational insights.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="brand-panel-footer">
          <span>&copy; {new Date().getFullYear()} Odoo Enterprise. All rights reserved.</span>
        </div>
      </div>

      {/* RIGHT PANEL: AUTHENTICATION */}
      <div className="login-form-panel">
        <div className="form-panel-header">
          {/* Mobile-only logo */}
          <div className="mobile-brand-logo" style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }}>
            <img src={odooLogo} alt="Odoo Logo" style={{ maxHeight: '32px', width: 'auto', objectFit: 'contain' }} />
          </div>

          {/* Language Selector Dropdown */}
          <div className="lang-selector-wrapper">
            <button 
              type="button" 
              className="lang-selector-btn"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              {language}
              <span className="lang-chevron">▼</span>
            </button>
            {showLangDropdown && (
              <div className="lang-dropdown-menu">
                <button type="button" onClick={() => { setLanguage('English (US)'); setShowLangDropdown(false); }}>English (US)</button>
                <button type="button" onClick={() => { setLanguage('English (UK)'); setShowLangDropdown(false); }}>English (UK)</button>
                <button type="button" onClick={() => { setLanguage('Español'); setShowLangDropdown(false); }}>Español</button>
                <button type="button" onClick={() => { setLanguage('Français'); setShowLangDropdown(false); }}>Français</button>
              </div>
            )}
          </div>
        </div>

        <div className="form-panel-body">
          {/* MODE 1: STANDARD SIGN IN */}
          {authMode === 'login' && (
            <div className="auth-step-wrapper">
              <div className="auth-header">
                <h2>Welcome Back</h2>
                <p>Sign in to your account to continue.</p>
              </div>

              <form onSubmit={handleLoginSubmit} noValidate>
                {/* Account Type Workspace Selection Cards */}
                <div className="workspace-selector-section">
                  <label className="workspace-label">Select Account Workspace</label>
                  <div className="workspace-grid">
                    <div 
                      className={`workspace-card ${selectedRole === 'hr' ? 'active' : ''}`}
                      onClick={() => handleWorkspaceSelect('hr')}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleWorkspaceSelect('hr'); } }}
                      role="radio"
                      aria-checked={selectedRole === 'hr'}
                    >
                      <div className="workspace-indicator">
                        <div className="workspace-radio-circle" />
                      </div>
                      <div className="workspace-card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="workspace-card-info">
                        <strong>HR</strong>
                        <span>Operations</span>
                      </div>
                    </div>

                    <div 
                      className={`workspace-card ${selectedRole === 'admin' ? 'active' : ''}`}
                      onClick={() => handleWorkspaceSelect('admin')}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleWorkspaceSelect('admin'); } }}
                      role="radio"
                      aria-checked={selectedRole === 'admin'}
                    >
                      <div className="workspace-indicator">
                        <div className="workspace-radio-circle" />
                      </div>
                      <div className="workspace-card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                      </div>
                      <div className="workspace-card-info">
                        <strong>Admin</strong>
                        <span>System</span>
                      </div>
                    </div>

                    <div 
                      className={`workspace-card ${selectedRole === 'employer' ? 'active' : ''}`}
                      onClick={() => handleWorkspaceSelect('employer')}
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { handleWorkspaceSelect('employer'); } }}
                      role="radio"
                      aria-checked={selectedRole === 'employer'}
                    >
                      <div className="workspace-indicator">
                        <div className="workspace-radio-circle" />
                      </div>
                      <div className="workspace-card-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </div>
                      <div className="workspace-card-info">
                        <strong>Employee</strong>
                        <span>Self-Service</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email / Login ID Field */}
                <div className="form-group-custom">
                  <label htmlFor="login-id">Login ID or Email Address</label>
                  <div className="input-with-icon-wrapper">
                    <div className="input-prefix-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="login-id"
                      placeholder="Enter your email or login ID"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="form-group-custom">
                  <div className="password-header-row">
                    <label htmlFor="login-password">Password</label>
                    <button 
                      type="button" 
                      className="forgot-password-link"
                      onClick={() => setAuthMode('forgot')}
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="input-with-icon-wrapper">
                    <div className="input-prefix-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="login-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me and SSO Options Row */}
                <div className="auth-options-row">
                  <label className="remember-me-checkbox">
                    <input 
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    <span>Remember me</span>
                  </label>
                  <button 
                    type="button" 
                    className="sso-indicator-btn"
                    disabled
                    title="SSO integration is currently unavailable"
                  >
                    Use single sign-on (SSO)
                  </button>
                </div>

                {/* Sign In Primary CTA */}
                <button 
                  type="submit" 
                  className="auth-primary-btn" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="btn-loading-content">
                      <span className="btn-spinner" />
                      Signing in...
                    </span>
                  ) : (
                    <span className="btn-normal-content">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Sign In
                    </span>
                  )}
                </button>
              </form>

              <div className="no-account-notice">
                Don't have an account? <span>Contact HR / Administrator</span>
              </div>
            </div>
          )}

          {/* MODE 2: FORGOT PASSWORD */}
          {authMode === 'forgot' && (
            <div className="auth-step-wrapper">
              <div className="auth-header">
                <h2>Password Recovery</h2>
                <p>Enter your Login ID or Email to request a reset code.</p>
              </div>

              <form onSubmit={handleRequestOtpSubmit} noValidate>
                <div className="form-group-custom">
                  <label htmlFor="forgot-email">Login ID or Email Address</label>
                  <div className="input-with-icon-wrapper">
                    <div className="input-prefix-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                        <polyline points="22,6 12,13 2,6" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      id="forgot-email"
                      placeholder="e.g. employee@odoo.com"
                      value={forgotIdentifier}
                      onChange={(e) => setForgotIdentifier(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="recovery-actions-row">
                  <button 
                    type="button" 
                    className="auth-secondary-btn" 
                    onClick={() => setAuthMode('login')}
                  >
                    Back to Sign In
                  </button>
                  <button 
                    type="submit" 
                    className="auth-primary-btn" 
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Request Reset OTP'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODE 3: VERIFY OTP */}
          {authMode === 'reset_otp' && (
            <div className="auth-step-wrapper">
              <div className="auth-header">
                <h2>Set Recovery Password</h2>
                <p>Please enter the OTP verification code and choose a new password.</p>
              </div>

              <form onSubmit={handleOtpResetSubmit} noValidate>
                <div className="form-group-custom">
                  <label htmlFor="otp-code">Verification Code (OTP) *</label>
                  <input
                    type="text"
                    id="otp-code"
                    className="form-control-styled"
                    placeholder="Enter 6-digit OTP code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group-custom">
                  <label htmlFor="rec-new-pw">New Password *</label>
                  <div className="input-with-icon-wrapper">
                    <div className="input-prefix-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type={showRecoverPw ? 'text' : 'password'}
                      id="rec-new-pw"
                      placeholder="Min 8 chars, uppercase, digit"
                      value={recoveredPassword}
                      onChange={(e) => setRecoveredPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowRecoverPw(!showRecoverPw)}
                    >
                      {showRecoverPw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="form-group-custom">
                  <label htmlFor="rec-confirm-pw">Confirm New Password *</label>
                  <input
                    type="password"
                    id="rec-confirm-pw"
                    className="form-control-styled"
                    placeholder="Retype your new password"
                    value={confirmRecoveredPassword}
                    onChange={(e) => setConfirmRecoveredPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="recovery-actions-row">
                  <button 
                    type="button" 
                    className="auth-secondary-btn" 
                    onClick={() => setAuthMode('forgot')}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="auth-primary-btn" 
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Reset Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODE 4: FORCED TEMPORARY PASSWORD CHANGE */}
          {authMode === 'force_change' && (
            <div className="auth-step-wrapper">
              <div className="auth-header">
                <h2>Security Update Required</h2>
                <p>Welcome to your workspace. Please update your temporary password to secure your account.</p>
              </div>

              <form onSubmit={handleForceChangeSubmit} noValidate>
                <div className="security-alert-box">
                  <strong>First Login Security Check</strong>
                  <p>For data compliance and enterprise security, you must replace your temporary password before accessing employee dashboards.</p>
                </div>

                <div className="form-group-custom">
                  <label htmlFor="force-temp-pw">Temporary Password *</label>
                  <input
                    type="password"
                    id="force-temp-pw"
                    className="form-control-styled"
                    value={currentTempPassword}
                    disabled
                  />
                </div>

                <div className="form-group-custom">
                  <label htmlFor="force-new-pw">New Password *</label>
                  <div className="input-with-icon-wrapper">
                    <div className="input-prefix-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </div>
                    <input
                      type={showForcePw ? 'text' : 'password'}
                      id="force-new-pw"
                      placeholder="Create a strong password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowForcePw(!showForcePw)}
                    >
                      {showForcePw ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>

                <div className="form-group-custom">
                  <label htmlFor="force-confirm-pw">Confirm New Password *</label>
                  <input
                    type="password"
                    id="force-confirm-pw"
                    className="form-control-styled"
                    placeholder="Confirm your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <button 
                  type="submit" 
                  className="auth-primary-btn" 
                  disabled={loading}
                  style={{ marginTop: '1.5rem' }}
                >
                  {loading ? 'Committing Reset...' : 'Update Password & Continue'}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="form-panel-footer">
          {/* Subtle Security Shield Notice */}
          <div 
            className="security-notice-area"
            onClick={() => setShowDevPanel(!showDevPanel)}
            title="Click to toggle developer quick-fill logins"
            style={{ cursor: 'pointer' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            <span>Your data is protected with enterprise-grade security.</span>
          </div>
        </div>
      </div>

      {/* DEV HELPER DRAWER/OVERLAY (Conditional / Environment safe check helper) */}
      {showDevPanel && (
        <div className="dev-accounts-panel">
          <div className="dev-accounts-header">
            <h4>Quick Development Login Tools</h4>
            <button type="button" className="dev-panel-close-btn" onClick={() => setShowDevPanel(false)}>✕</button>
          </div>
          <p className="dev-panel-desc">Quickly seed local database states or fill test credentials. Hidden in production environments.</p>
          <div className="dev-btns-flex">
            <button type="button" onClick={() => { quickFill('admin'); setShowDevPanel(false); }}>Fill Admin</button>
            <button type="button" onClick={() => { quickFill('hr'); setShowDevPanel(false); }}>Fill HR</button>
            <button type="button" onClick={() => { quickFill('employee'); setShowDevPanel(false); }}>Fill Employee</button>
            <button type="button" className="dev-db-reset-btn" onClick={resetDatabase}>Reset Local Database</button>
          </div>
        </div>
      )}

      {/* STYLING BLOCK FOR REDESIGNED LOGIN */}
      <style>{`
        /* Root container split panels */
        .login-page-container {
          display: flex;
          min-height: 100vh;
          width: 100vw;
          background-color: #f8fafc;
          font-family: 'Inter', sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 9999;
          overflow: hidden;
        }

        /* LEFT PANEL: BRAND PRESENTATION */
        .login-brand-panel {
          flex: 1.1;
          background: linear-gradient(145deg, #1e3a8a 0%, #0f172a 100%);
          color: #ffffff;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          z-index: 1;
        }

        /* Dot mesh decoration */
        .login-brand-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1.5px, transparent 1.5px);
          background-size: 24px 24px;
          opacity: 0.8;
          z-index: -1;
        }

        .brand-panel-top {
          display: flex;
          align-items: center;
        }

        .brand-logo-area {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-logo-symbol {
          background-color: rgba(255, 255, 255, 0.15);
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #60a5fa;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brand-logo-text {
          font-family: 'Outfit', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          letter-spacing: 2px;
          color: #ffffff;
        }

        .brand-panel-content {
          max-width: 520px;
          margin: auto 0;
        }

        .brand-main-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.25rem;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 1rem;
          color: #ffffff;
          letter-spacing: -0.5px;
        }

        .brand-sub-desc {
          font-size: 0.95rem;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 2.5rem;
        }

        .brand-features-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .brand-feature-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .brand-feature-icon {
          background-color: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.05);
          width: 36px;
          height: 36px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #3b82f6;
          flex-shrink: 0;
        }

        .brand-feature-text h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          font-weight: 700;
          color: #3b82f6;
          margin: 0 0 0.25rem 0;
          letter-spacing: 0.8px;
        }

        .brand-feature-text p {
          font-size: 0.85rem;
          color: #cbd5e1;
          margin: 0;
          line-height: 1.45;
        }

        .brand-panel-footer {
          font-size: 0.8rem;
          color: #64748b;
        }

        /* RIGHT PANEL: FORM CONTAINER */
        .login-form-panel {
          flex: 0.9;
          background-color: #ffffff;
          padding: 3rem;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
        }

        .form-panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mobile-brand-logo {
          display: none;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
          color: #1e293b;
        }

        /* Language Dropdown Selector */
        .lang-selector-wrapper {
          position: relative;
        }

        .lang-selector-btn {
          background: none;
          border: none;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 0.75rem;
          border-radius: 30px;
          transition: background-color 0.15s;
        }

        .lang-selector-btn:hover {
          background-color: #f1f5f9;
          color: #1e293b;
        }

        .lang-chevron {
          font-size: 0.6rem;
          color: #94a3b8;
        }

        .lang-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          padding: 0.25rem 0;
          z-index: 100;
          min-width: 120px;
        }

        .lang-dropdown-menu button {
          display: block;
          width: 100%;
          padding: 0.5rem 1rem;
          border: none;
          background: none;
          text-align: left;
          font-size: 0.8rem;
          color: #334155;
          cursor: pointer;
        }

        .lang-dropdown-menu button:hover {
          background-color: #f8fafc;
          color: #2563eb;
        }

        /* Form body content */
        .form-panel-body {
          max-width: 440px;
          width: 100%;
          margin: auto;
        }

        .auth-header {
          margin-bottom: 2rem;
        }

        .auth-header h2 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.85rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.5px;
        }

        .auth-header p {
          font-size: 0.9rem;
          color: #64748b;
          margin: 0;
        }

        /* Workspace selection cards */
        .workspace-selector-section {
          margin-bottom: 1.5rem;
        }

        .workspace-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #475569;
          display: block;
          margin-bottom: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .workspace-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .workspace-card {
          background-color: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 0.75rem;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          outline: none;
        }

        .workspace-card:hover {
          border-color: #cbd5e1;
          background-color: #f8fafc;
          transform: translateY(-1px);
        }

        .workspace-card:focus-visible {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .workspace-card.active {
          border-color: #2563eb;
          background-color: #eff6ff;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08);
        }

        .workspace-indicator {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1.5px solid #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .workspace-card.active .workspace-indicator {
          border-color: #2563eb;
          background-color: #2563eb;
        }

        .workspace-radio-circle {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #ffffff;
        }

        .workspace-card-icon {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
          color: #64748b;
          transition: color 0.2s;
        }

        .workspace-card.active .workspace-card-icon {
          color: #2563eb;
        }

        .workspace-card-info {
          text-align: center;
        }

        .workspace-card-info strong {
          display: block;
          font-size: 0.85rem;
          color: #1e293b;
          font-weight: 700;
        }

        .workspace-card-info span {
          display: block;
          font-size: 0.68rem;
          color: #64748b;
          margin-top: 0.15rem;
        }

        /* Form Group Inputs styling */
        .form-group-custom {
          margin-bottom: 1.25rem;
        }

        .form-group-custom label {
          font-size: 0.8rem;
          font-weight: 600;
          color: #334155;
          display: block;
          margin-bottom: 0.45rem;
        }

        .input-with-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-prefix-icon {
          position: absolute;
          left: 12px;
          color: #94a3b8;
          display: flex;
          align-items: center;
        }

        .input-with-icon-wrapper input {
          width: 100%;
          padding: 0.65rem 1rem 0.65rem 2.35rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #1e293b;
          background-color: #ffffff;
          transition: all 0.2s;
          min-height: 42px;
        }

        .input-with-icon-wrapper input::placeholder {
          color: #94a3b8;
        }

        .input-with-icon-wrapper input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          outline: none;
        }

        .password-header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .forgot-password-link {
          background: none;
          border: none;
          font-size: 0.78rem;
          font-weight: 600;
          color: #2563eb;
          cursor: pointer;
          padding: 0;
        }

        .forgot-password-link:hover {
          text-decoration: underline;
        }

        .password-toggle-btn {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
        }

        .password-toggle-btn:hover {
          color: #64748b;
        }

        /* Checkbox option and SSO */
        .auth-options-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .remember-me-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 0.82rem;
          color: #475569;
        }

        .remember-me-checkbox input {
          width: 15px;
          height: 15px;
          border-radius: 4px;
          border: 1.5px solid #cbd5e1;
          cursor: pointer;
        }

        .sso-indicator-btn {
          background: none;
          border: none;
          font-size: 0.8rem;
          font-weight: 500;
          color: #64748b;
          cursor: not-allowed;
          padding: 0;
          opacity: 0.8;
        }

        /* Buttons CTA */
        .auth-primary-btn {
          width: 100%;
          background-color: #2563eb;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          transition: background-color 0.15s;
        }

        .auth-primary-btn:hover:not(:disabled) {
          background-color: #1d4ed8;
        }

        .auth-primary-btn:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        .btn-loading-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: btnSpinnerSpin 0.6s linear infinite;
        }

        @keyframes btnSpinnerSpin {
          to { transform: rotate(360deg); }
        }

        .btn-normal-content {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .no-account-notice {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.82rem;
          color: #64748b;
        }

        .no-account-notice span {
          font-weight: 700;
          color: #1e293b;
        }

        /* Reset and Forgot views stylings */
        .form-control-styled {
          width: 100%;
          padding: 0.65rem 1rem;
          border: 1.5px solid #e2e8f0;
          border-radius: 10px;
          font-size: 0.9rem;
          color: #1e293b;
          background-color: #ffffff;
          transition: all 0.2s;
          min-height: 42px;
        }

        .form-control-styled:focus {
          border-color: #2563eb;
          outline: none;
        }

        .recovery-actions-row {
          display: flex;
          gap: 0.75rem;
          margin-top: 1.5rem;
        }

        .auth-secondary-btn {
          width: 100%;
          background-color: #ffffff;
          border: 1.5px solid #e2e8f0;
          color: #475569;
          border-radius: 10px;
          padding: 0.75rem;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          transition: all 0.15s;
        }

        .auth-secondary-btn:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        .security-alert-box {
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.82rem;
          line-height: 1.5;
          margin-bottom: 1.5rem;
        }

        .security-alert-box strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .security-alert-box p {
          margin: 0;
        }

        /* Footer info */
        .form-panel-footer {
          display: flex;
          justify-content: center;
        }

        .security-notice-area {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.78rem;
          padding: 0.5rem;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .security-notice-area:hover {
          background-color: #f8fafc;
          color: #475569;
        }

        /* DEV ACCOUNTS PANEL DRAWER */
        .dev-accounts-panel {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
          padding: 1.25rem;
          width: 320px;
          z-index: 10000;
          animation: devPanelFadeIn 0.2s ease-out;
        }

        @keyframes devPanelFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .dev-accounts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .dev-accounts-header h4 {
          margin: 0;
          font-size: 0.85rem;
          color: #1e293b;
          font-weight: 700;
        }

        .dev-panel-close-btn {
          background: none;
          border: none;
          font-size: 0.85rem;
          cursor: pointer;
          color: #94a3b8;
          padding: 2px;
        }

        .dev-panel-close-btn:hover {
          color: #64748b;
        }

        .dev-panel-desc {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0 0 1rem 0;
          line-height: 1.4;
        }

        .dev-btns-flex {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .dev-btns-flex button {
          width: 100%;
          padding: 0.5rem;
          font-size: 0.78rem;
          font-weight: 600;
          background-color: #f1f5f9;
          border: 1px solid #cbd5e1;
          color: #334155;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .dev-btns-flex button:hover {
          background-color: #e2e8f0;
        }

        .dev-btns-flex .dev-db-reset-btn {
          background-color: #fef2f2;
          border-color: #fca5a5;
          color: #991b1b;
          margin-top: 0.25rem;
        }

        .dev-btns-flex .dev-db-reset-btn:hover {
          background-color: #fee2e2;
        }

        /* RESPONSIVE BREAKPOINTS */
        @media (max-width: 968px) {
          .login-page-container {
            flex-direction: column;
            position: relative;
            height: 100vh;
            overflow-y: auto;
          }

          .login-brand-panel {
            display: none;
          }

          .login-form-panel {
            flex: 1;
            padding: 2rem 1.5rem;
            min-height: 100%;
            justify-content: space-between;
          }

          .mobile-brand-logo {
            display: flex;
          }

          .form-panel-header {
            margin-bottom: 2rem;
          }

          .form-panel-body {
            margin: 0 auto;
          }
        }
      `}</style>
    </div>
  );
}
