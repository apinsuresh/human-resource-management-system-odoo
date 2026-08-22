import { useState, useEffect } from 'react';
import { 
  type Employee, 
  type SalaryConfig, 
  mockGetEmployees, 
  mockGetSalaryConfig, 
  mockUpdateSalaryConfig, 
  mockGetPayableDaysSummary
} from '../mockApi';
import { showToast } from '../components/Toast';

interface PayrollViewProps {
  userRole: string;
}

export default function PayrollView({ userRole }: PayrollViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [salaryConfig, setSalaryConfig] = useState<SalaryConfig | null>(null);
  
  // Wage input states (in Rupees for UI, converted to paise for API)
  const [monthlyWage, setMonthlyWage] = useState('');
  const [loading, setLoading] = useState(false);

  // Payslip generation states
  const [payslipMonth, setPayslipMonth] = useState(new Date().getMonth());
  const [payslipYear, setPayslipYear] = useState(new Date().getFullYear());
  const [payableDaysDetails, setPayableDaysDetails] = useState<any | null>(null);
  const [generatedPayslip, setGeneratedPayslip] = useState<any | null>(null);

  useEffect(() => {
    if (userRole === 'ADMIN') {
      const emps = mockGetEmployees('ADMIN', false) as Employee[];
      setEmployees(emps);
      if (emps.length > 0) {
        setSelectedEmpId(emps[0].id);
      }
    }
  }, [userRole]);

  const loadSalaryConfig = () => {
    if (!selectedEmpId) return;
    try {
      const config = mockGetSalaryConfig(userRole as any, selectedEmpId);
      setSalaryConfig(config);
      if (config) {
        setMonthlyWage(String(config.wageAmount / 100)); // convert paise to Rupees
      } else {
        setMonthlyWage('0');
      }
      setGeneratedPayslip(null);
      setPayableDaysDetails(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to load salary config.', 'error');
    }
  };

  useEffect(() => {
    loadSalaryConfig();
  }, [selectedEmpId]);

  const handleUpdateWage = async (e: React.FormEvent) => {
    e.preventDefault();
    const wageInRs = parseFloat(monthlyWage);
    if (isNaN(wageInRs) || wageInRs < 0) {
      showToast('Wage must be a valid positive amount.', 'error');
      return;
    }

    const wageInPaise = Math.round(wageInRs * 100);

    setLoading(true);
    try {
      const updated = await mockUpdateSalaryConfig(userRole as any, selectedEmpId, wageInPaise);
      setSalaryConfig(updated);
      showToast('Salary configuration updated and components recalculated!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to save wage details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCalculatePayableDays = () => {
    if (!selectedEmpId) return;
    try {
      const summary = mockGetPayableDaysSummary(selectedEmpId, payslipMonth, payslipYear);
      setPayableDaysDetails(summary);
      setGeneratedPayslip(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to calculate payable days.', 'error');
    }
  };

  const handleGeneratePayslip = () => {
    if (!salaryConfig || !payableDaysDetails) return;

    const workingDays = payableDaysDetails.totalWorkingDays;
    const payable = payableDaysDetails.payableDays;
    
    if (workingDays === 0) {
      showToast('Cannot generate payslip for a month with 0 working days.', 'error');
      return;
    }

    const prorationRatio = payable / workingDays;
    const baseWage = salaryConfig.wageAmount;
    const proratedWage = Math.round(baseWage * prorationRatio);

    const proratedComponents = salaryConfig.components.map((comp) => ({
      ...comp,
      computedAmount: Math.round(comp.computedAmount * prorationRatio),
    }));

    const basicComp = proratedComponents.find(c => c.name === 'BASIC');
    const basicAmount = basicComp ? basicComp.computedAmount : 0;
    
    const pfEmployee = Math.round(basicAmount * salaryConfig.pfEmployeeRate);
    const pfEmployer = Math.round(basicAmount * salaryConfig.pfEmployerRate);
    const pt = payable > 0 ? salaryConfig.professionalTax : 0;

    const totalDeductions = pfEmployee + pt;
    const netSalary = proratedWage - totalDeductions;

    setGeneratedPayslip({
      month: payslipMonth,
      year: payslipYear,
      baseWage,
      proratedWage,
      components: proratedComponents,
      pfEmployee,
      pfEmployer,
      professionalTax: pt,
      totalDeductions,
      netSalary,
      payableDays: payable,
      workingDays
    });

    showToast('Payslip generated successfully!', 'success');
  };

  const formatCurrency = (paise: number) => {
    return `₹ ${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMonthName = (monthIdx: number) => {
    return new Date(2026, monthIdx, 1).toLocaleString('default', { month: 'long' });
  };

  if (userRole !== 'ADMIN') {
    return (
      <div className="page-container">
        <div className="card glass-card error-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>🚫</span>
          <h3>403 Access Forbidden</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>You do not have administrative permissions to view or edit payroll configuration settings.</p>
        </div>
      </div>
    );
  }

  const activeEmployee = employees.find(e => e.id === selectedEmpId);
  const totalFixedPayRaw = salaryConfig ? salaryConfig.wageAmount : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Title Breadcrumbs */}
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Base Salary Setup</h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem', fontWeight: 'bold' }}>
          Payroll &gt; Base Salary Setup
        </span>
      </div>

      <form onSubmit={handleUpdateWage} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
        
        {/* Card 1: Select Employee */}
        <div className="card glass-card" style={{ display: 'flex', padding: '1.5rem 2rem', justifyContent: 'space-between', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '280px', textAlign: 'left' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              1. Select Employee
            </h3>
            
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="emp-picker" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                Choose Employee *
              </label>
              <select 
                id="emp-picker" 
                className="form-control"
                style={{ minHeight: '38px', borderRadius: '8px' }}
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName} ({e.loginId})
                  </option>
                ))}
              </select>
            </div>

            {activeEmployee && (
              <div className="hero-stats-row" style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                <div className="hero-stat-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <div className="hero-stat-pill-info">
                    <span>Role</span>
                    <strong>{activeEmployee.role === 'ADMIN' ? 'Admin' : activeEmployee.role === 'HR_OFFICER' ? 'HR Officer' : 'Employee'}</strong>
                  </div>
                </div>
                <div className="hero-stat-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <div className="hero-stat-pill-info">
                    <span>Department</span>
                    <strong>{activeEmployee.department}</strong>
                  </div>
                </div>
                <div className="hero-stat-pill">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <div className="hero-stat-pill-info">
                    <span>Joining Date</span>
                    <strong>{activeEmployee.dateOfJoining}</strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Setup Base illustration */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: '320px' }}>
            <div style={{ textAlign: 'left', maxWidth: '180px' }}>
              <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                Setup base salary and components
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                Configure the employee's base salary and allowances for payroll processing.
              </span>
            </div>
            <div className="illustration-rupee-plant">
              <svg width="90" height="90" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.95 }} aria-hidden="true">
                <rect x="50" y="20" width="45" height="60" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2.5" />
                <line x1="60" y1="36" x2="85" y2="36" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="60" y1="46" x2="78" y2="46" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="60" y1="56" x2="85" y2="56" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
                <circle cx="45" cy="80" r="18" fill="#2563EB" />
                <text x="45" y="86" fill="#FFFFFF" fontSize="18" fontWeight="bold" textAnchor="middle" fontFamily="var(--font-heading)">₹</text>
                <path d="M22 100c4-8 12-10 18-6-4 8-12 10-18 6z" fill="#34D399" opacity="0.8" />
                <path d="M102 85c-4-8-12-10-18-6 4 8 12 10 18 6z" fill="#6366F1" opacity="0.6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 2: Base Salary & Components */}
        <div className="card glass-card" style={{ padding: '1.5rem 2rem', textAlign: 'left' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            2. Base Salary & Components
          </h3>

          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="pay-frequency" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Pay Frequency</label>
              <select id="pay-frequency" className="form-control" style={{ minHeight: '38px', borderRadius: '8px' }} defaultValue="Monthly">
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="base-wage-rs" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Base Salary (₹) *</label>
              <div className="input-icon-wrapper">
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>₹</span>
                <input 
                  type="number" 
                  id="base-wage-rs" 
                  className="form-control" 
                  style={{ minHeight: '38px', borderRadius: '8px', paddingLeft: '2.2rem' }}
                  value={monthlyWage}
                  onChange={(e) => setMonthlyWage(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="effective-date" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Effective From *</label>
              <input 
                type="date" 
                id="effective-date" 
                className="form-control" 
                style={{ minHeight: '38px', borderRadius: '8px' }} 
                defaultValue="2025-05-01"
              />
            </div>
          </div>

          {/* Salary Components Table */}
          {salaryConfig && salaryConfig.wageAmount > 0 ? (
            <div className="components-table-section" style={{ marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 'bold' }}>
                Salary Components
              </h4>
              
              <div className="table-responsive">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>COMPONENT NAME</th>
                      <th>TYPE</th>
                      <th>AMOUNT (₹)</th>
                      <th style={{ textAlign: 'center' }}>TAXABLE</th>
                      <th style={{ textAlign: 'center' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryConfig.components.map((c) => (
                      <tr key={c.name}>
                        <td style={{ verticalAlign: 'middle' }}>
                          <svg width="12" height="18" viewBox="0 0 12 18" fill="none" style={{ color: '#94a3b8', cursor: 'grab' }} aria-hidden="true">
                            <circle cx="2" cy="3" r="1.2" fill="currentColor"/>
                            <circle cx="2" cy="9" r="1.2" fill="currentColor"/>
                            <circle cx="2" cy="15" r="1.2" fill="currentColor"/>
                            <circle cx="10" cy="3" r="1.2" fill="currentColor"/>
                            <circle cx="10" cy="9" r="1.2" fill="currentColor"/>
                            <circle cx="10" cy="15" r="1.2" fill="currentColor"/>
                          </svg>
                        </td>
                        <td><strong>{c.name.replace(/_/g, ' ')}</strong></td>
                        <td>
                          <select className="form-control" style={{ minHeight: '28px', padding: '0 0.5rem', width: '130px', fontSize: '0.8rem' }} aria-label="Component type">
                            <option>Allowance</option>
                            <option>Deduction</option>
                          </select>
                        </td>
                        <td>
                          <input 
                            type="text" 
                            className="form-control" 
                            style={{ minHeight: '28px', padding: '0 0.5rem', width: '120px', fontSize: '0.8rem' }} 
                            value={(c.computedAmount / 100).toFixed(2)}
                            readOnly
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <input type="checkbox" defaultChecked style={{ width: '15px', height: '15px' }} aria-label="Taxable" />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                            <button type="button" className="action-dots-btn" style={{ width: '26px', height: '26px', fontSize: '0.8rem' }} title="Edit" onClick={() => showToast('Editing component... (Mocked)', 'info')}>
                              ✎
                            </button>
                            <button type="button" className="action-dots-btn" style={{ width: '26px', height: '26px', fontSize: '0.8rem', color: 'var(--status-leave)' }} title="Delete" onClick={() => showToast('Deleting component... (Mocked)', 'info')}>
                              🗑
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Component button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                <button 
                  type="button" 
                  className="pagination-btn" 
                  style={{ width: 'auto', padding: '0 1rem', height: '34px', borderRadius: '8px', color: 'var(--accent-primary)', borderColor: 'rgba(37,99,235,0.2)' }}
                  onClick={() => showToast('Component addition coming soon! (Mocked)', 'info')}
                >
                  + Add Component
                </button>

                <div style={{ textAlign: 'right', fontSize: '0.95rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Fixed Pay: </span>
                  <strong style={{ color: 'var(--text-primary)', fontSize: '1.15rem', marginLeft: '6px' }}>
                    {formatCurrency(totalFixedPayRaw)}
                  </strong>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ padding: '2rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
              ⚠️ Choose an employee to populate configurations.
            </div>
          )}
        </div>

        {/* Form Submission Button */}
        <div style={{ overflow: 'hidden' }}>
          <button 
            type="submit" 
            className="btn-submit-request" 
            style={{ float: 'right', height: '40px', minWidth: '180px', display: 'flex', justifyContent: 'center' }} 
            disabled={loading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }} aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            {loading ? 'Recalculating...' : 'Save Configuration'}
          </button>
        </div>

      </form>

      {/* Payslip Processing Panel */}
      {salaryConfig && salaryConfig.wageAmount > 0 && (
        <div className="card glass-card" style={{ marginTop: '2rem', textAlign: 'left' }}>
          <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3>Payslip Processing Engine</h3>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Queries attendance and leave history to calculate total payable working days, generating prorated payslips.
          </p>

          <div className="grid-3" style={{ marginBottom: '1.5rem', alignItems: 'flex-end' }}>
            <div className="form-group">
              <label htmlFor="pay-month" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Select Pay Period Month</label>
              <select 
                id="pay-month" 
                className="form-control" 
                style={{ minHeight: '38px', borderRadius: '8px' }}
                value={payslipMonth}
                onChange={(e) => setPayslipMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }).map((_, idx) => (
                  <option key={idx} value={idx}>{getMonthName(idx)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="pay-year" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Select Year</label>
              <select 
                id="pay-year" 
                className="form-control" 
                style={{ minHeight: '38px', borderRadius: '8px' }}
                value={payslipYear}
                onChange={(e) => setPayslipYear(parseInt(e.target.value))}
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <button 
              type="button" 
              className="pagination-btn" 
              style={{ height: '38px', width: '220px', color: 'var(--accent-primary)', borderColor: 'rgba(37,99,235,0.2)' }} 
              onClick={handleCalculatePayableDays}
            >
              Calculate Payable Days
            </button>
          </div>

          {payableDaysDetails && (
            <div className="payable-days-summary" style={{ background: 'rgba(255,255,255,0.5)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-glass)', marginTop: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--text-primary)' }}>
                Payable Days Audit Summary for {getMonthName(payslipMonth)} {payslipYear}
              </h4>
              
              <div className="grid-4" style={{ marginBottom: '1.25rem' }}>
                <div className="employee-list-checkin" style={{ alignItems: 'flex-start', textAlign: 'left', borderRight: '1px solid var(--border-glass)', paddingRight: '1rem' }}>
                  <span>Working Days in Period</span>
                  <strong style={{ fontSize: '1.25rem' }}>{payableDaysDetails.totalWorkingDays} days</strong>
                </div>
                <div className="employee-list-checkin" style={{ alignItems: 'flex-start', textAlign: 'left', borderRight: '1px solid var(--border-glass)', paddingRight: '1rem' }}>
                  <span>Present Days logged</span>
                  <strong style={{ fontSize: '1.25rem' }}>{payableDaysDetails.presentDays} days</strong>
                </div>
                <div className="employee-list-checkin" style={{ alignItems: 'flex-start', textAlign: 'left', borderRight: '1px solid var(--border-glass)', paddingRight: '1rem' }}>
                  <span>Unpaid Leaves approved</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--status-leave)' }}>{payableDaysDetails.unpaidLeaveDays} days</strong>
                </div>
                <div className="employee-list-checkin" style={{ alignItems: 'flex-start', textAlign: 'left' }}>
                  <span>Net Payable Days</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--status-present)' }}>{payableDaysDetails.payableDays} days</strong>
                </div>
              </div>

              {payableDaysDetails.missingDays > 0 && (
                <div className="missing-alert" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', color: '#d97706', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.8rem', marginBottom: '1.25rem' }}>
                  ⚠️ <strong>Unrecorded Check-ins:</strong> The employee is missing {payableDaysDetails.missingDays} attendance check-ins this month (Unrecorded absences reduce payable days).
                </div>
              )}

              <button 
                type="button" 
                className="btn-submit-request" 
                style={{ height: '36px', width: '220px', display: 'flex', justifyContent: 'center' }} 
                onClick={handleGeneratePayslip}
              >
                Generate Prorated Payslip
              </button>
            </div>
          )}

          {/* Rendered Payslip Result Invoice */}
          {generatedPayslip && (
            <div className="generated-payslip-invoice" style={{ marginTop: '1.5rem', background: '#ffffff', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>PAYSLIP INVOICE</h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Period: {getMonthName(generatedPayslip.month)} {generatedPayslip.year}</span>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Employee:</strong> {activeEmployee?.firstName} {activeEmployee?.lastName}<br />
                  <strong>ID:</strong> {activeEmployee?.loginId}
                </div>
              </div>

              <div className="grid-2">
                <div>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 'bold' }}>Earnings (Prorated)</h5>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {generatedPayslip.components.map((c: any) => (
                      <li key={c.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                        <span>{c.name.replace(/_/g, ' ')}</span>
                        <strong>{formatCurrency(c.computedAmount)}</strong>
                      </li>
                    ))}
                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <span>Gross Earnings</span>
                      <span>{formatCurrency(generatedPayslip.proratedWage)}</span>
                    </li>
                  </ul>
                </div>

                <div style={{ borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem' }}>
                  <h5 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem', fontWeight: 'bold' }}>Deductions</h5>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Provident Fund (PF) Employee Share</span>
                      <strong>{formatCurrency(generatedPayslip.pfEmployee)}</strong>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Professional Tax</span>
                      <strong>{formatCurrency(generatedPayslip.professionalTax)}</strong>
                    </li>
                    <li style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 'bold', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <span>Total Deductions</span>
                      <span>{formatCurrency(generatedPayslip.totalDeductions)}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-glass)', paddingTop: '1rem', marginTop: '1.25rem' }}>
                <div style={{ textAlign: 'left' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>NET TAKE-HOME PAY</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.15rem' }}>
                    {formatCurrency(generatedPayslip.netSalary)}
                  </h3>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '320px', textAlign: 'right' }}>
                  Calculated from base monthly salary {formatCurrency(generatedPayslip.baseWage)} prorated to {generatedPayslip.payableDays} of {generatedPayslip.workingDays} working days.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
