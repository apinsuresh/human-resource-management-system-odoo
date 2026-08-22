import { useState, useEffect } from 'react';
import { type Employee, mockGetEmployeeById, mockUpdateEmployeeProfile, mockCreateEmployee, getStoredData } from '../mockApi';
import { showToast } from '../components/Toast';

interface ProfileProps {
  userId: string;
  userRole: string;
}

export default function Profile({ userId, userRole }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'onboard'>('profile');
  const [employee, setEmployee] = useState<Employee | null>(null);
  
  // Profile Edit States
  const [mobile, setMobile] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [residingAddress, setResidingAddress] = useState('');
  const [maritalStatus, setMaritalStatus] = useState<any>('SINGLE');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [panNo, setPanNo] = useState('');
  const [uanNo, setUanNo] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  
  // Onboarding Form States
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('Engineering');
  const [jobPosition, setJobPosition] = useState('');
  const [managerId, setManagerId] = useState('');
  const [location, setLocation] = useState('Bangalore');
  const [dob, setDob] = useState('');
  const [doj, setDoj] = useState(new Date().toISOString().split('T')[0]);
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  
  // Onboarding Results Modal
  const [onboardResult, setOnboardResult] = useState<{ name: string; loginId: string; tempPass: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<Employee[]>([]);

  // Unsaved changes guard
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [pendingTab, setPendingTab] = useState<'profile' | 'onboard' | null>(null);

  const fetchProfile = () => {
    try {
      const data = mockGetEmployeeById(userId, userRole as any, userId) as Employee;
      if (data) {
        setEmployee(data as Employee);
        setMobile(data.mobile);
        setPersonalEmail(data.personalEmail || '');
        setResidingAddress(data.residingAddress);
        setMaritalStatus(data.maritalStatus);
        setBankAccountNumber(data.bankAccountNumber || '');
        setBankName(data.bankName || '');
        setIfscCode(data.ifscCode || '');
        setPanNo(data.panNo || '');
        setUanNo(data.uanNo || '');
        setSkills(data.skills || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load profile.', 'error');
    }
  };

  useEffect(() => {
    fetchProfile();
    const employees = getStoredData<Employee>('hrms_employees');
    setManagers(employees.filter(e => e.role === 'ADMIN' || e.role === 'HR_OFFICER'));
  }, [userId, userRole]);

  // Tab switch guard: intercept tab clicks when dirty
  const handleTabClick = (tab: 'profile' | 'onboard') => {
    if (isDirty && tab !== activeTab) {
      setPendingTab(tab);
      setShowDiscardDialog(true);
    } else {
      setActiveTab(tab);
    }
  };

  const confirmDiscard = () => {
    setIsDirty(false);
    setShowDiscardDialog(false);
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      mockUpdateEmployeeProfile(userId, {
        mobile,
        personalEmail,
        residingAddress,
        maritalStatus,
        bankAccountNumber,
        bankName,
        ifscCode,
        panNo,
        uanNo,
        skills
      });
      setIsDirty(false);
      showToast('Profile updated successfully!', 'success');
      fetchProfile();
    } catch (err: any) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !jobPosition || !dob || !doj) {
      showToast('Please fill in all required onboarding fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const result = await mockCreateEmployee(userId as any, {
        firstName,
        lastName,
        email,
        department: dept,
        jobPosition,
        managerId: managerId || undefined,
        location,
        dateOfBirth: dob,
        dateOfJoining: doj,
        gender,
        employmentType
      } as any);

      setOnboardResult({
        name: `${firstName} ${lastName}`,
        loginId: result.loginId,
        tempPass: result.tempPassword
      });

      showToast('Employee onboarded successfully!', 'success');
      
      // Reset Form
      setFirstName('');
      setLastName('');
      setEmail('');
      setJobPosition('');
      setManagerId('');
      setDob('');
    } catch (err: any) {
      showToast(err.message || 'Onboarding failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size exceeds the 5 MB limit.', 'error');
        return;
      }
      
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        showToast('Only PDF, JPG, and PNG uploads are supported.', 'error');
        return;
      }

      showToast(`Resume "${file.name}" uploaded successfully! (Mocked)`, 'success');
    }
  };

  if (!employee) return <div className="page-container">Loading Profile...</div>;

  const showOnboardTab = userRole === 'ADMIN' || userRole === 'HR_OFFICER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Unsaved Changes Confirmation Dialog */}
      {showDiscardDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card glass-card" style={{ padding: '2rem', maxWidth: '420px', textAlign: 'center' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontWeight: 800 }}>Unsaved Changes</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>You have unsaved changes. If you leave now, your changes will be lost.</p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={() => { setShowDiscardDialog(false); setPendingTab(null); }} style={{ minHeight: '40px', minWidth: '100px' }}>Stay</button>
              <button type="button" className="btn btn-primary" onClick={confirmDiscard} style={{ minHeight: '40px', minWidth: '140px', background: 'var(--status-absent)' }}>Discard Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Subtab Navigation */}
      {showOnboardTab && (
        <div className="tab-navigation" style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', padding: '0.25rem', border: '1px solid var(--border-glass)', display: 'inline-flex', alignSelf: 'flex-start' }}>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => handleTabClick('profile')}
            style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            My Profile
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'onboard' ? 'active' : ''}`}
            onClick={() => handleTabClick('onboard')}
            style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Onboard Employee
          </button>
        </div>
      )}

      {activeTab === 'profile' ? (
        /* My Profile Form container wrapper */
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
          
          {/* Main Hero Identity glass card */}
          <div className="profile-hero-card">
            <div className="profile-hero-left">
              <div className="hero-avatar-wrapper">
                {employee.firstName.substring(0, 2).toUpperCase()}
                <div className="avatar-edit-badge" onClick={() => showToast('Profile avatar upload coming soon! (Mocked)', 'info')} title="Change Photo">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                </div>
              </div>

              <div className="hero-details-block">
                <h3>{employee.firstName} {employee.lastName}</h3>
                <span className="job-dept">{employee.jobPosition} • {employee.department}</span>
                
                <div className="hero-stats-row">
                  <div className="hero-stat-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                    <div className="hero-stat-pill-info">
                      <span>Login ID</span>
                      <strong>{employee.loginId}</strong>
                    </div>
                  </div>
                  <div className="hero-stat-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <div className="hero-stat-pill-info">
                      <span>Employee Code</span>
                      <strong>{employee.empCode}</strong>
                    </div>
                  </div>
                  <div className="hero-stat-pill">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <div className="hero-stat-pill-info">
                      <span>Date of Joining</span>
                      <strong>{employee.dateOfJoining}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Profile Submit Trigger */}
            <button 
              type="submit" 
              className="pagination-btn"
              style={{ width: 'auto', padding: '0 1.25rem', height: '38px', display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'white' }}
              disabled={loading}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
              {loading ? 'Saving...' : 'Edit Profile'}
            </button>
          </div>

          {/* Card 1: Contact & Personal Details */}
          <div className="card glass-card" style={{ textAlign: 'left' }}>
            <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <h3 style={{ fontSize: '1rem' }}>Contact & Personal Details</h3>
              </div>
            </div>

            <div className="grid-2">
              {/* Left Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="prof-mobile" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Mobile Number *</label>
                  <div className="input-icon-wrapper">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    <input 
                      type="tel" 
                      id="prof-mobile" 
                      className="form-control" 
                      style={{ minHeight: '38px', borderRadius: '8px' }}
                      value={mobile} 
                      onChange={(e) => { setMobile(e.target.value); setIsDirty(true); }} 
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="prof-address" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Residing Address *</label>
                  <div className="input-icon-wrapper" style={{ alignItems: 'flex-start' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ top: '12px' }} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <textarea 
                      id="prof-address" 
                      className="form-control" 
                      style={{ borderRadius: '8px', minHeight: '64px', paddingLeft: '2.5rem', paddingTop: '8px' }}
                      value={residingAddress} 
                      onChange={(e) => { setResidingAddress(e.target.value); setIsDirty(true); }} 
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="prof-marital" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Marital Status</label>
                  <div className="input-icon-wrapper">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                    <select 
                      id="prof-marital" 
                      className="form-control" 
                      style={{ minHeight: '38px', borderRadius: '8px' }}
                      value={maritalStatus} 
                      onChange={(e) => setMaritalStatus(e.target.value as any)}
                    >
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="prof-personal-email" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Personal Email *</label>
                  <div className="input-icon-wrapper">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <input 
                      type="email" 
                      id="prof-personal-email" 
                      className="form-control" 
                      style={{ minHeight: '38px', borderRadius: '8px' }}
                      value={personalEmail} 
                      onChange={(e) => setPersonalEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Official Email *</label>
                  <div className="input-icon-wrapper">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    <input type="text" className="form-control" style={{ minHeight: '38px', borderRadius: '8px', background: '#f8fafc', color: '#64748b' }} value={employee.email} disabled />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Bank Details (Encrypted at Rest) */}
          <div className="card glass-card" style={{ textAlign: 'left' }}>
            <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="22" width="20" height="2"></rect><path d="M20 20v-8H4v8M12 2L2 10h20L12 2z"></path></svg>
                <h3 style={{ fontSize: '1rem' }}>Bank Details (Encrypted at Rest)</h3>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label htmlFor="prof-bank-acc" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Account Number *</label>
                <div className="input-icon-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  <input 
                    type="text" 
                    id="prof-bank-acc" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    value={bankAccountNumber} 
                    onChange={(e) => setBankAccountNumber(e.target.value)} 
                    placeholder="Enter Account Number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prof-bank-name" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Bank Name *</label>
                <div className="input-icon-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="22" width="20" height="2"></rect><path d="M20 20v-8H4v8M12 2L2 10h20L12 2z"></path></svg>
                  <input 
                    type="text" 
                    id="prof-bank-name" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    value={bankName} 
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="Enter Bank Name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prof-ifsc" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>IFSC Code *</label>
                <div className="input-icon-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                  <input 
                    type="text" 
                    id="prof-ifsc" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    value={ifscCode} 
                    onChange={(e) => setIfscCode(e.target.value)}
                    placeholder="IFSC Code"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Statutory Identifiers */}
          <div className="card glass-card" style={{ textAlign: 'left' }}>
            <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                <h3 style={{ fontSize: '1rem' }}>Statutory Identifiers</h3>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="prof-pan" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>PAN Card Number *</label>
                <div className="input-icon-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  <input 
                    type="text" 
                    id="prof-pan" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    value={panNo} 
                    onChange={(e) => setPanNo(e.target.value)}
                    placeholder="10-digit PAN"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="prof-uan" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>UAN Number (PF) *</label>
                <div className="input-icon-wrapper">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <input 
                    type="text" 
                    id="prof-uan" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    value={uanNo} 
                    onChange={(e) => setUanNo(e.target.value)}
                    placeholder="12-digit UAN"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Skills and Resume Sections */}
          <div className="card glass-card" style={{ textAlign: 'left' }}>
            <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3>Skills & Resume Profile</h3>
            </div>

            <div className="form-group">
              <label htmlFor="skill-input" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Add Skills</label>
              <div className="skills-input-row" style={{ display: 'flex', gap: '0.5rem', marginTop: '0.35rem' }}>
                <input 
                  type="text" 
                  id="skill-input" 
                  className="form-control" 
                  style={{ minHeight: '36px', borderRadius: '8px' }}
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)} 
                  placeholder="e.g. React"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button type="button" className="pagination-btn" style={{ height: '36px', width: '100px' }} onClick={handleAddSkill}>
                  Add Tag
                </button>
              </div>

              <div className="skills-tag-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {skills.map((skill) => (
                  <span key={skill} className="skill-tag" style={{ background: 'rgba(37,99,235,0.06)', color: 'var(--accent-primary)', border: '1px solid rgba(37,99,235,0.1)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                    {skill}
                    <button type="button" className="skill-remove-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '0.9rem' }} onClick={() => handleRemoveSkill(skill)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.25rem' }}>
              <label htmlFor="resume-upload" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Upload Resume (PDF, JPG, PNG - Max 5 MB)</label>
              <input 
                type="file" 
                id="resume-upload" 
                className="form-control-file" 
                style={{ marginTop: '0.35rem' }}
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleResumeChange}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button 
                type="submit" 
                className="btn-submit-request" 
                style={{ height: '38px', minWidth: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile Details'}
              </button>
            </div>
          </div>

        </form>
      ) : (
        /* Employee Onboarding Form Container (Admin/HR Officer only) */
        <div className="card glass-card" style={{ textAlign: 'left' }}>
          <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3>Employee Onboarding Console</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Onboarding generates a system ID, assigns standard leave quotas (24 Paid / 7 Sick), and issues a temporary login password.</p>

          <form onSubmit={handleOnboardSubmit} className="onboard-form" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="onb-firstname">First Name *</label>
                <input 
                  type="text" 
                  id="onb-firstname" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="onb-lastname">Last Name *</label>
                <input 
                  type="text" 
                  id="onb-lastname" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="onb-email">Corporate Email Address *</label>
                <input 
                  type="email" 
                  id="onb-email" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="onb-gender">Gender *</label>
                <select 
                  id="onb-gender" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={gender} 
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label htmlFor="onb-dept">Department *</label>
                <select 
                  id="onb-dept" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={dept} 
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Operations">Operations</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="onb-position">Job Position *</label>
                <input 
                  type="text" 
                  id="onb-position" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  placeholder="e.g. Software Engineer"
                  value={jobPosition} 
                  onChange={(e) => setJobPosition(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="onb-manager">Reporting Manager</label>
                <select 
                  id="onb-manager" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={managerId} 
                  onChange={(e) => setManagerId(e.target.value)}
                >
                  <option value="">No Manager (Independent)</option>
                  {managers.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName} ({m.empCode})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label htmlFor="onb-dob">Date of Birth *</label>
                <input 
                  type="date" 
                  id="onb-dob" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="onb-doj">Joining Date *</label>
                <input 
                  type="date" 
                  id="onb-doj" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={doj} 
                  onChange={(e) => setDoj(e.target.value)} 
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="onb-loc">Office Location</label>
                <input 
                  type="text" 
                  id="onb-loc" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)} 
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="onb-employmenttype">Employment Type *</label>
                <select 
                  id="onb-employmenttype" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                  value={employmentType} 
                  onChange={(e) => setEmploymentType(e.target.value)}
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="onb-companyname">Company Name</label>
                <input 
                  id="onb-companyname"
                  type="text" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px', background: '#f8fafc' }}
                  value="Odoo Technologies" 
                  disabled
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button 
                type="submit" 
                className="btn-submit-request" 
                style={{ height: '38px', width: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }} 
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Onboard Employee'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Onboarding success credentials credentials modal */}
      {onboardResult && (
        <>
          <div className="profile-drawer" role="dialog" aria-modal="true" style={{ zIndex: 300, padding: '2rem', maxWidth: '460px', height: 'auto', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '16px', textAlign: 'left' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--status-present)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
               Account Created Successfully
            </h3>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              The system profile for <strong>{onboardResult.name}</strong> has been initialized. Share these temporary login details:
            </p>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-glass)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Login ID (System Generated)</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <strong style={{ fontSize: '0.95rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{onboardResult.loginId}</strong>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ minHeight: '26px', fontSize: '0.75rem', padding: '0 0.5rem', width: 'auto' }}
                    onClick={() => {
                      navigator.clipboard.writeText(onboardResult.loginId);
                      showToast('Login ID copied to clipboard.', 'success');
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
              <div style={{ borderTop: '1px dashed var(--border-glass)', margin: '0.25rem 0' }} />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', fontWeight: 'bold' }}>Temporary Password</span>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <strong style={{ fontSize: '0.95rem', fontFamily: 'monospace', color: 'var(--text-primary)' }}>{onboardResult.tempPass}</strong>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ minHeight: '26px', fontSize: '0.75rem', padding: '0 0.5rem', width: 'auto' }}
                    onClick={() => {
                      navigator.clipboard.writeText(onboardResult.tempPass);
                      showToast('Temporary password copied.', 'success');
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            <div className="reset-alert" style={{ background: 'rgba(239,68,68,0.03)', border: '1px solid rgba(239,68,68,0.1)', color: 'var(--status-leave)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.75rem', marginBottom: '1.25rem' }}>
              ️ Plaintext passwords will not be displayed again. Please copy or download credentials before closing this confirmation dialog.
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ height: '36px', fontSize: '0.8rem', padding: '0 0.75rem', width: 'auto' }}
                onClick={() => {
                  const text = `Odoo HRMS Onboarding Credentials\n` + 
                               `------------------------------------\n` + 
                               `Employee Name: ${onboardResult.name}\n` +
                               `Login ID: ${onboardResult.loginId}\n` +
                               `Temporary Password: ${onboardResult.tempPass}\n` +
                               `Portal Link: ${window.location.origin}\n`;
                  const element = document.createElement("a");
                  const file = new Blob([text], {type: 'text/plain'});
                  element.href = URL.createObjectURL(file);
                  element.download = `${onboardResult.name.toLowerCase().replace(/ /g, '_')}_credentials.txt`;
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  showToast('Credentials text file downloaded.', 'success');
                }}
              >
                Download Credentials
              </button>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ height: '36px', fontSize: '0.8rem', padding: '0 0.75rem', width: 'auto' }}
                onClick={() => {
                  showToast('Activation link and credentials sent to employee corporate email.', 'success');
                }}
              >
                Send Credentials
              </button>
              <button 
                type="button" 
                className="btn-submit-request"
                style={{ height: '36px', width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                onClick={() => setOnboardResult(null)}
              >
                Close
              </button>
            </div>
          </div>
          <div className="drawer-backdrop" onClick={() => setOnboardResult(null)} style={{ zIndex: 250 }} />
        </>
      )}

    </div>
  );
}
