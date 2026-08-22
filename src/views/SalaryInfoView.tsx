import { useState, useEffect } from 'react';
import { 
  type Employee, 
  type SalaryConfig, 
  type SalaryComponent,
  mockGetEmployees, 
  mockGetSalaryConfig, 
  mockUpdateSalaryConfig, 
  mockGetSalaryHistory, 
  mockExportSalaryDetails 
} from '../mockApi';
import { showToast } from '../components/Toast';

interface SalaryInfoViewProps {
  adminUser: { email: string; id: string };
  preSelectedEmployeeId?: string;
}

export default function SalaryInfoView({ adminUser, preSelectedEmployeeId }: SalaryInfoViewProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>('');
  const [config, setConfig] = useState<SalaryConfig | null>(null);

  // Form Fields
  const [monthlyWage, setMonthlyWage] = useState<number>(50000);
  const [workingDays, setWorkingDays] = useState<number>(5);
  const [breakTimeHours, setBreakTimeHours] = useState<number>(1.0);
  
  // Salary Components
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [pfBase, setPfBase] = useState<'BASIC_SALARY' | 'GROSS_SALARY'>('BASIC_SALARY');
  const [pfEmployeeRate, setPfEmployeeRate] = useState<number>(12);
  const [pfEmployerRate, setPfEmployerRate] = useState<number>(12);
  const [professionalTax, setProfessionalTax] = useState<number>(200);
  const [customDeductions, setCustomDeductions] = useState<any[]>([]);

  // Modal States
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [editingCompIdx, setEditingCompIdx] = useState<number | null>(null);
  const [compName, setCompName] = useState('');
  const [compBase, setCompBase] = useState<'Monthly Wage' | 'Basic Salary' | 'Gross Salary' | 'Fixed Amount'>('Monthly Wage');
  const [compType, setCompType] = useState<'Percentage' | 'Fixed Amount'>('Percentage');
  const [compVal, setCompVal] = useState<number>(10);
  const [compDesc, setCompDesc] = useState('');

  // Deduction Modal States
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [dedName, setDedName] = useState('');
  const [dedType, setDedType] = useState<'Percentage' | 'Fixed Amount'>('Fixed Amount');
  const [dedVal, setDedVal] = useState<number>(100);
  const [dedDesc, setDedDesc] = useState('');

  // History Modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  // Load Employees List
  useEffect(() => {
    try {
      const emps = mockGetEmployees('ADMIN') as Employee[];
      setEmployees(emps);
      if (preSelectedEmployeeId) {
        setSelectedEmpId(preSelectedEmployeeId);
      } else if (emps.length > 0) {
        setSelectedEmpId(emps[0].id);
      }
    } catch (err) {
      showToast('Failed to load employee list.', 'error');
    }
  }, [preSelectedEmployeeId]);

  // Load Salary Config for Selected Employee
  useEffect(() => {
    if (!selectedEmpId) return;
    try {
      const c = mockGetSalaryConfig('ADMIN', selectedEmpId);
      if (c) {
        setConfig(c);
        setMonthlyWage(c.wageAmount / 100);
        setWorkingDays(c.workingDays || 5);
        setBreakTimeHours((c.breakTimeMins || 60) / 60);
        setComponents(c.components || []);
        setPfBase(c.pfCalculationBase || 'BASIC_SALARY');
        setPfEmployeeRate((c.pfEmployeeRate || 0.12) * 100);
        setPfEmployerRate((c.pfEmployerRate || 0.12) * 100);
        setProfessionalTax((c.professionalTax || 20000) / 100);
        setCustomDeductions(c.customDeductions || []);
      }
    } catch (err: any) {
      showToast(err.message || 'Access Denied.', 'error');
    }
  }, [selectedEmpId]);

  // Dynamic calculations helper
  const basicComp = components.find(c => c.name === 'BASIC' && c.status !== 'Inactive');
  const basicAmount = basicComp 
    ? (basicComp.computationType === 'PERCENTAGE_OF_WAGE' 
        ? Math.round(monthlyWage * (basicComp.computationValue / 100)) 
        : basicComp.computedAmount / 100)
    : Math.round(monthlyWage * 0.5); // Default to 50% basic

  // Calculate allowances
  let totalAllowances = 0;
  const computedComponents = components.map(c => {
    if (c.status === 'Inactive') return { ...c, computedAmount: 0 };
    let amt = 0;
    if (c.computationType === 'PERCENTAGE_OF_WAGE') {
      amt = Math.round(monthlyWage * (c.computationValue / 100));
    } else if (c.computationType === 'PERCENTAGE_OF_COMPONENT') {
      // e.g. HRA is percentage of BASIC
      const refAmt = c.referenceComponent === 'BASIC' ? basicAmount : monthlyWage;
      amt = Math.round(refAmt * (c.computationValue / 100));
    } else if (c.computationType === 'PERCENTAGE_OF_GROSS') {
      amt = Math.round(monthlyWage * (c.computationValue / 100));
    } else {
      amt = c.computationValue / 100;
    }
    if (c.name !== 'BASIC') {
      totalAllowances += amt;
    }
    return { ...c, computedAmount: amt * 100 };
  });

  const grossSalary = monthlyWage;

  // PF
  const pfCalcBaseAmount = pfBase === 'BASIC_SALARY' ? basicAmount : grossSalary;
  const employeePFAmount = Math.round(pfCalcBaseAmount * (pfEmployeeRate / 100));
  const employerPFAmount = Math.round(pfCalcBaseAmount * (pfEmployerRate / 100));

  // Deductions
  const activeCustomDeductions = customDeductions.filter(d => d.status === 'Active');
  const customDeductionsAmount = activeCustomDeductions.reduce((sum, d) => {
    if (d.computationType === 'Percentage') {
      return sum + Math.round(grossSalary * (d.value / 100));
    }
    return sum + d.value;
  }, 0);

  const totalDeductions = employeePFAmount + professionalTax + customDeductionsAmount;
  const netSalary = grossSalary - totalDeductions;

  const handleSaveConfig = () => {
    if (!selectedEmpId) return;
    
    const sumOfComponents = computedComponents.reduce((sum, c) => sum + (c.computedAmount / 100), 0);
    // Allow for a very tiny margin of rounding errors (e.g. 1 rupee)
    if (sumOfComponents > (monthlyWage + 1)) {
      showToast('Salary components exceed the configured wage. Please adjust the salary structure.', 'error');
      return;
    }

    try {
      const payload: Partial<SalaryConfig> = {
        wageAmount: monthlyWage * 100,
        components: computedComponents,
        pfEmployeeRate: pfEmployeeRate / 100,
        pfEmployerRate: pfEmployerRate / 100,
        professionalTax: professionalTax * 100,
        workingDays,
        breakTimeMins: breakTimeHours * 60,
        pfCalculationBase: pfBase,
        customDeductions
      };
      mockUpdateSalaryConfig('ADMIN', selectedEmpId, payload, adminUser.email);
      showToast('Salary configuration committed successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update configuration.', 'error');
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset this configurations back to standard system templates?')) {
      setMonthlyWage(50000);
      setWorkingDays(5);
      setBreakTimeHours(1);
      setPfBase('BASIC_SALARY');
      setPfEmployeeRate(12);
      setPfEmployerRate(12);
      setProfessionalTax(200);
      setCustomDeductions([]);
      // Reset Default Components
      const defaults: SalaryComponent[] = [
        { name: 'BASIC', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 50, computedAmount: 2500000, description: 'Basic salary is calculated based on the configured percentage of monthly wages.', status: 'Active' },
        { name: 'HRA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 50, referenceComponent: 'BASIC', computedAmount: 1250000, description: 'HRA is calculated based on the configured percentage of basic salary.', status: 'Active' },
        { name: 'STANDARD_ALLOWANCE', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 8.334, computedAmount: 416700, description: 'Standard allowance component.', status: 'Active' },
        { name: 'PERFORMANCE_BONUS', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 4.165, computedAmount: 208250, description: 'Performance bonus component.', status: 'Active' },
        { name: 'LTA', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 4.165, computedAmount: 208250, description: 'Leave travel allowance component.', status: 'Active' },
        { name: 'FIXED_ALLOWANCE', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 5.836, computedAmount: 291800, description: 'Fixed allowance component.', status: 'Active' }
      ];
      setComponents(defaults);
      showToast('Restored default components. Click Save to commit changes.', 'info');
    }
  };

  const handleViewHistory = () => {
    if (!selectedEmpId) return;
    try {
      const records = mockGetSalaryHistory('ADMIN', selectedEmpId);
      setHistoryRecords(records);
      setShowHistoryModal(true);
    } catch (err: any) {
      showToast(err.message || 'Failed to load history.', 'error');
    }
  };

  const handleExport = () => {
    if (!selectedEmpId) return;
    try {
      const res = mockExportSalaryDetails('ADMIN', selectedEmpId);
      showToast(`Exported "${res.filename}" successfully.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Export forbidden.', 'error');
    }
  };

  // Add/Edit Component handler
  const handleOpenComponentModal = (idx: number | null = null) => {
    if (idx !== null) {
      const c = components[idx];
      setCompName(c.name);
      setCompBase(c.computationType === 'PERCENTAGE_OF_COMPONENT' ? 'Basic Salary' : 'Monthly Wage');
      setCompType(c.computationType === 'FIXED_AMOUNT' ? 'Fixed Amount' : 'Percentage');
      setCompVal(c.computationType === 'FIXED_AMOUNT' ? c.computationValue / 100 : c.computationValue);
      setCompDesc(c.description || '');
      setEditingCompIdx(idx);
    } else {
      setCompName('');
      setCompBase('Monthly Wage');
      setCompType('Percentage');
      setCompVal(10);
      setCompDesc('');
      setEditingCompIdx(null);
    }
    setShowComponentModal(true);
  };

  const handleSaveComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      showToast('Component name is required.', 'error');
      return;
    }
    const computedVal = compType === 'Fixed Amount' ? compVal * 100 : compVal;
    const isBasicPct = compBase === 'Basic Salary';
    const finalCompType: any = compType === 'Fixed Amount' 
      ? 'FIXED_AMOUNT' 
      : (isBasicPct ? 'PERCENTAGE_OF_COMPONENT' : 'PERCENTAGE_OF_WAGE');

    const item: SalaryComponent = {
      name: compName.toUpperCase().replace(/ /g, '_'),
      computationType: finalCompType,
      computationValue: computedVal,
      referenceComponent: isBasicPct ? 'BASIC' : undefined,
      computedAmount: compType === 'Fixed Amount' ? compVal * 100 : 0,
      description: compDesc,
      status: 'Active'
    };

    const list = [...components];
    if (editingCompIdx !== null) {
      list[editingCompIdx] = item;
    } else {
      list.push(item);
    }
    setComponents(list);
    setShowComponentModal(false);
    showToast('Component updated. Recalculations applied.', 'success');
  };

  const handleDeleteComponent = (idx: number) => {
    const list = components.filter((_, i) => i !== idx);
    setComponents(list);
    showToast('Salary component removed.', 'info');
  };

  const handleToggleComponentStatus = (idx: number) => {
    const list = [...components];
    list[idx].status = list[idx].status === 'Active' ? 'Inactive' : 'Active';
    setComponents(list);
    showToast('Component status updated.', 'success');
  };

  // Deduction handler
  const handleSaveDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dedName.trim()) return;
    const item = {
      id: `ded-${Math.random().toString(36).substr(2, 9)}`,
      name: dedName,
      computationType: dedType,
      value: dedVal,
      description: dedDesc,
      status: 'Active'
    };
    setCustomDeductions([...customDeductions, item]);
    setShowDeductionModal(false);
    showToast('Deduction rule registered.', 'success');
  };

  const handleDeleteDeduction = (id: string) => {
    setCustomDeductions(customDeductions.filter(d => d.id !== id));
    showToast('Deduction rule deleted.', 'info');
  };

  const selectedEmpName = () => {
    const emp = employees.find(e => e.id === selectedEmpId);
    return emp ? `${emp.firstName} ${emp.lastName} (${emp.empCode})` : 'Select Employee...';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left', width: '100%' }}>
      {/* Selector and Header */}
      <div className="card glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Salary Information</h2>
            <span className="badge badge-absent" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
               CONFIDENTIAL • SYSTEM ADMIN ONLY
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>
            Manage confidential employee compensation, salary components, deductions, and statutory contributions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="salary-employee-select" style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block' }}>Select Employee</label>
          <select 
            id="salary-employee-select"
            className="form-control" 
            style={{ width: '260px', minHeight: '38px', borderRadius: '8px' }} 
            value={selectedEmpId}
            onChange={(e) => setSelectedEmpId(e.target.value)}
          >
            {employees.map(e => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.empCode})</option>
            ))}
          </select>
        </div>
      </div>

      {config ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }} className="grid-logo-form">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* CARD 1: BASIC SALARY INFORMATION */}
            <div className="card glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Basic Salary Information</h3>
              <div className="grid-2" style={{ gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="sal-monthly">Monthly Wage *</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>₹</span>
                    <input 
                      id="sal-monthly"
                      type="number" 
                      className="form-control" 
                      style={{ paddingLeft: '24px' }} 
                      value={monthlyWage} 
                      onChange={(e) => setMonthlyWage(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="sal-yearly">Yearly Wage (Calculated)</label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '12px', top: '10px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>₹</span>
                    <input 
                      id="sal-yearly"
                      type="text" 
                      className="form-control" 
                      style={{ paddingLeft: '24px', background: '#f8fafc' }} 
                      value={(monthlyWage * 12).toLocaleString()} 
                      disabled 
                    />
                  </div>
                </div>
              </div>

              <div className="grid-2" style={{ gap: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="sal-days">Number of Working Days Per Week</label>
                  <input 
                    id="sal-days"
                    type="number" 
                    className="form-control" 
                    value={workingDays} 
                    onChange={(e) => setWorkingDays(Number(e.target.value))} 
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="sal-break">Break Time (Hours)</label>
                  <input 
                    id="sal-break"
                    type="number" 
                    step="0.5" 
                    className="form-control" 
                    value={breakTimeHours} 
                    onChange={(e) => setBreakTimeHours(Number(e.target.value))} 
                  />
                </div>
              </div>
            </div>

            {/* CARD 2: SALARY COMPONENTS */}
            <div className="card glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Salary Components</h3>
                <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.8rem' }} onClick={() => handleOpenComponentModal(null)}>
                  + Add Salary Component
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Component</th>
                      <th style={{ padding: '0.5rem', textAlign: 'left' }}>Calculation</th>
                      <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Status</th>
                      <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {computedComponents.map((comp, idx) => (
                      <tr key={comp.name} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>{comp.name}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                          {comp.computationType === 'PERCENTAGE_OF_WAGE' && `${comp.computationValue}% of Monthly Wage`}
                          {comp.computationType === 'PERCENTAGE_OF_COMPONENT' && `${comp.computationValue}% of ${comp.referenceComponent}`}
                          {comp.computationType === 'PERCENTAGE_OF_GROSS' && `${comp.computationValue}% of Gross`}
                          {comp.computationType === 'FIXED_AMOUNT' && 'Fixed Amount'}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                          ₹{(comp.computedAmount / 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                          <button type="button" className={`badge ${comp.status === 'Active' ? 'badge-present' : 'badge-absent'}`} style={{ border: 'none', cursor: 'pointer' }} onClick={() => handleToggleComponentStatus(idx)}>
                            {comp.status || 'Active'}
                          </button>
                        </td>
                        <td style={{ padding: '0.5rem', textAlign: 'center', display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                          <button type="button" className="btn btn-secondary" style={{ minHeight: '26px', padding: '0 0.4rem', fontSize: '0.75rem' }} onClick={() => handleOpenComponentModal(idx)}>Edit</button>
                          {comp.name !== 'BASIC' && comp.name !== 'HRA' && (
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '26px', padding: '0 0.4rem', fontSize: '0.75rem', color: 'var(--status-leave)' }} onClick={() => handleDeleteComponent(idx)}>Delete</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CARD 3: PROVIDENT FUND (PF) CONTRIBUTION */}
            <div className="card glass-card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.25rem' }}>Provident Fund (PF) Contribution</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                PF contribution is calculated based on the configured salary component.
              </p>

              <div className="grid-3" style={{ gap: '1rem', alignItems: 'center' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="pf-base">PF Calculation Base</label>
                  <select 
                    id="pf-base"
                    className="form-control" 
                    value={pfBase} 
                    onChange={(e) => setPfBase(e.target.value as any)}
                  >
                    <option value="BASIC_SALARY">Basic Salary</option>
                    <option value="GROSS_SALARY">Gross Salary</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="pf-emp-pct">Employee Contribution (%)</label>
                  <input 
                    id="pf-emp-pct"
                    type="number" 
                    className="form-control" 
                    value={pfEmployeeRate} 
                    onChange={(e) => setPfEmployeeRate(Number(e.target.value))} 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                    Calculated: ₹{employeePFAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month
                  </span>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="pf-empr-pct">Employer Contribution (%)</label>
                  <input 
                    id="pf-empr-pct"
                    type="number" 
                    className="form-control" 
                    value={pfEmployerRate} 
                    onChange={(e) => setPfEmployerRate(Number(e.target.value))} 
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                    Calculated: ₹{employerPFAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} / month
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 4: TAX DEDUCTIONS */}
            <div className="card glass-card" style={{ padding: '1.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Tax Deductions & Adhoc Deductions</h3>
                <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.8rem' }} onClick={() => setShowDeductionModal(true)}>
                  + Add Deduction
                </button>
              </div>

              <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.25rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label htmlFor="ded-pt">Professional Tax (₹ / Month) *</label>
                  <input 
                    id="ded-pt"
                    type="number" 
                    className="form-control" 
                    value={professionalTax} 
                    onChange={(e) => setProfessionalTax(Number(e.target.value))} 
                  />
                </div>
              </div>

              {customDeductions.length > 0 && (
                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Deduction Name</th>
                        <th style={{ padding: '0.5rem', textAlign: 'left' }}>Type</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Amount / %</th>
                        <th style={{ padding: '0.5rem', textAlign: 'center' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customDeductions.map(ded => (
                        <tr key={ded.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold' }}>{ded.name}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'left' }}>{ded.computationType}</td>
                          <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>
                            {ded.computationType === 'Percentage' ? `${ded.value}%` : `₹${ded.value.toLocaleString()}`}
                          </td>
                          <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '26px', fontSize: '0.75rem', color: 'var(--status-leave)' }} onClick={() => handleDeleteDeduction(ded.id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* PREMIUM SALARY SUMMARY CARD (Right Side Panel) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card glass-card" style={{ padding: '1.5rem', border: '1px solid var(--accent-primary)', position: 'sticky', top: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                 Salary Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Monthly Wage</span>
                  <strong>₹{monthlyWage.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Basic Salary</span>
                  <strong>₹{basicAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Total Allowances</span>
                  <strong style={{ color: 'var(--accent-primary)' }}>₹{totalAllowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-glass)', margin: '0.5rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Gross Salary</span>
                  <strong>₹{grossSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Employee PF (12%)</span>
                  <span style={{ color: 'var(--status-leave)' }}>- ₹{employeePFAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Professional Tax</span>
                  <span style={{ color: 'var(--status-leave)' }}>- ₹{professionalTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>

                {activeCustomDeductions.map(ded => (
                  <div key={ded.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{ded.name}</span>
                    <span style={{ color: 'var(--status-leave)' }}>
                      - ₹{(ded.computationType === 'Percentage' ? Math.round(grossSalary * (ded.value/100)) : ded.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                ))}

                <div style={{ borderTop: '1px dashed var(--border-glass)', margin: '0.5rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                  <span style={{ fontWeight: 'bold' }}>Total Deductions</span>
                  <strong style={{ color: 'var(--status-leave)' }}>₹{totalDeductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
                </div>

                <div style={{ background: 'rgba(37,99,235,0.04)', padding: '0.75rem', borderRadius: '8px', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Net Salary</span>
                  <strong style={{ fontSize: '1.2rem', color: 'var(--accent-primary)' }}>
                    ₹{netSalary.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div style={{ borderTop: '1px dashed var(--border-glass)', margin: '0.5rem 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <span>Employer PF (12%)</span>
                  <span>₹{employerPFAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="card glass-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <h3>Select an employee to manage salary configurations</h3>
        </div>
      )}

      {/* BOTTOM ACTION BAR */}
      {config && (
        <div className="card glass-card" style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', alignItems: 'center', width: '100%' }}>
          <button type="button" className="btn btn-secondary font-semibold" style={{ minHeight: '38px', marginRight: 'auto' }} onClick={handleViewHistory}>
            View Salary History
          </button>
          <button type="button" className="btn btn-secondary" style={{ minHeight: '38px' }} onClick={handleExport}>
            Export Salary Details
          </button>
          <button type="button" className="btn btn-secondary" style={{ minHeight: '38px' }} onClick={handleReset}>
            Reset Defaults
          </button>
          <button type="button" className="btn-submit-request font-bold" style={{ height: '38px', padding: '0 1.5rem' }} onClick={handleSaveConfig}>
            Save Salary Configuration
          </button>
        </div>
      )}

      {/* MODAL 1: ADD/EDIT COMPONENT */}
      {showComponentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSaveComponent} className="card glass-card" style={{ padding: '2rem', maxWidth: '440px', width: '100%', background: '#ffffff', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', fontWeight: 800 }}>
              {editingCompIdx !== null ? 'Edit Salary Component' : 'Add Salary Component'}
            </h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="modal-comp-name">Component Name *</label>
              <input 
                id="modal-comp-name"
                type="text" 
                className="form-control" 
                value={compName} 
                onChange={(e) => setCompName(e.target.value)} 
                required 
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="modal-comp-base">Calculation Based On</label>
                <select 
                  id="modal-comp-base"
                  className="form-control" 
                  value={compBase} 
                  onChange={(e) => setCompBase(e.target.value as any)}
                >
                  <option value="Monthly Wage">Monthly Wage</option>
                  <option value="Basic Salary">Basic Salary</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="modal-comp-type">Calculation Type</label>
                <select 
                  id="modal-comp-type"
                  className="form-control" 
                  value={compType} 
                  onChange={(e) => setCompType(e.target.value as any)}
                >
                  <option value="Percentage">Percentage</option>
                  <option value="Fixed Amount">Fixed Amount</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="modal-comp-val">
                {compType === 'Percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'} *
              </label>
              <input 
                id="modal-comp-val"
                type="number" 
                step="0.01" 
                className="form-control" 
                value={compVal} 
                onChange={(e) => setCompVal(Number(e.target.value))} 
                required 
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="modal-comp-desc">Description</label>
              <textarea 
                id="modal-comp-desc"
                className="form-control" 
                rows={2} 
                value={compDesc} 
                onChange={(e) => setCompDesc(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowComponentModal(false)}>Cancel</button>
              <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.25rem' }}>Save Component</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 2: ADD DEDUCTION */}
      {showDeductionModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleSaveDeduction} className="card glass-card" style={{ padding: '2rem', maxWidth: '440px', width: '100%', background: '#ffffff', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', fontWeight: 800 }}>+ Create Custom Deduction</h3>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="modal-ded-name">Deduction Name *</label>
              <input 
                id="modal-ded-name"
                type="text" 
                className="form-control" 
                value={dedName} 
                onChange={(e) => setDedName(e.target.value)} 
                required 
              />
            </div>

            <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="modal-ded-type">Calculation Type</label>
                <select 
                  id="modal-ded-type"
                  className="form-control" 
                  value={dedType} 
                  onChange={(e) => setDedType(e.target.value as any)}
                >
                  <option value="Fixed Amount">Fixed Amount</option>
                  <option value="Percentage">Percentage of Gross</option>
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label htmlFor="modal-ded-val">
                  {dedType === 'Percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'} *
                </label>
                <input 
                  id="modal-ded-val"
                  type="number" 
                  className="form-control" 
                  value={dedVal} 
                  onChange={(e) => setDedVal(Number(e.target.value))} 
                  required 
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="modal-ded-desc">Description</label>
              <textarea 
                id="modal-ded-desc"
                className="form-control" 
                rows={2} 
                value={dedDesc} 
                onChange={(e) => setDedDesc(e.target.value)} 
              />
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowDeductionModal(false)}>Cancel</button>
              <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.25rem' }}>Save Deduction</button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: VIEW SALARY HISTORY */}
      {showHistoryModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card glass-card" style={{ padding: '2rem', maxWidth: '640px', width: '100%', background: '#ffffff', textAlign: 'left' }}>
            <h3 style={{ margin: '0 0 1.25rem 0', fontSize: '1.2rem', fontWeight: 800 }}>
              Salary Configuration History: {selectedEmpName()}
            </h3>

            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Effective Date</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Monthly Salary</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Basic</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Gross</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Net</th>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Updated By</th>
                  </tr>
                </thead>
                <tbody>
                  {historyRecords.map(record => (
                    <tr key={record.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.5rem' }}>{record.effectiveDate}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold' }}>₹{(record.monthlySalary / 100).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{(record.basic / 100).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{(record.gross / 100).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-primary)' }}>₹{(record.net / 100).toLocaleString()}</td>
                      <td style={{ padding: '0.5rem' }}>{record.updatedBy}</td>
                    </tr>
                  ))}
                  {historyRecords.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-secondary)' }}>No history records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button type="button" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 1rem' }} onClick={() => setShowHistoryModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
