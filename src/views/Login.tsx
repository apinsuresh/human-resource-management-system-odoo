import { useState } from 'react';
import { mockAuthLogin, mockResetPassword } from '../mockApi';
import { showToast } from '../components/Toast';

interface LoginProps {
  onLoginSuccess: (session: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Login Form States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'hr' | 'admin' | 'employer'>('hr');

  // Forced Reset States
  const [needsReset, setNeedsReset] = useState(false);
  const [tempSession, setTempSession] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      showToast('Please enter both Login ID/Email and password.', 'error');
      return;
    }

    setLoading(true);
    try {
      const session = await mockAuthLogin(identifier, password);
      
      // Role validation checks as per Section 3A.2
      if (selectedRole === 'admin' && session.role !== 'ADMIN') {
        showToast('You do not have permission to access the Administrator workspace.', 'error');
        return;
      }
      if (selectedRole === 'hr' && session.role !== 'HR_OFFICER') {
        showToast('You do not have permission to access the HR workspace.', 'error');
        return;
      }
      if (selectedRole === 'employer' && session.role !== 'EMPLOYEE') {
        showToast('You do not have permission to access the Employer / Leadership workspace.', 'error');
        return;
      }

      if (session.mustResetPassword) {
        showToast('Password change required on first login.', 'info');
        setTempSession(session);
        setNeedsReset(true);
      } else {
        showToast(`Welcome back, ${session.user.firstName}!`, 'success');
        onLoginSuccess(session);
      }
    } catch (err: any) {
      showToast(err.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showToast('Please fill all password fields.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await mockResetPassword(tempSession.user.id, password, newPassword);
      showToast('Password updated successfully! Logging you in...', 'success');
      
      const updatedSession = { ...tempSession, mustResetPassword: false };
      onLoginSuccess(updatedSession);
    } catch (err: any) {
      showToast(err.message || 'Password reset failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const quickFill = (role: 'admin' | 'hr' | 'employee') => {
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

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-header">
          <h2>HRMS Portal</h2>
          <p>{needsReset ? 'Create a secure new password' : 'Log in to access your dashboard'}</p>
        </div>

        {!needsReset ? (
          /* Login Form with Role selectors */
          <form onSubmit={handleLoginSubmit} noValidate>
            
            {/* Account Type selectors */}
            <div className="login-role-selector" style={{ marginBottom: '1.25rem', textAlign: 'left' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                Choose your account type
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                {/* HR Card */}
                <div 
                  className={`role-select-card ${selectedRole === 'hr' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('hr')}
                >
                  <div className="role-card-check">
                    {selectedRole === 'hr' && <span className="check-dot"></span>}
                  </div>
                  <strong className="role-card-title">HR</strong>
                  <span className="role-card-sub">HR Operations</span>
                </div>

                {/* Admin Card */}
                <div 
                  className={`role-select-card ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  <div className="role-card-check">
                    {selectedRole === 'admin' && <span className="check-dot"></span>}
                  </div>
                  <strong className="role-card-title">Admin</strong>
                  <span className="role-card-sub">System Control</span>
                </div>

                {/* Employer Card */}
                <div 
                  className={`role-select-card ${selectedRole === 'employer' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('employer')}
                >
                  <div className="role-card-check">
                    {selectedRole === 'employer' && <span className="check-dot"></span>}
                  </div>
                  <strong className="role-card-title">Employer</strong>
                  <span className="role-card-sub">Executive View</span>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-id">Login ID or Email Address</label>
              <input
                type="text"
                id="login-id"
                className="form-control"
                placeholder="e.g. OIANRA20260003"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
              />
            </div>

            <div className="form-group password-group">
              <label htmlFor="login-password">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  className="form-control"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-pw"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{ minHeight: '40px' }}>
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          /* Forced Password Reset Form */
          <form onSubmit={handleResetSubmit} noValidate>
            <div className="reset-alert">
              ⚠️ <strong>First Login Detected:</strong> You are logging in with a temporary password and must create a new one to continue.
            </div>

            <div className="form-group">
              <label htmlFor="new-pw">New Password</label>
              <input
                type="password"
                id="new-pw"
                className="form-control"
                placeholder="Minimum 10 chars, uppercase, lowercase, digit"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-pw">Confirm New Password</label>
              <input
                type="password"
                id="confirm-pw"
                className="form-control"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary w-100" disabled={loading} style={{ minHeight: '40px' }}>
              {loading ? 'Saving...' : 'Set Password & Login'}
            </button>
          </form>
        )}

        {/* Demo Accounts Quick-Fill Section */}
        {!needsReset && (
          <div className="demo-accounts-box">
            <h4>Quick Testing Logins</h4>
            <div className="demo-btns-grid">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => quickFill('admin')}>
                🔑 Admin
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => quickFill('hr')}>
                🔑 HR
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => quickFill('employee')}>
                🔑 Employer
              </button>
            </div>
            <span className="demo-warning">
              Anita Rao (Employer test account) triggers forced reset!
            </span>
          </div>
        )}
      </div>

      <style>{`
        .login-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: var(--bg-app);
          padding: 1.5rem;
        }

        .login-card {
          background-color: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 16px;
          padding: 2.5rem;
          width: 100%;
          max-width: 440px;
          box-shadow: var(--shadow-premium);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h2 {
          font-size: 1.75rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin-bottom: 0.5rem;
        }

        .login-header p {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        .password-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .btn-toggle-pw {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          font-size: 1.1rem;
          cursor: pointer;
          color: var(--text-muted);
          padding: 4px;
        }

        .w-100 {
          width: 100%;
          margin-top: 1rem;
        }

        .reset-alert {
          background-color: var(--status-absent-light);
          border: 1px solid rgba(245, 158, 11, 0.2);
          color: var(--text-primary);
          padding: 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          margin-bottom: 1.5rem;
          line-height: 1.4;
        }

        .demo-accounts-box {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-glass);
          text-align: center;
        }

        .demo-accounts-box h4 {
          font-size: 0.85rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .demo-btns-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
        }

        .btn-sm {
          min-height: 38px;
          font-size: 0.8rem;
          padding: 0.25rem 0.5rem;
        }

        .demo-warning {
          display: block;
          margin-top: 0.75rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.3;
        }

        /* Role Card Selectors */
        .role-select-card {
          background: rgba(255, 255, 255, 0.4);
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 0.75rem 0.5rem;
          text-align: center;
          cursor: pointer;
          transition: all var(--transition-speed);
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .role-select-card:hover {
          background: rgba(255, 255, 255, 0.8);
          border-color: rgba(37, 99, 235, 0.2);
          transform: translateY(-1px);
        }

        .role-select-card.active {
          background: #ffffff;
          border-color: var(--accent-primary);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
        }

        .role-card-check {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          border: 1px solid var(--text-muted);
          margin-bottom: 0.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .role-select-card.active .role-card-check {
          border-color: var(--accent-primary);
          background: var(--accent-primary);
        }

        .check-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: white;
        }

        .role-card-title {
          font-size: 0.85rem;
          color: var(--text-primary);
          font-weight: 700;
          display: block;
        }

        .role-card-sub {
          font-size: 0.65rem;
          color: var(--text-secondary);
          margin-top: 0.15rem;
          display: block;
        }
      `}</style>
    </div>
  );
}
