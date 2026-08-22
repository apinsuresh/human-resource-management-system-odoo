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
  
  // Onboarding Results Modal
  const [onboardResult, setOnboardResult] = useState<{ loginId: string; tempPass: string } | null>(null);

  const [loading, setLoading] = useState(false);
  const [managers, setManagers] = useState<Employee[]>([]);

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
    // Load other employees as potential managers
    const employees = getStoredData<Employee>('hrms_employees');
    setManagers(employees.filter(e => e.role === 'ADMIN' || e.role === 'HR_OFFICER'));
  }, [userId, userRole]);

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
      const result = await mockCreateEmployee(userId, {
        firstName,
        lastName,
        email,
        mobile: '',
        department: dept,
        jobPosition,
        managerId: managerId || undefined,
        companyId: 'OI-UUID',
        location,
        dateOfBirth: dob,
        dateOfJoining: doj,
        residingAddress: 'TBD',
        gender,
        nationality: 'Indian',
        maritalStatus: 'SINGLE',
        bankAccountNumber: '',
        bankName: '',
        ifscCode: '',
        skills: [],
        certifications: [],
        role: 'EMPLOYEE'
      });

      showToast('Employee created successfully!', 'success');
      setOnboardResult({ loginId: result.loginId, tempPass: result.tempPassword });
      
      // Reset form
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

  // Mock Resume file upload handler
  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      // Size limit: 5MB
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size exceeds the 5 MB limit.', 'error');
        return;
      }
      
      // Type limit: PDF/JPG/PNG
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
    <div className="page-container">
      {/* Tabs */}
      {showOnboardTab && (
        <div className="tab-navigation">
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            👤 My Profile
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeTab === 'onboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('onboard')}
          >
            ➕ Onboard Employee
          </button>
        </div>
      )}

      {activeTab === 'profile' ? (
        /* My Profile Form */
        <div className="card">
          <div className="profile-hero">
            <div className="profile-avatar">
              {employee.firstName.substring(0, 2).toUpperCase()}
            </div>
            <div className="profile-details-title">
              <h2>{employee.firstName} {employee.lastName}</h2>
              <p>{employee.jobPosition} • {employee.department}</p>
              <div className="details-joining-id">
                <span><strong>Login ID:</strong> {employee.loginId}</span>
                <span><strong>Employee Code:</strong> {employee.empCode}</span>
                <span><strong>Date of Joining:</strong> {employee.dateOfJoining}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="profile-form">
            <div className="section-title">Contact & Personal Details</div>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="prof-mobile">Mobile Number</label>
                <input 
                  type="tel" 
                  id="prof-mobile" 
                  className="form-control" 
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-personal-email">Personal Email</label>
                <input 
                  type="email" 
                  id="prof-personal-email" 
                  className="form-control" 
                  value={personalEmail} 
                  onChange={(e) => setPersonalEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="prof-address">Residing Address</label>
              <textarea 
                id="prof-address" 
                className="form-control text-area" 
                value={residingAddress} 
                onChange={(e) => setResidingAddress(e.target.value)} 
                required
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="prof-marital">Marital Status</label>
                <select 
                  id="prof-marital" 
                  className="form-control" 
                  value={maritalStatus} 
                  onChange={(e) => setMaritalStatus(e.target.value as any)}
                >
                  <option value="SINGLE">Single</option>
                  <option value="MARRIED">Married</option>
                  <option value="DIVORCED">Divorced</option>
                  <option value="WIDOWED">Widowed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Official Email</label>
                <input type="text" className="form-control" value={employee.email} disabled />
              </div>
            </div>

            <div className="section-title">Bank Details (Encrypted at Rest)</div>
            <div className="grid-3">
              <div className="form-group">
                <label htmlFor="prof-bank-acc">Account Number</label>
                <input 
                  type="text" 
                  id="prof-bank-acc" 
                  className="form-control" 
                  value={bankAccountNumber} 
                  onChange={(e) => setBankAccountNumber(e.target.value)} 
                  placeholder="Enter Account Number"
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-bank-name">Bank Name</label>
                <input 
                  type="text" 
                  id="prof-bank-name" 
                  className="form-control" 
                  value={bankName} 
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="Enter Bank Name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-ifsc">IFSC Code</label>
                <input 
                  type="text" 
                  id="prof-ifsc" 
                  className="form-control" 
                  value={ifscCode} 
                  onChange={(e) => setIfscCode(e.target.value)}
                  placeholder="IFSC Code"
                />
              </div>
            </div>

            <div className="section-title">Statutory Identifiers</div>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="prof-pan">PAN Card Number</label>
                <input 
                  type="text" 
                  id="prof-pan" 
                  className="form-control" 
                  value={panNo} 
                  onChange={(e) => setPanNo(e.target.value)}
                  placeholder="10-digit PAN"
                />
              </div>
              <div className="form-group">
                <label htmlFor="prof-uan">UAN Number (PF)</label>
                <input 
                  type="text" 
                  id="prof-uan" 
                  className="form-control" 
                  value={uanNo} 
                  onChange={(e) => setUanNo(e.target.value)}
                  placeholder="12-digit UAN"
                />
              </div>
            </div>

            <div className="section-title">Skills & Resume</div>
            <div className="form-group">
              <label htmlFor="skill-input">Add Skills</label>
              <div className="skills-input-row">
                <input 
                  type="text" 
                  id="skill-input" 
                  className="form-control" 
                  value={newSkill} 
                  onChange={(e) => setNewSkill(e.target.value)} 
                  placeholder="e.g. React"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                />
                <button type="button" className="btn btn-secondary" onClick={handleAddSkill}>
                  Add Tag
                </button>
              </div>
              <div className="skills-tag-list">
                {skills.map((skill) => (
                  <span key={skill} className="skill-tag">
                    {skill}
                    <button type="button" className="skill-remove-btn" onClick={() => handleRemoveSkill(skill)}>
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="resume-upload">Upload Resume (PDF, JPG, PNG - Max 5 MB)</label>
              <input 
                type="file" 
                id="resume-upload" 
                className="form-control-file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleResumeChange}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      ) : (
        /* Onboard Employee Form */
        <div className="card">
          <h3>Employee Onboarding</h3>
          <p className="onboard-desc">Onboarding generates a system ID, assigns standard leave quotas (24 Paid / 7 Sick), and issues a temporary login password.</p>

          <form onSubmit={handleOnboardSubmit} className="onboard-form">
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="onb-firstname">First Name *</label>
                <input 
                  type="text" 
                  id="onb-firstname" 
                  className="form-control" 
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
                  value={gender} 
                  onChange={(e) => setGender(e.target.value as any)}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="onb-dept">Department *</label>
                <select 
                  id="onb-dept" 
                  className="form-control" 
                  value={dept} 
                  onChange={(e) => setDept(e.target.value)}
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Finance">Finance</option>
                  <option value="Operations">Operations</option>
                  <option value="Sales">Sales</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="onb-position">Job Position *</label>
                <input 
                  type="text" 
                  id="onb-position" 
                  className="form-control" 
                  placeholder="e.g. Frontend Engineer" 
                  value={jobPosition} 
                  onChange={(e) => setJobPosition(e.target.value)} 
                  required
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="onb-manager">Manager</label>
                <select 
                  id="onb-manager" 
                  className="form-control" 
                  value={managerId} 
                  onChange={(e) => setManagerId(e.target.value)}
                >
                  <option value="">No Manager (Reporting Officer)</option>
                  {managers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} ({m.jobPosition})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="onb-location">Working Location</label>
                <input 
                  type="text" 
                  id="onb-location" 
                  className="form-control" 
                  value={location} 
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="onb-dob">Date of Birth *</label>
                <input 
                  type="date" 
                  id="onb-dob" 
                  className="form-control" 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)} 
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="onb-doj">Date of Joining *</label>
                <input 
                  type="date" 
                  id="onb-doj" 
                  className="form-control" 
                  value={doj} 
                  onChange={(e) => setDoj(e.target.value)} 
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Registering employee...' : 'Onboard Employee'}
            </button>
          </form>
        </div>
      )}

      {/* Onboarding Credentials Results Dialog */}
      {onboardResult && (
        <dialog className="credentials-dialog" open>
          <div className="cred-dialog-content">
            <h4>🎉 Employee Registered Successfully!</h4>
            <p>Please copy these login credentials and send them safely to the employee. They will be forced to change their password on first login.</p>
            
            <div className="cred-box">
              <div><strong>Login ID:</strong> <code>{onboardResult.loginId}</code></div>
              <div><strong>Temporary Password:</strong> <code>{onboardResult.tempPass}</code></div>
            </div>
            
            <button 
              type="button" 
              className="btn btn-primary"
              onClick={() => setOnboardResult(null)}
            >
              Done & Close
            </button>
          </div>
        </dialog>
      )}

      <style>{`
        .tab-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }

        .tab-btn {
          background: none;
          border: none;
          font-family: var(--font-heading);
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-secondary);
          padding: 0.5rem 1rem;
          cursor: pointer;
          border-bottom: 3px solid transparent;
          transition: all var(--transition-speed);
        }

        .tab-btn:hover {
          color: var(--text-primary);
        }

        .tab-btn.active {
          color: var(--accent-primary);
          border-bottom-color: var(--accent-primary);
        }

        .profile-hero {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 2rem;
        }

        .profile-avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: var(--accent-primary);
          color: white;
          font-size: 2rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-details-title h2 {
          font-size: 1.6rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
        }

        .profile-details-title p {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 1rem;
          margin-bottom: 0.75rem;
        }

        .details-joining-id {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .details-joining-id strong {
          color: var(--text-primary);
        }

        .section-title {
          font-family: var(--font-heading);
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 2rem 0 1rem 0;
          padding-bottom: 0.25rem;
          border-bottom: 1.5px solid var(--border-color);
        }

        .text-area {
          min-height: 90px;
          resize: vertical;
        }

        .skills-input-row {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .skills-tag-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .skill-tag {
          background-color: var(--accent-light);
          color: var(--accent-primary);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 6px;
          padding: 0.25rem 0.6rem;
          font-size: 0.85rem;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
        }

        .skill-remove-btn {
          background: none;
          border: none;
          color: var(--accent-primary);
          font-weight: bold;
          font-size: 1rem;
          cursor: pointer;
          line-height: 1;
        }

        .form-control-file {
          padding: 0.5rem 0;
        }

        .onboard-desc {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .credentials-dialog {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 2rem;
          background-color: var(--bg-card);
          box-shadow: var(--shadow-premium);
          z-index: 1000;
          max-width: 450px;
          width: 90%;
        }

        .cred-dialog-content h4 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
          color: var(--status-present);
        }

        .cred-dialog-content p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }

        .cred-box {
          background-color: var(--bg-app);
          border: 1.5px dashed var(--border-color);
          border-radius: 8px;
          padding: 1rem;
          font-family: var(--font-body);
          font-size: 0.95rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .cred-box code {
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 0.1rem 0.5rem;
          border-radius: 4px;
          font-size: 1rem;
          color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}
