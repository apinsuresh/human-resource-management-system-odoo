import { useState, useEffect } from 'react';
import { 
  type Employee, 
  getStoredData, 
  mockGetDailyAttendanceSummary 
} from '../mockApi';
import { showToast } from '../components/Toast';

interface EmployerViewProps {
  onLogout?: () => void;
}

export default function EmployerView(_props: EmployerViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dailyStatusList, setDailyStatusList] = useState<any[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<any[]>([]);
  
  // Employer Configuration settings states
  const [companyName, setCompanyName] = useState('Odoo Technologies');
  const [companyEmail, setCompanyEmail] = useState('info@odoo.com');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [address, setAddress] = useState('123, Business Park, Coimbatore, Tamil Nadu, India - 641001');
  const [companySize, setCompanySize] = useState('101-200');
  
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [activeEmployerTab, setActiveEmployerTab] = useState<'analytics' | 'settings'>('analytics');

  // Load database statistics
  const loadData = () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const emps = getStoredData<Employee>('hrms_employees') || [];
      setEmployees(emps);

      const statusData = mockGetDailyAttendanceSummary('HR_OFFICER', todayStr);
      setDailyStatusList(statusData);

      const salaries = getStoredData<any>('sa_salaries') || [];
      setSalaryRecords(salaries);

      // Load company details
      const company = JSON.parse(localStorage.getItem('hrms_company_settings') || 'null');
      if (company) {
        setCompanyName(company.companyName || 'Odoo Technologies');
        setCompanyEmail(company.companyEmail || 'info@odoo.com');
        setPhoneNumber(company.phoneNumber || '+91 98765 43210');
        setAddress(company.address || '123, Business Park, Coimbatore, Tamil Nadu, India - 641001');
        setCompanySize(company.companySize || '101-200');
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('hrms-attendance-update', loadData);
    return () => window.removeEventListener('hrms-attendance-update', loadData);
  }, []);

  // Save modified company configs
  const handleSaveCompanyDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !companyEmail.trim()) {
      showToast('Company Name and Email are required.', 'error');
      return;
    }
    
    try {
      localStorage.setItem('hrms_company_settings', JSON.stringify({
        name: companyName,
        email: companyEmail,
        phone: phoneNumber,
        address,
        size: companySize
      }));
      setIsFormDirty(false);
      showToast('Employer configuration committed successfully.', 'success');
      
      // Dispatch status updates
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err: any) {
      showToast(err.message || 'Save failed.', 'error');
    }
  };

  // 1. Calculate payroll sum
  const totalPayrollPaise = salaryRecords.reduce((sum, s) => sum + (s.wageAmount || 0), 0);
  const totalPayrollRupees = totalPayrollPaise / 100;

  // 2. Department distribution calculations
  const deptCounts = employees.reduce((acc: Record<string, number>, e) => {
    acc[e.department] = (acc[e.department] || 0) + 1;
    return acc;
  }, {});

  // Department salaries calculations
  const deptSalaries = employees.reduce((acc: Record<string, number>, e) => {
    const sal = salaryRecords.find(s => s.employeeId === e.id);
    const amt = sal ? sal.wageAmount / 100 : 50000; // default to 50k
    acc[e.department] = (acc[e.department] || 0) + amt;
    return acc;
  }, {});

  const totalPresentCount = dailyStatusList.filter(s => s.status === 'PRESENT').length;
  const totalOnLeaveCount = dailyStatusList.filter(s => s.status === 'ON_LEAVE').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.5rem', textAlign: 'left' }}>
      
      {/* Workspace Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Good Morning, Executive Team! </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>
            Here is your strategic business analytics and cost center overview.
          </p>
        </div>
        
        {/* Subtabs Toggle */}
        <div className="tab-navigation" style={{ background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', padding: '0.25rem', border: '1px solid var(--border-glass)', display: 'inline-flex' }}>
          <button 
            type="button" 
            className={`tab-btn ${activeEmployerTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveEmployerTab('analytics')}
            style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
             Analytics Console
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeEmployerTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveEmployerTab('settings')}
            style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            ️ Employer Settings
          </button>
        </div>
      </div>

      {activeEmployerTab === 'analytics' ? (
        <>
          {/* Executive Dashboard KPIs row */}
          <div className="grid-5" style={{ gap: '1rem' }}>
            <div className="card glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Total Headcount</span>
              <strong style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem' }}>{employees.length}</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--status-present)' }}> +12.4% this quarter</span>
            </div>
            
            <div className="card glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Attendance Rate</span>
              <strong style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem' }}>94.8%</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>● {totalPresentCount} Present today</span>
            </div>

            <div className="card glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>On Approved Leave</span>
              <strong style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem' }}>{totalOnLeaveCount}</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)' }}> Active time-off request logs</span>
            </div>

            <div className="card glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Monthly Wage Cost</span>
              <strong style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem' }}>
                ₹{(totalPayrollRupees / 100000).toFixed(2)}L
              </strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Gross salary liability</span>
            </div>

            <div className="card glass-card" style={{ padding: '1.25rem', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block', textTransform: 'uppercase' }}>Open Positions</span>
              <strong style={{ fontSize: '1.75rem', display: 'block', marginTop: '0.25rem' }}>8</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Active recruitment plans</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem' }}>
            
            {/* Left: Cost center allocations + Org trees */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Cost Center allocations card */}
              <div className="card glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                  Department Wage Allocation & Distribution
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Object.keys(deptSalaries).map((dept) => {
                    const sal = deptSalaries[dept];
                    const percent = Math.round((sal / (totalPayrollRupees || 1)) * 100);
                    return (
                      <div key={dept}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                          <span>{dept} ({deptCounts[dept] || 0} emps)</span>
                          <span>₹{sal.toLocaleString()} ({percent}%)</span>
                        </div>
                        <div className="progress-container-bar" style={{ height: '8px' }}>
                          <div 
                            className="progress-filler-bar" 
                            style={{ 
                              width: `${percent}%`, 
                              background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)' 
                            }} 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Organization chart tree */}
              <div className="card glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                  Organization Hierarchy Chart
                </h3>

                <div style={{ paddingLeft: '1rem', borderLeft: '2px dashed var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', maxWidth: '280px' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 'bold', display: 'block' }}>MANAGING DIRECTOR</span>
                    <strong style={{ fontSize: '0.85rem' }}>Executive Director</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block' }}>Leadership department</span>
                  </div>

                  <div style={{ paddingLeft: '1.5rem', borderLeft: '2px dashed var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.25rem' }}>
                    
                    <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', maxWidth: '240px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>IT ADMIN</span>
                      <strong style={{ fontSize: '0.8rem' }}>System Admin</strong>
                    </div>

                    <div style={{ background: '#ffffff', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)', maxWidth: '240px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 'bold', display: 'block' }}>HR MANAGER</span>
                      <strong style={{ fontSize: '0.8rem' }}>HR Officer</strong>
                      
                      <div style={{ paddingLeft: '1rem', borderLeft: '2px dashed var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <div style={{ background: '#f8fafc', padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', maxWidth: '200px' }}>
                          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', display: 'block' }}>SOFTWARE ENGINEER</span>
                          <strong style={{ fontSize: '0.75rem' }}>Anita Rao</strong>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

            </div>

            {/* Right column: Goals tracking + strategic metrics */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Strategic initiatives goal tracker */}
              <div className="card glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                  Company Strategic Goals
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ background: 'rgba(37,99,235,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      <span>Increase Employee Retention</span>
                      <span style={{ color: 'var(--status-present)' }}>82%</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Status: On Track • Owner: HR Team</span>
                    <div className="progress-container-bar" style={{ height: '4px' }}>
                      <div className="progress-filler-bar" style={{ width: '82%', background: 'var(--status-present)' }} />
                    </div>
                  </div>

                  <div style={{ background: 'rgba(37,99,235,0.03)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(37,99,235,0.08)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      <span>Engineering Team Scaleup</span>
                      <span style={{ color: 'var(--accent-primary)' }}>60%</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Status: In Progress • Owner: VP Eng</span>
                    <div className="progress-container-bar" style={{ height: '4px' }}>
                      <div className="progress-filler-bar" style={{ width: '60%', background: 'var(--accent-primary)' }} />
                    </div>
                  </div>

                  <div style={{ background: 'rgba(16,185,129,0.04)', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>
                      <span>Optimize Operational Overheads</span>
                      <span style={{ color: 'var(--status-present)' }}>Met</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>Status: Complete • Owner: Operations</span>
                    <div className="progress-container-bar" style={{ height: '4px' }}>
                      <div className="progress-filler-bar" style={{ width: '100%', background: 'var(--status-present)' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Workforce insights */}
              <div className="card glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 1rem 0', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                  Predictive Workforce Insights
                </h3>
                
                <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--text-secondary)' }}>
                  <li>
                    <strong>Retention forecast:</strong> Attrition risk index is low (approx 4.2% forecasted for the next two quarters).
                  </li>
                  <li>
                    <strong>Budget Planning:</strong> Departmental salaries match the Q3 cost center projections.
                  </li>
                  <li>
                    <strong>Leaves Analytics:</strong> Leave rate spikes in December (festive cycle) and requires project staffing schedules.
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </>
      ) : (
        /* ️ EMPLOYER SETTINGS COMPONENT (Section 39/40) */
        <div className="card glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: '0 0 1.25rem 0', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
            Employer Details & Core System Configurations
          </h3>

          <form onSubmit={handleSaveCompanyDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="grid-2">
              <div className="form-group">
                <label htmlFor="comp-name">Company Name *</label>
                <input 
                  type="text" 
                  id="comp-name"
                  className="form-control" 
                  value={companyName} 
                  onChange={(e) => { setCompanyName(e.target.value); setIsFormDirty(true); }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="comp-email">Company Email *</label>
                <input 
                  type="email" 
                  id="comp-email"
                  className="form-control" 
                  value={companyEmail} 
                  onChange={(e) => { setCompanyEmail(e.target.value); setIsFormDirty(true); }}
                  required
                />
              </div>
            </div>

            <div className="grid-3">
              <div className="form-group">
                <label htmlFor="comp-phone">Contact Phone</label>
                <input 
                  type="text" 
                  id="comp-phone"
                  className="form-control" 
                  value={phoneNumber} 
                  onChange={(e) => { setPhoneNumber(e.target.value); setIsFormDirty(true); }}
                />
              </div>

              <div className="form-group">
                <label htmlFor="comp-size">Company Size</label>
                <select 
                  id="comp-size"
                  className="form-control"
                  value={companySize} 
                  onChange={(e) => { setCompanySize(e.target.value); setIsFormDirty(true); }}
                >
                  <option value="1-50">1-50 Employees</option>
                  <option value="51-100">51-100 Employees</option>
                  <option value="101-200">101-200 Employees</option>
                  <option value="201-500">201-500 Employees</option>
                </select>
              </div>

              <div className="form-group">
                <label>Industry Vertical</label>
                <input type="text" className="form-control" value="Technology & SaaS" disabled style={{ background: '#f8fafc' }} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comp-addr">Establishment Office Address</label>
              <textarea 
                id="comp-addr"
                className="form-control" 
                rows={3} 
                value={address} 
                onChange={(e) => { setAddress(e.target.value); setIsFormDirty(true); }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
              {isFormDirty && (
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ minHeight: '40px', width: '120px' }}
                  onClick={() => {
                    loadData();
                    setIsFormDirty(false);
                    showToast('Changes discarded.', 'info');
                  }}
                >
                  Discard
                </button>
              )}
              <button 
                type="submit" 
                className="btn btn-primary"
                style={{ minHeight: '40px', width: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
              >
                Save Core Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .grid-5 {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
        }
        .hero-weather-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.5rem;
        }
        @media (max-width: 1024px) {
          .grid-5 {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 768px) {
          .grid-5 {
            grid-template-columns: 1fr;
          }
          div[style*="gridTemplateColumns: 1.6fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
