import { useState, useEffect } from 'react';
import { showToast } from '../components/Toast';

export default function SettingsView() {
  const [activeSubTab, setActiveSubTab] = useState('employer');

  // Form Fields State
  const [companyName, setCompanyName] = useState('FORTHEYE Technologies');
  const [industry, setIndustry] = useState('Technology');
  const [companyEmail, setCompanyEmail] = useState('info@fortheye.com');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [website, setWebsite] = useState('https://www.fortheye.com');
  const [regNumber, setRegNumber] = useState('U72900TZ2024PTC032101');
  const [address, setAddress] = useState('123, Business Park, Coimbatore, Tamil Nadu, India - 641001');
  
  const [estDate, setEstDate] = useState('2024-01-15');
  const [companySize, setCompanySize] = useState('101-200');
  const [companyType, setCompanyType] = useState('Private Limited');

  // Load state from localStorage on init
  useEffect(() => {
    try {
      const stored = localStorage.getItem('hrms_company_details');
      if (stored) {
        const data = JSON.parse(stored);
        if (data.companyName) setCompanyName(data.companyName);
        if (data.industry) setIndustry(data.industry);
        if (data.companyEmail) setCompanyEmail(data.companyEmail);
        if (data.phoneNumber) setPhoneNumber(data.phoneNumber);
        if (data.website) setWebsite(data.website);
        if (data.regNumber) setRegNumber(data.regNumber);
        if (data.address) setAddress(data.address);
        if (data.estDate) setEstDate(data.estDate);
        if (data.companySize) setCompanySize(data.companySize);
        if (data.companyType) setCompanyType(data.companyType);
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        companyName,
        industry,
        companyEmail,
        phoneNumber,
        website,
        regNumber,
        address,
        estDate,
        companySize,
        companyType
      };
      localStorage.setItem('hrms_company_details', JSON.stringify(data));
      showToast('Employer settings saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save settings.', 'error');
    }
  };

  const handleCancel = () => {
    showToast('Changes discarded.', 'info');
    window.location.reload();
  };

  const handleLogoUpload = () => {
    showToast('Simulating company logo upload... (PNG, JPG up to 2MB allowed)', 'info');
  };

  const subTabs = [
    { id: 'employer', label: 'Employer Details' },
    { id: 'org', label: 'Organization Settings' },
    { id: 'workforce', label: 'Workforce Settings' },
    { id: 'attendance', label: 'Attendance Settings' },
    { id: 'leave', label: 'Leave Policies' },
    { id: 'payroll', label: 'Payroll Settings' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security Settings' },
    { id: 'integrations', label: 'Integrations' }
  ];

  return (
    <div className="settings-page-grid" style={{ display: 'flex', gap: '1.5rem', width: '100%' }}>
      
      {/* Sidebar Submenu navigation */}
      <div className="card glass-card settings-sidebar" style={{ width: '260px', flexShrink: 0, padding: '1rem', height: 'fit-content' }}>
        <ul className="settings-nav-list" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
          {subTabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className={`settings-sidebar-btn ${activeSubTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Settings Console */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        
        {activeSubTab === 'employer' ? (
          <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Header Title with SVG Illustration */}
            <div className="card glass-card employer-header-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Employer Details</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
                  View and manage employer / company information.
                </p>
              </div>

              {/* Building Illustration SVG */}
              <div className="building-svg-container" style={{ flexShrink: 0 }}>
                <svg width="180" height="90" viewBox="0 0 180 90" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="70" r="20" fill="rgba(37, 99, 235, 0.05)" />
                  <circle cx="130" cy="75" r="14" fill="rgba(37, 99, 235, 0.05)" />
                  <rect x="110" y="25" width="45" height="60" rx="6" fill="#EFF6FF" stroke="#BFDBFE" strokeWidth="1.5" />
                  <rect x="65" y="10" width="50" height="75" rx="6" fill="rgba(37, 99, 235, 0.08)" stroke="var(--accent-primary)" strokeWidth="1.8" />
                  <rect x="75" y="20" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <rect x="87" y="20" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <rect x="99" y="20" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <rect x="75" y="34" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <rect x="87" y="34" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <rect x="99" y="34" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <rect x="75" y="48" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <rect x="87" y="48" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <rect x="99" y="48" width="8" height="8" rx="1.5" fill="rgba(37, 99, 235, 0.15)" />
                  <path d="M85 85V76C85 74.3431 86.3431 73 88 73H94C95.6569 73 97 74.3431 97 76V85" stroke="var(--accent-primary)" strokeWidth="1.8" fill="#ffffff" />
                </svg>
              </div>
            </div>

            {/* Card 1: Employer Information */}
            <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Employer Information</h3>

              <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }} className="grid-logo-form">
                
                {/* Logo Uploader Column */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>Company Logo</span>
                  
                  <div className="logo-preview-box" style={{ width: '130px', height: '130px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '1rem' }}>
                    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50 15L85 75H15L50 15Z" fill="rgba(37, 99, 235, 0.05)" stroke="var(--accent-primary)" strokeWidth="8" strokeLinejoin="round" />
                      <circle cx="50" cy="50" r="12" fill="var(--accent-primary)" />
                    </svg>
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ minHeight: '34px', fontSize: '0.8rem', padding: '0 1rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                    onClick={handleLogoUpload}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    Upload Logo
                  </button>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PNG, JPG up to 2MB</span>
                </div>

                {/* Form Fields Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  
                  {/* Name and Industry row */}
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Company Name <span style={{ color: 'var(--status-absent)' }}>*</span></label>
                      <div className="input-icon-wrapper">
                        <span className="input-icon-span">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><line x1="9" y1="12" x2="9" y2="12.01"></line><line x1="9" y1="8" x2="9" y2="8.01"></line><line x1="15" y1="16" x2="15" y2="16.01"></line><line x1="15" y1="12" x2="15" y2="12.01"></line><line x1="15" y1="8" x2="15" y2="8.01"></line></svg>
                        </span>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Industry</label>
                      <div className="input-icon-wrapper">
                        <span className="input-icon-span">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                        </span>
                        <select 
                          className="form-control" 
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                        >
                          <option value="Technology">Technology</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Finance">Finance</option>
                          <option value="Retail">Retail</option>
                          <option value="Manufacturing">Manufacturing</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Email and Phone row */}
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Company Email <span style={{ color: 'var(--status-absent)' }}>*</span></label>
                      <div className="input-icon-wrapper">
                        <span className="input-icon-span">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </span>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          required 
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Phone Number <span style={{ color: 'var(--status-absent)' }}>*</span></label>
                      <div className="input-icon-wrapper">
                        <span className="input-icon-span">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        </span>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Website and RegNumber row */}
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Website</label>
                      <div className="input-icon-wrapper">
                        <span className="input-icon-span">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        </span>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Registration Number</label>
                      <div className="input-icon-wrapper">
                        <span className="input-icon-span">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" ry="2"></rect><line x1="7" y1="8" x2="17" y2="8"></line><line x1="7" y1="12" x2="17" y2="12"></line><line x1="7" y1="16" x2="12" y2="16"></line></svg>
                        </span>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={regNumber}
                          onChange={(e) => setRegNumber(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Address textarea row */}
              <div className="form-group" style={{ margin: 0, marginTop: '0.5rem' }}>
                <label>Company Address</label>
                <div className="input-icon-wrapper" style={{ alignItems: 'flex-start' }}>
                  <span className="input-icon-span" style={{ marginTop: '0.65rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  </span>
                  <textarea 
                    className="form-control" 
                    rows={2} 
                    style={{ minHeight: '65px', padding: '0.5rem 0.5rem 0.5rem 2.25rem' }}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
              </div>

            </div>

            {/* Card 2: Additional Information */}
            <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Additional Information</h3>

              <div className="grid-3" style={{ gap: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Date of Establishment</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon-span">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </span>
                    <input 
                      type="date" 
                      className="form-control" 
                      value={estDate}
                      onChange={(e) => setEstDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Company Size</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon-span">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    </span>
                    <select 
                      className="form-control" 
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                    >
                      <option value="1-50">1 - 50 Employees</option>
                      <option value="51-100">51 - 100 Employees</option>
                      <option value="101-200">101 - 200 Employees</option>
                      <option value="201-500">201 - 500 Employees</option>
                      <option value="500+">500+ Employees</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label>Company Type</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon-span">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="16"></line><polyline points="9 8 9.01 8 9.01 12 9 12"></polyline></svg>
                    </span>
                    <select 
                      className="form-control" 
                      value={companyType}
                      onChange={(e) => setCompanyType(e.target.value)}
                    >
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Private Limited">Private Limited</option>
                      <option value="Public Limited">Public Limited</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Footer Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.5rem 1.5rem', minHeight: '40px' }}
                onClick={handleCancel}
              >
                Cancel
              </button>
              
              <button 
                type="submit" 
                className="btn-submit-request" 
                style={{ height: '40px', padding: '0 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Save Changes
              </button>
            </div>

          </form>
        ) : (
          /* Placeholder view for other subtabs */
          <div className="card glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '1rem' }}>⚙️</span>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{subTabs.find(t => t.id === activeSubTab)?.label}</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
              This configurations panel is coming soon! Update system settings in future deployment updates.
            </p>
          </div>
        )}

      </div>

      <style>{`
        /* Sidebar styling */
        .settings-sidebar-btn {
          width: 100%;
          border: none;
          background: none;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all var(--transition-speed);
          text-align: left;
        }

        .settings-sidebar-btn:hover {
          background: rgba(37, 99, 235, 0.04);
          color: var(--text-primary);
        }

        .settings-sidebar-btn.active {
          background: rgba(37, 99, 235, 0.08);
          color: var(--accent-primary);
          font-weight: 700;
        }

        /* Inputs elements styling overrides */
        .settings-page-grid .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .settings-page-grid .input-icon-span {
          position: absolute;
          left: 12px;
          display: flex;
          align-items: center;
          color: var(--text-muted);
          pointer-events: none;
        }

        .settings-page-grid .form-control {
          padding-left: 2.25rem !important;
          background-color: #ffffff;
        }

        @media (max-width: 768px) {
          .settings-page-grid {
            flex-direction: column;
          }
          .settings-sidebar {
            width: 100% !important;
          }
          .grid-logo-form {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
