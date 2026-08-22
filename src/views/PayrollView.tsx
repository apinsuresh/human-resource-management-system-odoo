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
    // Only fetch employees if caller is ADMIN
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
      // Handles ERR-CALC-01
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

    // Prorate math: (baseSalary / totalWorkingDays) * payableDays
    const workingDays = payableDaysDetails.totalWorkingDays;
    const payable = payableDaysDetails.payableDays;
    
    if (workingDays === 0) {
      showToast('Cannot generate payslip for a month with 0 working days.', 'error');
      return;
    }

    const prorationRatio = payable / workingDays;
    const baseWage = salaryConfig.wageAmount;
    const proratedWage = Math.round(baseWage * prorationRatio);

    // Prorate components
    const proratedComponents = salaryConfig.components.map((comp) => ({
      ...comp,
      computedAmount: Math.round(comp.computedAmount * prorationRatio),
    }));

    // Deductions
    const basicComp = proratedComponents.find(c => c.name === 'BASIC');
    const basicAmount = basicComp ? basicComp.computedAmount : 0;
    
    // PF - 12% basic (employee & employer)
    const pfEmployee = Math.round(basicAmount * salaryConfig.pfEmployeeRate);
    const pfEmployer = Math.round(basicAmount * salaryConfig.pfEmployerRate);
    
    // Professional tax (fixed ₹200 or 20000 paise - prorated if working days = 0, otherwise fixed)
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
    return `₹${(paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getMonthName = (monthIdx: number) => {
    return new Date(2026, monthIdx, 1).toLocaleString('default', { month: 'long' });
  };

  // Block non-admin access immediately
  if (userRole !== 'ADMIN') {
    return (
      <div className="page-container">
        <div className="card error-card">
          <div className="error-icon">🚫</div>
          <h3>403 Access Forbidden (ERR-SEC-01)</h3>
          <p>You do not have administrative permissions to view or edit payroll configuration settings.</p>
        </div>
      </div>
    );
  }

  const activeEmployee = employees.find(e => e.id === selectedEmpId);

  return (
    <div className="page-container">
      <div className="payroll-layout">
        {/* Selection sidebar */}
        <div className="card employee-select-card">
          <h3>Select Employee</h3>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label htmlFor="emp-picker" className="visually-hidden">Choose Employee</label>
            <select 
              id="emp-picker" 
              className="form-control"
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
            <div className="emp-summary-payroll">
              <div className="emp-summary-row"><strong>Role:</strong> {activeEmployee.role}</div>
              <div className="emp-summary-row"><strong>Dept:</strong> {activeEmployee.department}</div>
              <div className="emp-summary-row"><strong>Joining Date:</strong> {activeEmployee.dateOfJoining}</div>
            </div>
          )}
        </div>

        {/* Salary Configuration Form */}
        <div className="card config-card">
          <h3>Base Salary Setup</h3>
          {salaryConfig ? (
            <>
              <form onSubmit={handleUpdateWage} style={{ marginTop: '1.25rem' }}>
                <div className="form-group">
                  <label htmlFor="base-wage-rs">Base Monthly Wage (in ₹)</label>
                  <div className="wage-input-row">
                    <input 
                      type="number" 
                      id="base-wage-rs" 
                      className="form-control" 
                      value={monthlyWage}
                      onChange={(e) => setMonthlyWage(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Recalculating...' : 'Update & Recalculate'}
                    </button>
                  </div>
                </div>
              </form>

              {salaryConfig.wageAmount > 0 ? (
                <div className="components-table-section">
                  <h4>Computed Salary Components</h4>
                  <table className="payroll-table">
                    <thead>
                      <tr>
                        <th>Component</th>
                        <th>Calculation Logic</th>
                        <th>Computed Amount (Monthly)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salaryConfig.components.map((c) => (
                        <tr key={c.name}>
                          <td><strong>{c.name.replace(/_/g, ' ')}</strong></td>
                          <td>
                            {c.computationType === 'PERCENTAGE_OF_WAGE' && `${c.computationValue}% of Base Wage`}
                            {c.computationType === 'PERCENTAGE_OF_COMPONENT' && `${c.computationValue}% of ${c.referenceComponent}`}
                            {c.computationType === 'FIXED_AMOUNT' && `Fixed Allowance`}
                          </td>
                          <td>{formatCurrency(c.computedAmount)}</td>
                        </tr>
                      ))}
                      <tr className="sum-row">
                        <td colSpan={2}><strong>Total Base Monthly Wage</strong></td>
                        <td><strong>{formatCurrency(salaryConfig.wageAmount)}</strong></td>
                      </tr>
                    </tbody>
                  </table>

                  <h4 style={{ marginTop: '2rem' }}>Statutory Deductions (Monthly)</h4>
                  <table className="payroll-table">
                    <thead>
                      <tr>
                        <th>Deduction Item</th>
                        <th>Rate / Logic</th>
                        <th>Employee Share</th>
                        <th>Employer Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* PF Row */}
                      <tr>
                        <td><strong>Provident Fund (PF)</strong></td>
                        <td>12.00% of Basic Salary</td>
                        {/* PF Employee */}
                        <td>
                          {formatCurrency(
                            Math.round(
                              (salaryConfig.components.find(c => c.name === 'BASIC')?.computedAmount || 0) * 0.12
                            )
                          )}
                        </td>
                        {/* PF Employer */}
                        <td>
                          {formatCurrency(
                            Math.round(
                              (salaryConfig.components.find(c => c.name === 'BASIC')?.computedAmount || 0) * 0.12
                            )
                          )}
                        </td>
                      </tr>
                      {/* Professional Tax */}
                      <tr>
                        <td><strong>Professional Tax</strong></td>
                        <td>Fixed Tax (State Rate)</td>
                        <td>{formatCurrency(salaryConfig.professionalTax)}</td>
                        <td>--</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="unconfigured-warning">
                  ⚠️ Base monthly wage is currently set to zero. Please enter a wage above to populate components.
                </div>
              )}
            </>
          ) : (
            <p>Loading configurations...</p>
          )}
        </div>
      </div>

      {/* Payslip Processing Panel */}
      {salaryConfig && salaryConfig.wageAmount > 0 && (
        <div className="card payslip-card" style={{ marginTop: '2rem' }}>
          <h3>Payslip Processing Engine</h3>
          <p className="onboard-desc">Queries attendance and leave history to calculate total payable working days, generating prorated payslips.</p>

          <div className="payslip-config-row">
            <div className="form-group min-input">
              <label htmlFor="pay-month">Select Pay Period Month</label>
              <select 
                id="pay-month" 
                className="form-control" 
                value={payslipMonth}
                onChange={(e) => setPayslipMonth(parseInt(e.target.value))}
              >
                {Array.from({ length: 12 }).map((_, idx) => (
                  <option key={idx} value={idx}>{getMonthName(idx)}</option>
                ))}
              </select>
            </div>

            <div className="form-group min-input">
              <label htmlFor="pay-year">Select Year</label>
              <select 
                id="pay-year" 
                className="form-control" 
                value={payslipYear}
                onChange={(e) => setPayslipYear(parseInt(e.target.value))}
              >
                <option value={2026}>2026</option>
                <option value={2025}>2025</option>
              </select>
            </div>

            <button type="button" className="btn btn-secondary align-btn" onClick={handleCalculatePayableDays}>
              Calculate Payable Days
            </button>
          </div>

          {payableDaysDetails && (
            <div className="payable-days-summary border-box">
              <h4>Payable Days Audit Summary for {getMonthName(payslipMonth)} {payslipYear}</h4>
              <div className="grid-4 metrics-row">
                <div className="metric-cell">
                  <span className="lbl">Working Days in Period</span>
                  <span className="val">{payableDaysDetails.totalWorkingDays} days</span>
                </div>
                <div className="metric-cell">
                  <span className="lbl">Present Days logged</span>
                  <span className="val">{payableDaysDetails.presentDays} days</span>
                </div>
                <div className="metric-cell">
                  <span className="lbl">Unpaid Leaves approved</span>
                  <span className="val text-red">{payableDaysDetails.unpaidLeaveDays} days</span>
                </div>
                <div className="metric-cell final-payable">
                  <span className="lbl">Net Payable Days</span>
                  <span className="val text-green">{payableDaysDetails.payableDays} days</span>
                </div>
              </div>

              {payableDaysDetails.missingDays > 0 && (
                <div className="missing-alert">
                  ⚠️ <strong>Unrecorded Check-ins:</strong> The employee is missing {payableDaysDetails.missingDays} attendance check-ins this month (Unrecorded absences reduce payable days).
                </div>
              )}

              <button type="button" className="btn btn-primary" onClick={handleGeneratePayslip}>
                Generate Prorated Payslip
              </button>
            </div>
          )}

          {/* Rendered Payslip Result */}
          {generatedPayslip && (
            <div className="generated-payslip-invoice border-box">
              <div className="payslip-invoice-header">
                <div>
                  <h4>PAYSLIP INVOICE</h4>
                  <span>Period: {getMonthName(generatedPayslip.month)} {generatedPayslip.year}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <strong>Employee:</strong> {activeEmployee?.firstName} {activeEmployee?.lastName}<br />
                  <strong>ID:</strong> {activeEmployee?.loginId}
                </div>
              </div>

              <div className="payslip-invoice-columns">
                {/* Earnings */}
                <div className="invoice-col">
                  <h5>Earnings (Prorated)</h5>
                  <ul>
                    {generatedPayslip.components.map((c: any) => (
                      <li key={c.name}>
                        <span>{c.name.replace(/_/g, ' ')}</span>
                        <span>{formatCurrency(c.computedAmount)}</span>
                      </li>
                    ))}
                    <li className="col-total">
                      <span>Gross Earnings</span>
                      <span>{formatCurrency(generatedPayslip.proratedWage)}</span>
                    </li>
                  </ul>
                </div>

                {/* Deductions */}
                <div className="invoice-col">
                  <h5>Deductions</h5>
                  <ul>
                    <li>
                      <span>Provident Fund (PF) Employee Share</span>
                      <span>{formatCurrency(generatedPayslip.pfEmployee)}</span>
                    </li>
                    <li>
                      <span>Professional Tax</span>
                      <span>{formatCurrency(generatedPayslip.professionalTax)}</span>
                    </li>
                    <li className="col-total">
                      <span>Total Deductions</span>
                      <span>{formatCurrency(generatedPayslip.totalDeductions)}</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="payslip-invoice-footer">
                <div className="net-take-home">
                  <span>NET TAKE-HOME PAY</span>
                  <h3>{formatCurrency(generatedPayslip.netSalary)}</h3>
                </div>
                <div className="audit-detail">
                  Calculated from base monthly salary {formatCurrency(generatedPayslip.baseWage)} prorated to {generatedPayslip.payableDays} of {generatedPayslip.workingDays} working days.
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .payroll-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.5rem;
          align-items: start;
        }

        .employee-select-card {
          padding: 1.25rem;
        }

        .emp-summary-payroll {
          margin-top: 1rem;
          border-top: 1px solid var(--border-color);
          padding-top: 1rem;
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .wage-input-row {
          display: flex;
          gap: 0.75rem;
        }

        .wage-input-row input {
          max-width: 250px;
        }

        .components-table-section {
          margin-top: 2rem;
        }

        .components-table-section h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.75rem;
        }

        .payroll-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
          text-align: left;
          margin-bottom: 1.5rem;
        }

        .payroll-table th, .payroll-table td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .payroll-table th {
          font-family: var(--font-heading);
          color: var(--text-secondary);
          font-weight: 600;
        }

        .sum-row td {
          border-top: 2px solid var(--text-primary);
          background-color: var(--bg-app);
          font-size: 0.95rem;
        }

        .unconfigured-warning {
          background-color: var(--status-absent-light);
          border: 1px dashed rgba(245, 158, 11, 0.3);
          color: var(--text-primary);
          padding: 1.25rem;
          border-radius: 8px;
          text-align: center;
          font-size: 0.9rem;
          margin-top: 1.5rem;
        }

        .error-card {
          text-align: center;
          padding: 4rem 2rem;
        }

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .payslip-config-row {
          display: flex;
          gap: 1.25rem;
          align-items: flex-end;
          flex-wrap: wrap;
          margin-top: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .min-input {
          max-width: 200px;
          width: 100%;
        }

        .align-btn {
          height: 48px;
          margin-bottom: 1.25rem;
        }

        .border-box {
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 1.5rem;
          background-color: var(--bg-app);
          margin-top: 1.5rem;
        }

        .payable-days-summary h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }

        .metrics-row {
          margin-bottom: 1.25rem;
        }

        .metric-cell {
          display: flex;
          flex-direction: column;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 1rem;
          border-radius: 6px;
        }

        .metric-cell .lbl {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          text-transform: uppercase;
        }

        .metric-cell .val {
          font-size: 1.25rem;
          font-weight: 800;
          margin-top: 0.25rem;
        }

        .metric-cell.final-payable {
          background-color: var(--status-present-light);
          border-color: rgba(16, 185, 129, 0.2);
        }

        .text-red { color: var(--error); }
        .text-green { color: var(--status-present); }

        .missing-alert {
          background-color: var(--error-light);
          border: 1px solid rgba(239, 68, 68, 0.2);
          padding: 1rem;
          border-radius: 6px;
          font-size: 0.85rem;
          margin-bottom: 1.25rem;
          line-height: 1.4;
        }

        .generated-payslip-invoice {
          background-color: var(--bg-card) !important;
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-md);
        }

        .payslip-invoice-header {
          display: flex;
          justify-content: space-between;
          border-bottom: 2px solid var(--text-primary);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }

        .payslip-invoice-header h4 {
          font-size: 1.2rem;
          font-weight: 800;
          letter-spacing: 0.5px;
        }

        .payslip-invoice-columns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .invoice-col h5 {
          font-family: var(--font-heading);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-secondary);
          text-transform: uppercase;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
          margin-bottom: 0.75rem;
        }

        .invoice-col ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .invoice-col li {
          display: flex;
          justify-content: space-between;
        }

        .invoice-col li.col-total {
          border-top: 1.5px solid var(--border-color);
          padding-top: 0.5rem;
          margin-top: 0.25rem;
          font-weight: 700;
          font-size: 0.9rem;
        }

        .payslip-invoice-footer {
          border-top: 1.5px solid var(--text-primary);
          padding-top: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .net-take-home {
          display: flex;
          flex-direction: column;
        }

        .net-take-home span {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          letter-spacing: 0.5px;
        }

        .net-take-home h3 {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--status-present);
        }

        .audit-detail {
          max-width: 400px;
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.3;
          text-align: right;
        }

        @media (max-width: 1024px) {
          .payroll-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .payslip-invoice-columns {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
