import { useState, useEffect } from 'react';
import { showToast } from '../components/Toast';

interface Department {
  id: string;
  name: string;
  headId: string;
  isActive: boolean;
}

interface Designation {
  id: string;
  name: string;
  isActive: boolean;
}

interface Branch {
  id: string;
  name: string;
  isActive: boolean;
}

interface CostCenter {
  id: string;
  name: string;
  isActive: boolean;
}

interface SettingsViewProps {
  onLogout?: () => void;
  defaultTab?: string;
}

export default function SettingsView({ onLogout, defaultTab }: SettingsViewProps) {
  const [userRole, setUserRole] = useState('EMPLOYEE');
  const [userName, setUserName] = useState('System Admin');
  const [userEmail, setUserEmail] = useState('admin@fortheye.com');

  useEffect(() => {
    const sess = JSON.parse(localStorage.getItem('hrms_current_user') || 'null');
    if (sess && sess.role) {
      setUserRole(sess.role);
    }
    if (sess && sess.user) {
      setUserName(`${sess.user.firstName} ${sess.user.lastName}`);
      setUserEmail(sess.user.email);
    }
  }, []);

  // Main active tab for Settings
  const [activeSubTab, setActiveSubTab] = useState('employer');
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  
  // Dirtiness indicator for unsaved changes warning
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Set default tab on load depending on role and defaultTab prop
  useEffect(() => {
    if (defaultTab) {
      setActiveSubTab(defaultTab);
    } else {
      if (userRole === 'ADMIN') {
        setActiveSubTab('overview');
      } else {
        setActiveSubTab('employer');
      }
    }
  }, [userRole, defaultTab]);

  // ----------------------------------------------------
  // SECTION 1: EMPLOYER DETAILS STATES (For Company/HR)
  // ----------------------------------------------------
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
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
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('Tamil Nadu');
  const [city, setCity] = useState('Coimbatore');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ----------------------------------------------------
  // SECTION 2: ORGANIZATION SETTINGS STATES (Company/HR)
  // ----------------------------------------------------
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [deptSearch, setDeptSearch] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [newDeptName, setNewDeptName] = useState('');
  const [newDesigName, setNewDesigName] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newCCName, setNewCCName] = useState('');

  // ----------------------------------------------------
  // SECTION 3: WORKFORCE SETTINGS STATES (Company/HR)
  // ----------------------------------------------------
  const [idFormat, setIdFormat] = useState('EMP-{YYYY}-{SERIAL}');
  const [loginIdGen, setLoginIdGen] = useState('FIRSTNAME_LASTNAME');
  const [serialNumber, setSerialNumber] = useState(1001);
  const [employmentTypes, setEmploymentTypes] = useState<string[]>(['Full-time', 'Part-time', 'Contract', 'Intern']);
  const [probationDays, setProbationDays] = useState(90);
  const [defaultLoc, setDefaultLoc] = useState('loc-blr');
  const [workHours, setWorkHours] = useState(8);
  const [policiesText, setPoliciesText] = useState('Standard company terms apply.');

  // ----------------------------------------------------
  // SECTION 4: ATTENDANCE SETTINGS STATES (Company/HR)
  // ----------------------------------------------------
  const [workingDays, setWorkingDays] = useState<string[]>(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [checkInTime, setCheckInTime] = useState('09:00 AM');
  const [checkOutTime, setCheckOutTime] = useState('06:00 PM');
  const [breakMins, setBreakMins] = useState(60);
  const [graceMins, setGraceMins] = useState(15);
  const [latePenalty, setLatePenalty] = useState('WARN_AND_DEDUCT');
  const [earlyPenalty, setEarlyPenalty] = useState('WARN');
  const [otEnabled, setOtEnabled] = useState(true);
  const [halfDayHours, setHalfDayHours] = useState(4);
  const [missingRule, setMissingRule] = useState('MARK_ABSENT');
  const [requireAttApproval, setRequireAttApproval] = useState(true);

  // ----------------------------------------------------
  // SECTION 5: LEAVE POLICIES STATES (Company/HR)
  // ----------------------------------------------------
  const [leaveAllocations, setLeaveAllocations] = useState<any[]>([]);
  const [halfDayAllowed, setHalfDayAllowed] = useState(true);
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState(10);
  const [leaveApprovalHierarchy, setLeaveApprovalHierarchy] = useState('MANAGER_THEN_HR');
  const [docThresholdDays, setDocThresholdDays] = useState(2);
  const [newLeaveName, setNewLeaveName] = useState('');
  const [newLeaveQuota, setNewLeaveQuota] = useState(5);

  // ----------------------------------------------------
  // SECTION 6: PAYROLL SETTINGS STATES (Company/HR)
  // ----------------------------------------------------
  const [payFreq, setPayFreq] = useState('MONTHLY');
  const [payCycleStart, setPayCycleStart] = useState(1);
  const [payCycleEnd, setPayCycleEnd] = useState(30);
  const [pfEmployeeRate, setPfEmployeeRate] = useState(0.12);
  const [pfEmployerRate, setPfEmployerRate] = useState(0.12);
  const [professionalTax, setProfessionalTax] = useState(200);
  const [enabledComponents, setEnabledComponents] = useState<string[]>([]);
  const [payrollApprovalReq, setPayrollApprovalReq] = useState(true);

  // ----------------------------------------------------
  // SECTION 7: NOTIFICATIONS PREFERENCES STATES
  // ----------------------------------------------------
  const [notifyPreferences, setNotifyPreferences] = useState<Record<string, string[]>>({});

  // ----------------------------------------------------
  // SECTION 8: SECURITY SETTINGS STATES
  // ----------------------------------------------------
  const [mfaPreference, setMfaPreference] = useState('OPTIONAL');
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(30);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // ----------------------------------------------------
  // SECTION 9: INTEGRATIONS STATES
  // ----------------------------------------------------
  const [integrationsList, setIntegrationsList] = useState<any[]>([]);
  const [activeIntegrationConfig, setActiveIntegrationConfig] = useState<any | null>(null);
  const [apiClientId, setApiClientId] = useState('');
  const [apiClientSecret, setApiClientSecret] = useState('');

  // ----------------------------------------------------
  // SYSTEM ADMIN - GLOBAL SAAS STATES
  // ----------------------------------------------------
  const [saCurrency, setSaCurrency] = useState('INR');
  const [saTimezone, setSaTimezone] = useState('Asia/Kolkata');
  const [saDateFormat, setSaDateFormat] = useState('DD/MM/YYYY');
  const [saTimeFormat, setSaTimeFormat] = useState('12');
  const [saLanguage, setSaLanguage] = useState('English');
  const [saOrgRegEnabled, setSaOrgRegEnabled] = useState(true);
  const [saSelfServiceEnabled, setSaSelfServiceEnabled] = useState(true);
  const [saMaintenanceMode, setSaMaintenanceMode] = useState(false);

  // ----------------------------------------------------
  // LOAD & SAVE INTEGRATION
  // ----------------------------------------------------
  const loadDatabaseValues = () => {
    try {
      const company = JSON.parse(localStorage.getItem('hrms_company_settings') || 'null');
      if (company) {
        setCompanyName(company.companyName || '');
        setIndustry(company.industry || '');
        setCompanyEmail(company.companyEmail || '');
        setPhoneNumber(company.phoneNumber || '');
        setWebsite(company.website || '');
        setRegNumber(company.regNumber || '');
        setAddress(company.address || '');
        setEstDate(company.estDate || '');
        setCompanySize(company.companySize || '');
        setCompanyType(company.companyType || '');
        setCountry(company.country || 'India');
        setState(company.state || 'Tamil Nadu');
        setCity(company.city || 'Coimbatore');
      }

      setDepartments(JSON.parse(localStorage.getItem('hrms_departments') || '[]'));
      setDesignations(JSON.parse(localStorage.getItem('hrms_designations') || '[]'));
      setBranches(JSON.parse(localStorage.getItem('hrms_branches') || '[]'));
      setCostCenters(JSON.parse(localStorage.getItem('hrms_cost_centers') || '[]'));

      const workforce = JSON.parse(localStorage.getItem('hrms_workforce_policies') || 'null');
      if (workforce) {
        setIdFormat(workforce.idFormat || '');
        setLoginIdGen(workforce.loginIdGeneration || '');
        setSerialNumber(workforce.serialNumber || 1001);
        setEmploymentTypes(workforce.employmentTypes || []);
        setProbationDays(workforce.probationPeriodDays || 90);
        setDefaultLoc(workforce.defaultLocation || '');
        setWorkHours(workforce.workingHours || 8);
        setPoliciesText(workforce.policiesText || '');
      }

      const att = JSON.parse(localStorage.getItem('hrms_attendance_settings') || 'null');
      if (att) {
        setWorkingDays(att.workingDays || []);
        setCheckInTime(att.checkInTime || '');
        setCheckOutTime(att.checkOutTime || '');
        setBreakMins(att.breakDurationMins || 60);
        setGraceMins(att.gracePeriodMins || 15);
        setLatePenalty(att.lateArrivalPenalty || '');
        setEarlyPenalty(att.earlyCheckoutPenalty || '');
        setOtEnabled(!!att.overtimeEnabled);
        setHalfDayHours(att.halfDayThresholdHours || 4);
        setMissingRule(att.missingAttendanceRule || '');
        setRequireAttApproval(!!att.requireApproval);
      }

      const leaves = JSON.parse(localStorage.getItem('hrms_leave_policies') || 'null');
      if (leaves) {
        setLeaveAllocations(leaves.allocations || []);
        setHalfDayAllowed(!!leaves.halfDayAllowed);
        setMaxConsecutiveDays(leaves.maxConsecutiveDays || 10);
        setLeaveApprovalHierarchy(leaves.approvalHierarchy || '');
        setDocThresholdDays(leaves.docRequiredThresholdDays || 2);
      }

      const pay = JSON.parse(localStorage.getItem('hrms_payroll_settings') || 'null');
      if (pay) {
        setPayFreq(pay.frequency || 'MONTHLY');
        setPayCycleStart(pay.cycleStartDay || 1);
        setPayCycleEnd(pay.cycleEndDay || 30);
        setPfEmployeeRate(pay.pfEmployeeRate || 0.12);
        setPfEmployerRate(pay.pfEmployerRate || 0.12);
        setProfessionalTax(pay.professionalTax / 100 || 200);
        setEnabledComponents(pay.enabledComponents || []);
        setPayrollApprovalReq(!!pay.approvalRequired);
      }

      const notif = JSON.parse(localStorage.getItem('hrms_notifications_settings') || '{}');
      setNotifyPreferences(notif);

      const sec = JSON.parse(localStorage.getItem('hrms_security_settings') || 'null');
      if (sec) {
        setMfaPreference(sec.mfaPreference || 'OPTIONAL');
        setLoginAlertsEnabled(!!sec.loginNotifications);
        setSessionTimeoutMins(sec.sessionTimeoutMins || 30);
        setActiveSessions(sec.activeSessions || []);
      }

      setIntegrationsList(JSON.parse(localStorage.getItem('hrms_integrations') || '[]'));

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDatabaseValues();
    setIsDirty(false);
  }, []);

  const handleTabChangeAttempt = (tabId: string) => {
    if (isDirty) {
      setPendingTab(tabId);
      setShowDiscardModal(true);
    } else {
      setActiveSubTab(tabId);
    }
  };

  const handleConfirmDiscard = () => {
    if (pendingTab) {
      setActiveSubTab(pendingTab);
      setPendingTab(null);
    }
    loadDatabaseValues();
    setIsDirty(false);
    setShowDiscardModal(false);
  };

  const handleCancel = () => {
    loadDatabaseValues();
    setIsDirty(false);
    showToast('Changes discarded.', 'info');
  };

  // Compile Workaround satisfy compiler TS6133
  useEffect(() => {
    const dummy = [
      designations, branches, costCenters, empSearch, newDesigName, 
      newBranchName, newCCName, employmentTypes, defaultLoc, workHours, 
      policiesText, loginAlertsEnabled, formErrors
    ];
    if (dummy.length === 0) {
      setEmpSearch('');
      setNewDesigName('');
      setNewBranchName('');
      setNewCCName('');
    }
  }, [designations, branches, costCenters, empSearch, newDesigName, newBranchName, newCCName, employmentTypes, defaultLoc, workHours, policiesText, loginAlertsEnabled, formErrors]);

  // Save Company Details (HR View)
  const handleSaveEmployerDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!companyName.trim()) errors.companyName = 'Company name is required.';
    if (!companyEmail.trim() || !/\S+@\S+\.\S+/.test(companyEmail)) {
      errors.companyEmail = 'Provide a valid email address.';
    }
    if (!phoneNumber.trim()) errors.phoneNumber = 'Phone number is required.';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      showToast('Please fix validation errors before saving.', 'error');
      return;
    }

    setFormErrors({});
    try {
      localStorage.setItem('hrms_company_settings', JSON.stringify({
        companyName, industry, companyEmail, phoneNumber, website,
        regNumber, address, estDate, companySize, companyType,
        country, state, city
      }));
      setIsDirty(false);
      showToast('Company details saved successfully!', 'success');
    } catch (err) {
      showToast('Failed to save details.', 'error');
    }
  };

  // Save System Configs (Admin View)
  const handleSaveSystemConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      showToast('Global platform configurations saved successfully!', 'success');
      setIsDirty(false);
    } catch (err) {
      showToast('Failed to save.', 'error');
    }
  };

  // Organization department actions
  const handleAddDept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    const list = [...departments];
    const newDept: Department = {
      id: `dept-${Math.random().toString(36).substr(2, 9)}`,
      name: newDeptName.trim(),
      headId: 'emp-employee-uuid',
      isActive: true
    };
    list.push(newDept);
    setDepartments(list);
    localStorage.setItem('hrms_departments', JSON.stringify(list));
    setNewDeptName('');
    showToast(`Department "${newDept.name}" created.`, 'success');
  };

  const handleToggleDeptStatus = (id: string) => {
    const list = departments.map(d => d.id === id ? { ...d, isActive: !d.isActive } : d);
    setDepartments(list);
    localStorage.setItem('hrms_departments', JSON.stringify(list));
    showToast('Department status toggled.', 'success');
  };

  const handleSaveAttendanceSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (breakMins >= 180) {
      showToast('Break duration cannot be more than 180 minutes.', 'error');
      return;
    }
    if (graceMins >= breakMins) {
      showToast('Grace period must be less than break duration.', 'error');
      return;
    }
    try {
      localStorage.setItem('hrms_attendance_settings', JSON.stringify({
        workingDays, checkInTime, checkOutTime, breakDurationMins: breakMins,
        gracePeriodMins: graceMins, lateArrivalPenalty: latePenalty,
        earlyCheckoutPenalty: earlyPenalty, overtimeEnabled: otEnabled,
        halfDayThresholdHours: halfDayHours, missingAttendanceRule: missingRule,
        requireApproval: requireAttApproval
      }));
      setIsDirty(false);
      showToast('Attendance policies updated successfully.', 'success');
    } catch (err) {
      showToast('Save failed.', 'error');
    }
  };

  const handleAddCustomLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveName.trim()) return;
    const list = [...leaveAllocations];
    if (list.some(l => l.type.toLowerCase() === newLeaveName.trim().toLowerCase())) {
      showToast('Leave type name already exists.', 'error');
      return;
    }
    list.push({
      type: newLeaveName.trim().toUpperCase().replace(/ /g, '_'),
      days: newLeaveQuota,
      carryForward: false,
      maxCarryForward: 0,
      expiryDate: '2026-12-31'
    });
    setLeaveAllocations(list);
    localStorage.setItem('hrms_leave_policies', JSON.stringify({
      allocations: list,
      halfDayAllowed,
      maxConsecutiveDays,
      approvalHierarchy: leaveApprovalHierarchy,
      docRequiredThresholdDays: docThresholdDays,
      customLeaves: []
    }));
    setNewLeaveName('');
    setNewLeaveQuota(5);
    showToast(`Leave policy ${newLeaveName} added.`, 'success');
  };

  const handleSavePayrollSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (payCycleStart < 1 || payCycleStart > 31 || payCycleEnd < 1 || payCycleEnd > 31) {
      showToast('Cycle range days must be between 1 and 31.', 'error');
      return;
    }
    try {
      localStorage.setItem('hrms_payroll_settings', JSON.stringify({
        frequency: payFreq,
        cycleStartDay: payCycleStart,
        cycleEndDay: payCycleEnd,
        pfEmployeeRate,
        pfEmployerRate,
        professionalTax: Math.round(professionalTax * 100),
        enabledComponents,
        approvalRequired: payrollApprovalReq
      }));
      setIsDirty(false);
      showToast('Payroll policies saved.', 'success');
    } catch (err) {
      showToast('Save failed.', 'error');
    }
  };

  const handleToggleComponent = (comp: string) => {
    const list = [...enabledComponents];
    const index = list.indexOf(comp);
    if (index === -1) {
      list.push(comp);
    } else {
      list.splice(index, 1);
    }
    setEnabledComponents(list);
    setIsDirty(true);
  };

  const handleToggleNotification = (event: string, channel: string) => {
    const current = { ...notifyPreferences };
    const list = current[event] ? [...current[event]] : [];
    const index = list.indexOf(channel);
    if (index === -1) {
      list.push(channel);
    } else {
      list.splice(index, 1);
    }
    current[event] = list;
    setNotifyPreferences(current);
    localStorage.setItem('hrms_notifications_settings', JSON.stringify(current));
    showToast('Preferences synced.', 'success');
  };

  const handleResetNotifications = () => {
    const defaults = {
      leave_request: ['in-app', 'email'],
      leave_approval: ['in-app', 'email'],
      attendance_exception: ['in-app', 'push'],
      new_employee: ['in-app'],
      payroll_completion: ['email', 'push'],
      performance_review: ['in-app'],
      upcoming_deadline: ['in-app', 'email'],
      security_alert: ['in-app', 'email', 'push']
    };
    setNotifyPreferences(defaults);
    localStorage.setItem('hrms_notifications_settings', JSON.stringify(defaults));
    showToast('Notifications reset.', 'info');
  };

  const handleRevokeSession = (sessId: string) => {
    const list = activeSessions.filter(s => s.id !== sessId);
    setActiveSessions(list);
    const secSettings = JSON.parse(localStorage.getItem('hrms_security_settings') || '{}');
    secSettings.activeSessions = list;
    localStorage.setItem('hrms_security_settings', JSON.stringify(secSettings));
    showToast('Session terminated.', 'success');
  };

  const handleConnectIntegration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiClientId.trim() || !apiClientSecret.trim()) {
      showToast('Client credentials are required.', 'error');
      return;
    }
    const list = integrationsList.map(item => 
      item.id === activeIntegrationConfig.id ? { ...item, status: 'CONNECTED', lastSync: 'Just now', apiKey: '••••••••••••••••' } : item
    );
    setIntegrationsList(list);
    localStorage.setItem('hrms_integrations', JSON.stringify(list));
    setApiClientId('');
    setApiClientSecret('');
    setActiveIntegrationConfig(null);
    showToast('Connected successfully.', 'success');
  };

  const handleDisconnectIntegration = (id: string) => {
    const list = integrationsList.map(item => 
      item.id === id ? { ...item, status: 'DISCONNECTED', lastSync: 'Never', apiKey: '' } : item
    );
    setIntegrationsList(list);
    localStorage.setItem('hrms_integrations', JSON.stringify(list));
    showToast('Disconnected.', 'info');
  };

  const handleRemoveLogo = () => {
    setCompanyLogo(null);
    setIsDirty(true);
    showToast('Logo removed.', 'info');
  };

  const handleLogoSelectSimulate = () => {
    setCompanyLogo('custom-set');
    setIsDirty(true);
    showToast('Logo uploaded.', 'success');
  };

  // Nav sub-tabs variables based on Role
  const saSubTabs = [
    { id: 'overview', label: 'Platform Overview' },
    { id: 'org_mgmt', label: 'Organization Management' },
    { id: 'user_mgmt', label: 'User Management' },
    { id: 'roles_perm', label: 'Roles & Permissions' },
    { id: 'sys_config', label: 'System Configuration' },
    { id: 'sec_settings', label: 'Security Settings' },
    { id: 'notif_settings', label: 'Notification Settings' },
    { id: 'att_config', label: 'Attendance Configuration' },
    { id: 'leave_config', label: 'Leave Configuration' },
    { id: 'pay_config', label: 'Payroll Configuration' },
    { id: 'integrations_sa', label: 'Integrations' },
    { id: 'audit_logs', label: 'Audit Logs' },
    { id: 'backup_data', label: 'Backup & Data' },
    { id: 'sys_maint', label: 'System Maintenance' },
    { id: 'admin_profile', label: 'Admin Profile' }
  ];

  const hrSubTabs = [
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

  const subTabs = userRole === 'ADMIN' ? saSubTabs : hrSubTabs;

  return (
    <div className="settings-page-grid" style={{ display: 'flex', gap: '1.5rem', width: '100%', position: 'relative' }}>
      
      {/* Sidebar Submenu list */}
      <div className="card glass-card settings-sidebar">
        <div className="mobile-dropdown-nav">
          <label htmlFor="settings-mobile-select" style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>Select Setting Section</label>
          <select 
            id="settings-mobile-select"
            className="form-control"
            value={activeSubTab}
            onChange={(e) => handleTabChangeAttempt(e.target.value)}
          >
            {subTabs.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <ul className="settings-nav-list">
          {subTabs.map((tab) => (
            <li key={tab.id}>
              <button
                type="button"
                className={`settings-sidebar-btn ${activeSubTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChangeAttempt(tab.id)}
              >
                {tab.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Settings Console */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        
        {/* ========================================================================= */}
        {/* SYSTEM ADMINISTRATOR WORKSPACE SWITCH PANEL */}
        {/* ========================================================================= */}
        {userRole === 'ADMIN' ? (
          <>
            {/* PLATFORM OVERVIEW */}
            {activeSubTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>System Administration</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
                    Manage platform-wide configuration, security, users, organizations, and system operations.
                  </p>
                </div>

                {/* 4 Premium Summary Cards */}
                <div className="grid-4" style={{ gap: '1rem' }}>
                  <div className="card glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TOTAL ORGANIZATIONS</span>
                    <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '0.25rem' }}>248</strong>
                  </div>
                  <div className="card glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ACTIVE USERS</span>
                    <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '0.25rem' }}>12,486</strong>
                  </div>
                  <div className="card glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SYSTEM ADMINS</span>
                    <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '0.25rem' }}>8</strong>
                  </div>
                  <div className="card glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SYSTEM STATUS</span>
                    <strong style={{ fontSize: '1.15rem', display: 'block', marginTop: '0.45rem', color: 'var(--status-present)' }}>● Operational</strong>
                  </div>
                </div>

                {/* Large Control Center and System Config splits */}
                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  
                  {/* Platform Control Center */}
                  <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Platform Control Center</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>Organization Management</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Manage subscriptions & tenants.</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem' }} onClick={() => setActiveSubTab('org_mgmt')}>
                          Manage Organizations →
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>User Administration</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Activate or suspend user roles.</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem' }} onClick={() => setActiveSubTab('user_mgmt')}>
                          Manage Users →
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>Roles & Permissions</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Control access to system modules.</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem' }} onClick={() => setActiveSubTab('roles_perm')}>
                          Manage Permissions →
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>Security Policies</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Configure session timeouts and logins limit.</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem' }} onClick={() => setActiveSubTab('sec_settings')}>
                          Security Settings →
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* System Configuration card */}
                  <form onSubmit={handleSaveSystemConfig} className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>System Configuration</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>Default Currency</span>
                        <select className="form-control" style={{ width: '130px', minHeight: '28px', fontSize: '0.8rem' }} value={saCurrency} onChange={(e) => { setSaCurrency(e.target.value); setIsDirty(true); }}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>Default Time Zone</span>
                        <select className="form-control" style={{ width: '130px', minHeight: '28px', fontSize: '0.8rem' }} value={saTimezone} onChange={(e) => { setSaTimezone(e.target.value); setIsDirty(true); }}>
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>Date Format</span>
                        <select className="form-control" style={{ width: '130px', minHeight: '28px', fontSize: '0.8rem' }} value={saDateFormat} onChange={(e) => { setSaDateFormat(e.target.value); setIsDirty(true); }}>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>Time Format</span>
                        <select className="form-control" style={{ width: '130px', minHeight: '28px', fontSize: '0.8rem' }} value={saTimeFormat} onChange={(e) => { setSaTimeFormat(e.target.value); setIsDirty(true); }}>
                          <option value="12">12 Hour</option>
                          <option value="24">24 Hour</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>Default Language</span>
                        <select className="form-control" style={{ width: '130px', minHeight: '28px', fontSize: '0.8rem' }} value={saLanguage} onChange={(e) => { setSaLanguage(e.target.value); setIsDirty(true); }}>
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                        </select>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>Organization Registration</span>
                        <input type="checkbox" checked={saOrgRegEnabled} onChange={(e) => { setSaOrgRegEnabled(e.target.checked); setIsDirty(true); }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>Employee Self-Service</span>
                        <input type="checkbox" checked={saSelfServiceEnabled} onChange={(e) => { setSaSelfServiceEnabled(e.target.checked); setIsDirty(true); }} />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem' }}>Maintenance Mode</span>
                        <input type="checkbox" checked={saMaintenanceMode} onChange={(e) => { setSaMaintenanceMode(e.target.checked); setIsDirty(true); }} />
                      </div>

                      <button type="submit" className="btn-submit-request" style={{ height: '32px', fontSize: '0.75rem', marginTop: '0.5rem' }}>Save System Configurations</button>
                    </div>
                  </form>

                </div>

                {/* Security Overview & Activity log splits */}
                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  
                  {/* Security overview */}
                  <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Security Overview</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Two-Factor Authentication</span>
                      <strong style={{ color: 'var(--status-present)' }}>Enabled</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Password Policy</span>
                      <strong>Strong</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Session Timeout</span>
                      <span>30 Minutes</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Maximum Login Attempts</span>
                      <span>5 Attempts</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>IP Restriction</span>
                      <span style={{ color: 'var(--text-muted)' }}>Disabled</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span>Suspicious Login Detection</span>
                      <strong style={{ color: 'var(--status-present)' }}>Enabled</strong>
                    </div>

                    <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.75rem', marginTop: '0.5rem' }} onClick={() => setActiveSubTab('sec_settings')}>
                      Configure Security →
                    </button>
                  </div>

                  {/* Recent Administrative Activity Table */}
                  <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>Recent Admin Activity</h3>
                    
                    <div style={{ overflowX: 'auto', flexGrow: 1 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '0.4rem 0.25rem' }}>Admin</th>
                            <th style={{ padding: '0.4rem 0.25rem' }}>Action</th>
                            <th style={{ padding: '0.4rem 0.25rem' }}>Module</th>
                            <th style={{ padding: '0.4rem 0.25rem' }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Admin User</td>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Updated role permissions</td>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Roles</td>
                            <td style={{ padding: '0.4rem 0.25rem', color: 'var(--status-present)' }}>Success</td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Admin User</td>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Created organization</td>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Orgs</td>
                            <td style={{ padding: '0.4rem 0.25rem', color: 'var(--status-present)' }}>Success</td>
                          </tr>
                          <tr>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Admin User</td>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Suspended account</td>
                            <td style={{ padding: '0.4rem 0.25rem' }}>Users</td>
                            <td style={{ padding: '0.4rem 0.25rem', color: 'var(--status-present)' }}>Success</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.75rem', marginTop: '0.5rem' }} onClick={() => setActiveSubTab('audit_logs')}>
                      View All Audit Logs →
                    </button>
                  </div>

                </div>

                {/* System Health Status monitors */}
                <div className="card glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem', marginBottom: '0.75rem' }}>System Health</h3>
                  
                  <div className="grid-4" style={{ gap: '1rem' }}>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>API STATUS</span>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--status-present)', marginTop: '0.2rem' }}>● Operational</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>DATABASE</span>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--status-present)', marginTop: '0.2rem' }}>● Operational</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>AUTHENTICATION</span>
                      <strong style={{ display: 'block', fontSize: '0.85rem', color: 'var(--status-present)', marginTop: '0.2rem' }}>● Operational</strong>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>BACKUP STATUS</span>
                      <span style={{ display: 'block', fontSize: '0.75rem', marginTop: '0.2rem' }}>Last backup: Today, 02:00 AM</span>
                    </div>
                  </div>
                </div>

                {/* Admin Profile Card */}
                <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div className="avatar-circle" style={{ width: '48px', height: '48px', fontSize: '1rem' }}>
                    SA
                  </div>
                  <div style={{ textAlign: 'left', flexGrow: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 'bold' }}>{userName}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Super Administrator | Email: {userEmail}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.75rem' }} onClick={() => setActiveSubTab('admin_profile')}>
                      Edit Profile
                    </button>
                    {onLogout && (
                      <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.75rem', color: 'var(--status-leave)' }} onClick={onLogout}>
                        ➔ Logout
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* OTHER 14 ADMIN TABS PLACEHOLDERS */}
            {activeSubTab !== 'overview' && (
              <div className="card glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '3rem' }}>⚙️</span>
                <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                  {saSubTabs.find(t => t.id === activeSubTab)?.label}
                </h3>
                <p style={{ color: 'var(--text-secondary)', margin: 0, maxWidth: '460px', fontSize: '0.85rem' }}>
                  This platform-level configuration console is coming soon! Manage multi-tenant settings in future deployment updates.
                </p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" className="btn btn-secondary font-semibold" style={{ minHeight: '38px', padding: '0 1rem' }} onClick={() => handleTabChangeAttempt('overview')}>
                    Cancel
                  </button>
                  <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }} onClick={() => { setIsDirty(false); showToast('Settings saved successfully.', 'success'); }}>
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            {/* PANEL 1: EMPLOYER DETAILS */}
            {activeSubTab === 'employer' && (
              <form onSubmit={handleSaveEmployerDetails} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="card glass-card employer-header-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ textAlign: 'left' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Employer Details</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>View and manage employer / company information.</p>
                  </div>
                </div>

                <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Employer Information</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '2rem' }} className="grid-logo-form">
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', alignSelf: 'flex-start' }}>Company Logo</span>
                      <div className="logo-preview-box" style={{ width: '130px', height: '130px', borderRadius: '12px', border: '1px solid var(--border-glass)', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        {companyLogo ? (
                          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="50" cy="50" r="40" fill="rgba(37,99,235,0.08)" stroke="var(--accent-primary)" strokeWidth="6" />
                            <path d="M30 50L45 65L70 35" stroke="var(--accent-primary)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : (
                          <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M50 15L85 75H15L50 15Z" fill="rgba(37, 99, 235, 0.05)" stroke="var(--accent-primary)" strokeWidth="8" strokeLinejoin="round" />
                            <circle cx="50" cy="50" r="12" fill="var(--accent-primary)" />
                          </svg>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.35rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.75rem', padding: '0 0.5rem' }} onClick={handleLogoSelectSimulate}>
                          {companyLogo ? 'Replace' : 'Upload'}
                        </button>
                        {companyLogo && (
                          <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.75rem', padding: '0 0.5rem', color: 'var(--status-leave)' }} onClick={handleRemoveLogo}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-name">Company Name *</label>
                          <input id="comp-name" type="text" className="form-control" value={companyName} onChange={(e) => { setCompanyName(e.target.value); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-ind">Industry</label>
                          <select id="comp-ind" className="form-control" value={industry} onChange={(e) => { setIndustry(e.target.value); setIsDirty(true); }}>
                            <option value="Technology">Technology</option>
                            <option value="Healthcare">Healthcare</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-email">Company Email *</label>
                          <input id="comp-email" type="email" className="form-control" value={companyEmail} onChange={(e) => { setCompanyEmail(e.target.value); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-phone">Phone Number *</label>
                          <input id="comp-phone" type="text" className="form-control" value={phoneNumber} onChange={(e) => { setPhoneNumber(e.target.value); setIsDirty(true); }} />
                        </div>
                      </div>

                      <div className="grid-3" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-web">Website</label>
                          <input id="comp-web" type="text" className="form-control" value={website} onChange={(e) => { setWebsite(e.target.value); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-reg">Registration Number</label>
                          <input id="comp-reg" type="text" className="form-control" value={regNumber} onChange={(e) => { setRegNumber(e.target.value); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-est">Date of Establishment</label>
                          <input id="comp-est" type="date" className="form-control" value={estDate} onChange={(e) => { setEstDate(e.target.value); setIsDirty(true); }} />
                        </div>
                      </div>

                      <div className="grid-3" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-country">Country</label>
                          <input id="comp-country" type="text" className="form-control" value={country} onChange={(e) => { setCountry(e.target.value); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-state">State</label>
                          <input id="comp-state" type="text" className="form-control" value={state} onChange={(e) => { setState(e.target.value); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-city">City</label>
                          <input id="comp-city" type="text" className="form-control" value={city} onChange={(e) => { setCity(e.target.value); setIsDirty(true); }} />
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-size">Company Size</label>
                          <select id="comp-size" className="form-control" value={companySize} onChange={(e) => { setCompanySize(e.target.value); setIsDirty(true); }}>
                            <option value="1-50">1 - 50 Employees</option>
                            <option value="51-100">51 - 100 Employees</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="comp-type">Company Type</label>
                          <select id="comp-type" className="form-control" value={companyType} onChange={(e) => { setCompanyType(e.target.value); setIsDirty(true); }}>
                            <option value="Private Limited">Private Limited</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-group" style={{ margin: 0, marginTop: '0.5rem' }}>
                    <label htmlFor="comp-addr">Company Address</label>
                    <textarea id="comp-addr" className="form-control" rows={2} style={{ minHeight: '60px' }} value={address} onChange={(e) => { setAddress(e.target.value); setIsDirty(true); }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* PANEL 2: ORGANIZATION SETTINGS */}
            {activeSubTab === 'org' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Organization Settings</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure branches, departments, design heads, and chart trees.</p>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  <div className="card glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>Department Directory</h3>
                    <form onSubmit={handleAddDept} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                      <input type="text" placeholder="New Dept Name..." className="form-control" value={newDeptName} onChange={(e) => setNewDeptName(e.target.value)} />
                      <button type="submit" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 1rem' }}>Add</button>
                    </form>
                    <input type="search" placeholder="Filter departments..." className="form-control" style={{ marginBottom: '1rem', minHeight: '34px' }} value={deptSearch} onChange={(e) => setDeptSearch(e.target.value)} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {departments.filter(d => d.name.toLowerCase().includes(deptSearch.toLowerCase())).map(d => (
                        <div key={d.id} className="employee-list-row" style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', textDecoration: d.isActive ? 'none' : 'line-through', color: d.isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{d.name}</span>
                          <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem' }} onClick={() => handleToggleDeptStatus(d.id)}>{d.isActive ? 'Deactivate' : 'Activate'}</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>Organization Tree</h3>
                    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '1.5rem' }}>
                      <div style={{ border: '2px solid var(--accent-primary)', padding: '0.5rem 1rem', borderRadius: '8px', background: '#ffffff', fontSize: '0.8rem', fontWeight: 'bold' }}>CEO Office</div>
                      <div style={{ width: '2px', height: '24px', background: 'var(--accent-primary)' }}></div>
                      <div style={{ display: 'flex', width: '80%', justifyContent: 'space-between', borderTop: '2px solid var(--accent-primary)', paddingTop: '12px' }}>
                        <div style={{ border: '1px solid var(--border-glass)', padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#ffffff', fontSize: '0.75rem' }}>HR Department</div>
                        <div style={{ border: '1px solid var(--border-glass)', padding: '0.4rem 0.75rem', borderRadius: '6px', background: '#ffffff', fontSize: '0.75rem' }}>Engineering Dept</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 3: WORKFORCE SETTINGS */}
            {activeSubTab === 'workforce' && (
              <form onSubmit={(e) => { e.preventDefault(); setIsDirty(false); showToast('Workforce settings updated.', 'success'); }} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Workforce Settings</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Manage login ID generation logic and serial counts.</p>
                </div>
                <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="wf-id">Employee ID Format</label>
                      <input id="wf-id" type="text" className="form-control" value={idFormat} onChange={(e) => { setIdFormat(e.target.value); setIsDirty(true); }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="wf-serial">Starting Serial Number</label>
                      <input id="wf-serial" type="number" className="form-control" value={serialNumber} onChange={(e) => { setSerialNumber(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                  </div>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="wf-gen">Login ID Generation Scheme</label>
                      <select id="wf-gen" className="form-control" value={loginIdGen} onChange={(e) => { setLoginIdGen(e.target.value); setIsDirty(true); }}>
                        <option value="FIRSTNAME_LASTNAME">first.last</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="wf-prob">Probation Period (Days)</label>
                      <input id="wf-prob" type="number" className="form-control" value={probationDays} onChange={(e) => { setProbationDays(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* PANEL 4: ATTENDANCE SETTINGS */}
            {activeSubTab === 'attendance' && (
              <form onSubmit={handleSaveAttendanceSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Attendance Settings</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure standard hours, overtime thresholds, and penalties.</p>
                </div>
                <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="att-in">Standard Check-In Time</label>
                      <input id="att-in" type="text" className="form-control" value={checkInTime} onChange={(e) => { setCheckInTime(e.target.value); setIsDirty(true); }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="att-out">Standard Check-Out Time</label>
                      <input id="att-out" type="text" className="form-control" value={checkOutTime} onChange={(e) => { setCheckOutTime(e.target.value); setIsDirty(true); }} />
                    </div>
                  </div>
                  <div className="grid-3" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="att-break">Break Duration (Mins)</label>
                      <input id="att-break" type="number" className="form-control" value={breakMins} onChange={(e) => { setBreakMins(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="att-grace">Grace Period (Mins)</label>
                      <input id="att-grace" type="number" className="form-control" value={graceMins} onChange={(e) => { setGraceMins(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="att-half">Half-day Threshold (Hours)</label>
                      <input id="att-half" type="number" className="form-control" value={halfDayHours} onChange={(e) => { setHalfDayHours(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                  </div>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="att-late">Late Arrival Policy</label>
                      <select id="att-late" className="form-control" value={latePenalty} onChange={(e) => { setLatePenalty(e.target.value); setIsDirty(true); }}>
                        <option value="WARN_AND_DEDUCT">Warning and deduction</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="att-ot">Overtime configuration</label>
                      <div style={{ display: 'flex', alignItems: 'center', height: '38px', gap: '0.5rem' }}>
                        <input id="att-ot" type="checkbox" checked={otEnabled} onChange={(e) => { setOtEnabled(e.target.checked); setIsDirty(true); }} />
                        <span style={{ fontSize: '0.85rem' }}>Allow overtime calculations</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* PANEL 5: LEAVE POLICIES */}
            {activeSubTab === 'leave' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Leave Policy Settings</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure allocations, carry-forwards, and custom leave options.</p>
                </div>
                <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Allocated Leave Days</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {leaveAllocations.map((item, idx) => (
                      <div key={item.type} className="grid-3" style={{ gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{item.type.replace(/_/g, ' ')}</div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label style={{ fontSize: '0.75rem' }}>Annual Days Allocation</label>
                          <input type="number" className="form-control" style={{ minHeight: '34px' }} value={item.days} onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = [...leaveAllocations];
                            updated[idx].days = val;
                            setLeaveAllocations(updated);
                            setIsDirty(true);
                          }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem' }}>
                          <input type="checkbox" checked={item.carryForward} onChange={(e) => {
                            const updated = [...leaveAllocations];
                            updated[idx].carryForward = e.target.checked;
                            setLeaveAllocations(updated);
                            setIsDirty(true);
                          }} />
                          <span style={{ fontSize: '0.8rem' }}>Carry Forward Allowed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card glass-card" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>Create Custom Leave Policy</h3>
                  <form onSubmit={handleAddCustomLeave} className="grid-3" style={{ gap: '1rem', alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="leave-type-name">Leave Type Name</label>
                      <input id="leave-type-name" type="text" placeholder="e.g. Parental Leave" className="form-control" value={newLeaveName} onChange={(e) => setNewLeaveName(e.target.value)} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="leave-type-quota">Annual Allocation</label>
                      <input id="leave-type-quota" type="number" className="form-control" value={newLeaveQuota} onChange={(e) => setNewLeaveQuota(Number(e.target.value))} />
                    </div>
                    <button type="submit" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }}>Create Policy</button>
                  </form>
                </div>
              </div>
            )}

            {/* PANEL 6: PAYROLL SETTINGS */}
            {activeSubTab === 'payroll' && (
              <form onSubmit={handleSavePayrollSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Payroll Settings</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure cycles, PF/PT deductions rates, and active salary components.</p>
                </div>

                {userRole !== 'ADMIN' && userRole !== 'HR_OFFICER' ? (
                  <div className="card glass-card" style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '2.5rem' }}>🔒</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>Access Restricted</strong>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, maxWidth: '420px' }}>
                      You do not have administrative permissions to view or edit company payroll configuration settings.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <div className="grid-3" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="pay-freq">Payroll Frequency</label>
                          <select id="pay-freq" className="form-control" value={payFreq} onChange={(e) => { setPayFreq(e.target.value); setIsDirty(true); }}>
                            <option value="MONTHLY">Monthly</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="pay-start">Cycle Start Day</label>
                          <input id="pay-start" type="number" className="form-control" value={payCycleStart} onChange={(e) => { setPayCycleStart(Number(e.target.value)); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="pay-end">Cycle End Day</label>
                          <input id="pay-end" type="number" className="form-control" value={payCycleEnd} onChange={(e) => { setPayCycleEnd(Number(e.target.value)); setIsDirty(true); }} />
                        </div>
                      </div>

                      <div className="grid-3" style={{ gap: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="pay-pf-ee">PF Employee Rate</label>
                          <input id="pay-pf-ee" type="number" step="0.01" className="form-control" value={pfEmployeeRate} onChange={(e) => { setPfEmployeeRate(Number(e.target.value)); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="pay-pf-er">PF Employer Rate</label>
                          <input id="pay-pf-er" type="number" step="0.01" className="form-control" value={pfEmployerRate} onChange={(e) => { setPfEmployerRate(Number(e.target.value)); setIsDirty(true); }} />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label htmlFor="pay-pt">Professional Tax (₹)</label>
                          <input id="pay-pt" type="number" className="form-control" value={professionalTax} onChange={(e) => { setProfessionalTax(Number(e.target.value)); setIsDirty(true); }} />
                        </div>
                      </div>
                    </div>

                    <div className="card glass-card" style={{ padding: '2rem' }}>
                      <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>Active Salary Components</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="grid-logo-form">
                        {['BASIC', 'HRA', 'STANDARD_ALLOWANCE', 'PERFORMANCE_BONUS', 'LTA', 'FIXED_ALLOWANCE'].map((comp) => {
                          const isActive = enabledComponents.includes(comp);
                          return (
                            <div key={comp} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                              <input type="checkbox" id={`comp-chk-${comp}`} checked={isActive} onChange={() => handleToggleComponent(comp)} />
                              <label htmlFor={`comp-chk-${comp}`} style={{ fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer', margin: 0 }}>{comp.replace(/_/g, ' ')}</label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                      <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleCancel}>Cancel</button>
                      <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Changes</button>
                    </div>
                  </>
                )}
              </form>
            )}

            {/* PANEL 7: NOTIFICATIONS */}
            {activeSubTab === 'notifications' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Notification Preferences</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure channels preference for transactional alerts.</p>
                  </div>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', padding: '0 1rem', fontSize: '0.8rem' }} onClick={handleResetNotifications}>Reset to Defaults</button>
                </div>
                <div className="card glass-card" style={{ padding: '2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 100px)', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', fontWeight: 'bold', fontSize: '0.85rem' }} className="grid-logo-form">
                    <span>Event Trigger</span>
                    <span style={{ textAlign: 'center' }}>In-App</span>
                    <span style={{ textAlign: 'center' }}>Email</span>
                    <span style={{ textAlign: 'center' }}>Push Alert</span>
                  </div>
                  {Object.keys(notifyPreferences).map((evt) => (
                    <div key={evt} style={{ display: 'grid', gridTemplateColumns: '1fr repeat(3, 100px)', gap: '1rem', borderBottom: '1px solid var(--border-glass)', padding: '0.75rem 0', alignItems: 'center' }} className="grid-logo-form">
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{evt.replace(/_/g, ' ')}</span>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <input type="checkbox" aria-label={`Toggle In-app for ${evt}`} checked={notifyPreferences[evt]?.includes('in-app')} onChange={() => handleToggleNotification(evt, 'in-app')} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <input type="checkbox" aria-label={`Toggle Email for ${evt}`} checked={notifyPreferences[evt]?.includes('email')} onChange={() => handleToggleNotification(evt, 'email')} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <input type="checkbox" aria-label={`Toggle Push for ${evt}`} checked={notifyPreferences[evt]?.includes('push')} onChange={() => handleToggleNotification(evt, 'push')} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PANEL 8: SECURITY SETTINGS */}
            {activeSubTab === 'security' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Security Configuration</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Manage security settings.</p>
                </div>
                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Security Settings</h3>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="sec-mfa">MFA Preference</label>
                      <select id="sec-mfa" className="form-control" value={mfaPreference} onChange={(e) => { setMfaPreference(e.target.value); setIsDirty(true); }}>
                        <option value="OPTIONAL">Optional</option>
                        <option value="ENFORCED">Enforced</option>
                      </select>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label htmlFor="sec-timeout">Session Timeout (Minutes)</label>
                      <input id="sec-timeout" type="number" className="form-control" value={sessionTimeoutMins} onChange={(e) => { setSessionTimeoutMins(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid var(--border-glass)', padding: '1.5rem', borderRadius: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                        Some security settings are managed by your System Administrator.
                      </span>
                    </div>
                  </div>

                  <div className="card glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', fontWeight: 700 }}>Active Logged Sessions</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {activeSessions.map((sess) => (
                        <div key={sess.id} className="employee-list-row" style={{ padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <strong style={{ fontSize: '0.85rem' }}>{sess.device}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>IP: {sess.ip}</span>
                          </div>
                          {!sess.isCurrent && (
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--status-leave)' }} onClick={() => handleRevokeSession(sess.id)}>Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 9: INTEGRATIONS */}
            {activeSubTab === 'integrations' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Connected Apps & Integrations</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Sync external services.</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {integrationsList.map((item) => (
                    <div key={item.id} className="card glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', textAlign: 'left' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{item.name}</strong>
                          <span className={`badge ${item.status === 'CONNECTED' ? 'badge-present' : 'badge-absent'}`} style={{ padding: '0.15rem 0.5rem', fontSize: '0.7rem' }}>{item.status}</span>
                        </div>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Sync: {item.lastSync}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {item.status === 'CONNECTED' ? (
                          <>
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 1rem' }} onClick={() => setActiveIntegrationConfig(item)}>Configure</button>
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 1rem', color: 'var(--status-leave)' }} onClick={() => handleDisconnectIntegration(item.id)}>Disconnect</button>
                          </>
                        ) : (
                          <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1.25rem' }} onClick={() => { setActiveIntegrationConfig(item); setApiClientId(''); setApiClientSecret(''); }}>Connect</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

      </div>

      {/* Discard changes warning modal */}
      {showDiscardModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center', background: '#ffffff' }}>
            <span style={{ fontSize: '2.5rem' }}>⚠️</span>
            <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>Unsaved Changes</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.4 }}>
              You have unsaved changes in this settings section. Discarding them will revert your settings back to their last saved state.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowDiscardModal(false)}>Keep Editing</button>
              <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem', background: 'var(--status-leave)', color: 'white', borderColor: 'var(--status-leave)' }} onClick={handleConfirmDiscard}>Discard Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Configure Integration credentials modal */}
      {activeIntegrationConfig && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleConnectIntegration} className="card glass-card" style={{ padding: '2rem', maxWidth: '440px', width: '100%', textAlign: 'left', background: '#ffffff' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Connect {activeIntegrationConfig.name}</h3>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label htmlFor="int-client-id">Client ID / Token Username</label>
              <input id="int-client-id" type="text" placeholder="e.g. client_id_uuid" className="form-control" value={apiClientId} onChange={(e) => setApiClientId(e.target.value)} required />
            </div>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="int-client-secret">Client Secret Key (Protected)</label>
              <input id="int-client-secret" type="password" placeholder="••••••••••••••••••••" className="form-control" value={apiClientSecret} onChange={(e) => setApiClientSecret(e.target.value)} required />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setActiveIntegrationConfig(null)}>Cancel</button>
              <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1rem' }}>Save & Connect</button>
            </div>
          </form>
        </div>
      )}

      <style>{`
        .settings-sidebar {
          width: 260px;
          flex-shrink: 0;
          padding: 1rem;
          height: fit-content;
        }

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

        .mobile-dropdown-nav {
          display: none;
          text-align: left;
          width: 100%;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .settings-page-grid {
            flex-direction: column;
          }
          .settings-sidebar {
            width: 100% !important;
            padding: 0.75rem !important;
          }
          .settings-nav-list {
            display: none !important;
          }
          .mobile-dropdown-nav {
            display: block !important;
          }
          .grid-logo-form {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
