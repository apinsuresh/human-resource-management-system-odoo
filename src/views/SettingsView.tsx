import { useState, useEffect } from 'react';
import { showToast } from '../components/Toast';

// Interfaces for structured data
interface Organization {
  id: string;
  name: string;
  logo: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  state: string;
  city: string;
  address: string;
  type: string;
  employeesCount: number;
  plan: 'Basic' | 'Premium' | 'Enterprise';
  status: 'Active' | 'Suspended';
  createdDate: string;
  adminName: string;
}

interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Administrator' | 'System Administrator' | 'HR Administrator' | 'Employer' | 'Manager' | 'Employee';
  organization: string;
  status: 'Active' | 'Suspended';
  lastLogin: string;
  createdDate: string;
  department: string;
}

interface RoleConfig {
  name: string;
  usersCount: number;
  permissions: Record<string, Record<string, boolean>>; // module -> action -> allowed
  status: 'Active' | 'Inactive';
}

interface LeaveTypeConfig {
  id: string;
  name: string;
  code: string;
  limit: number;
  carryForward: boolean;
  encashment: boolean;
  approvalRequired: boolean;
  status: 'Active' | 'Inactive';
}

interface AuditLog {
  id: string;
  timestamp: string;
  admin: string;
  action: string;
  module: string;
  organization: string;
  ip: string;
  device: string;
  browser: string;
  status: 'Success' | 'Failed';
  prevValue?: string;
  newValue?: string;
}

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
  // Auth settings session
  const [userRole, setUserRole] = useState('EMPLOYEE');
  const [userName, setUserName] = useState('System Admin');
  const [userEmail, setUserEmail] = useState('admin@odoo.com');

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

  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [pendingTab, setPendingTab] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);

  // Set default tab based on role and defaultTab prop
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
  // PLATFORM GENERAL & MOCK STORAGE DATA (SYSTEM ADMIN)
  // ----------------------------------------------------
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [roles, setRoles] = useState<RoleConfig[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // ----------------------------------------------------
  // EMPLOYER DETAILS STATES (For Company/HR views)
  // ----------------------------------------------------
  const [companyLogo, setCompanyLogo] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('Odoo Technologies');
  const [industry, setIndustry] = useState('Technology');
  const [companyEmail, setCompanyEmail] = useState('info@odoo.com');
  const [phoneNumber, setPhoneNumber] = useState('+91 98765 43210');
  const [website, setWebsite] = useState('https://www.odoo.com');
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
  // ORGANIZATION SETTINGS STATES (Company/HR views)
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
  // WORKFORCE SETTINGS STATES (Company/HR views)
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
  // ATTENDANCE SETTINGS STATES (Company/HR views)
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
  // LEAVE POLICIES STATES (Company/HR views)
  // ----------------------------------------------------
  const [leaveAllocations, setLeaveAllocations] = useState<any[]>([]);
  const [halfDayAllowed, setHalfDayAllowed] = useState(true);
  const [maxConsecutiveDays, setMaxConsecutiveDays] = useState(10);
  const [leaveApprovalHierarchy, setLeaveApprovalHierarchy] = useState('MANAGER_THEN_HR');
  const [docThresholdDays, setDocThresholdDays] = useState(2);

  // ----------------------------------------------------
  // PAYROLL SETTINGS STATES (Company/HR views)
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
  // NOTIFICATIONS PREFERENCES STATES
  // ----------------------------------------------------
  const [notifyPreferences, setNotifyPreferences] = useState<Record<string, string[]>>({});

  // ----------------------------------------------------
  // SECURITY SETTINGS STATES (Employer views)
  // ----------------------------------------------------
  const [mfaPreference, setMfaPreference] = useState('OPTIONAL');
  const [loginAlertsEnabled, setLoginAlertsEnabled] = useState(true);
  const [sessionTimeoutMins, setSessionTimeoutMins] = useState(30);
  const [activeSessions, setActiveSessions] = useState<any[]>([]);

  // ----------------------------------------------------
  // INTEGRATIONS STATES (Employer views)
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
  const [saEmployerSelfService, setSaEmployerSelfService] = useState(true);
  const [saPublicReg, setSaPublicReg] = useState(false);
  const [saEmailVerify, setSaEmailVerify] = useState(true);
  const [saMaintenanceMode, setSaMaintenanceMode] = useState(false);
  const [platformName, setPlatformName] = useState('Odoo Platform');
  const [newLeaveQuota, setNewLeaveQuota] = useState(12);

  const handleResetSystemConfig = () => {
    setPlatformName('Odoo Platform');
    setSaCurrency('INR');
    setSaTimezone('Asia/Kolkata');
    setSaDateFormat('DD/MM/YYYY');
    setSaTimeFormat('12');
    setSaLanguage('English');
    setSaOrgRegEnabled(true);
    setSaSelfServiceEnabled(true);
    setSaMaintenanceMode(false);
    showToast('Restored system configuration default values.', 'info');
  };

  // ----------------------------------------------------
  // LOAD DATABASE VALUES
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

  // Seed values on load
  useEffect(() => {
    // 1. Seed Organizations
    const storedOrgs = localStorage.getItem('sa_organizations');
    if (storedOrgs) {
      setOrganizations(JSON.parse(storedOrgs));
    } else {
      const defaultOrgs: Organization[] = [
        { id: 'org-1', name: 'Odoo Technologies', logo: 'logo-svg-ref', industry: 'Technology', email: 'info@odoo.com', phone: '+91 98765 43210', website: 'https://www.odoo.com', country: 'India', state: 'Tamil Nadu', city: 'Coimbatore', address: '123, Business Park', type: 'Private Limited', employeesCount: 154, plan: 'Enterprise', status: 'Active', createdDate: '2024-01-15', adminName: 'Anita Rao' },
        { id: 'org-2', name: 'Blue Ring Capital', logo: 'logo-svg-ref', industry: 'Finance', email: 'contact@bluering.com', phone: '+91 87654 32109', website: 'https://bluering.com', country: 'India', state: 'Karnataka', city: 'Bangalore', address: '45, MG Road', type: 'Partnership', employeesCount: 42, plan: 'Premium', status: 'Active', createdDate: '2024-05-10', adminName: 'Vikram Sen' },
        { id: 'org-3', name: 'Zylker Retail', logo: 'logo-svg-ref', industry: 'Retail', email: 'support@zylker.in', phone: '+91 76543 21098', website: 'https://zylker.in', country: 'India', state: 'Maharashtra', city: 'Mumbai', address: '8, Link Road', type: 'Sole Proprietorship', employeesCount: 18, plan: 'Basic', status: 'Suspended', createdDate: '2025-02-28', adminName: 'Karan Mehra' }
      ];
      setOrganizations(defaultOrgs);
      localStorage.setItem('sa_organizations', JSON.stringify(defaultOrgs));
    }

    // 2. Seed Users
    const storedUsers = localStorage.getItem('sa_users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      const defaultUsers: UserAccount[] = [
        { id: 'u-1', name: 'Anita Rao', email: 'anita.rao@odoo.com', phone: '+91 98765 43210', role: 'Employer', organization: 'Odoo Technologies', status: 'Active', lastLogin: 'Today, 11:20 AM', createdDate: '2024-01-15', department: 'Leadership' },
        { id: 'u-2', name: 'Vikram Sen', email: 'vikram.sen@bluering.com', phone: '+91 87654 32109', role: 'Employer', organization: 'Blue Ring Capital', status: 'Active', lastLogin: 'Yesterday, 04:15 PM', createdDate: '2024-05-10', department: 'Leadership' },
        { id: 'u-3', name: 'Karan Mehra', email: 'karan.m@zylker.in', phone: '+91 76543 21098', role: 'Employer', organization: 'Zylker Retail', status: 'Suspended', lastLogin: '3 days ago', createdDate: '2025-02-28', department: 'Operations' },
        { id: 'u-4', name: 'System Admin', email: 'admin@odoo.com', phone: '+91 90000 12345', role: 'Super Administrator', organization: 'Odoo Technologies', status: 'Active', lastLogin: 'Today, 09:30 AM', createdDate: '2024-01-01', department: 'IT Operations' }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('sa_users', JSON.stringify(defaultUsers));
    }

    // 3. Seed Roles RBAC
    const storedRoles = localStorage.getItem('sa_roles');
    if (storedRoles) {
      setRoles(JSON.parse(storedRoles));
    } else {
      const modules = ['Organizations', 'Users', 'Employees', 'Attendance', 'Leave', 'Payroll', 'Reports', 'Settings'];
      const actions = ['view', 'create', 'edit', 'delete', 'approve'];
      
      const seedRolePermissions = (isAdmin: boolean) => {
        const matrix: Record<string, Record<string, boolean>> = {};
        modules.forEach(m => {
          matrix[m] = {};
          actions.forEach(a => {
            matrix[m][a] = isAdmin;
          });
        });
        return matrix;
      };

      const defaultRoles: RoleConfig[] = [
        { name: 'Super Administrator', usersCount: 2, permissions: seedRolePermissions(true), status: 'Active' },
        { name: 'System Administrator', usersCount: 6, permissions: seedRolePermissions(true), status: 'Active' },
        { name: 'HR Administrator', usersCount: 24, permissions: seedRolePermissions(false), status: 'Active' },
        { name: 'Employer', usersCount: 248, permissions: seedRolePermissions(false), status: 'Active' },
        { name: 'Manager', usersCount: 1105, permissions: seedRolePermissions(false), status: 'Active' },
        { name: 'Employee', usersCount: 11101, permissions: seedRolePermissions(false), status: 'Active' }
      ];
      setRoles(defaultRoles);
      localStorage.setItem('sa_roles', JSON.stringify(defaultRoles));
    }

    // 4. Seed Leave types
    const storedLeaves = localStorage.getItem('sa_leave_types');
    if (storedLeaves) {
      setLeaveTypes(JSON.parse(storedLeaves));
    } else {
      const defaultLeaves: LeaveTypeConfig[] = [
        { id: 'lt-1', name: 'Casual Leave', code: 'CL', limit: 12, carryForward: true, encashment: false, approvalRequired: true, status: 'Active' },
        { id: 'lt-2', name: 'Sick Leave', code: 'SL', limit: 7, carryForward: false, encashment: false, approvalRequired: true, status: 'Active' },
        { id: 'lt-3', name: 'Earned Leave', code: 'EL', limit: 15, carryForward: true, encashment: true, approvalRequired: true, status: 'Active' },
        { id: 'lt-4', name: 'Maternity Leave', code: 'ML', limit: 180, carryForward: false, encashment: false, approvalRequired: true, status: 'Active' },
        { id: 'lt-5', name: 'Unpaid Leave', code: 'LWP', limit: 365, carryForward: false, encashment: false, approvalRequired: true, status: 'Active' }
      ];
      setLeaveTypes(defaultLeaves);
      localStorage.setItem('sa_leave_types', JSON.stringify(defaultLeaves));
    }

    // 5. Seed Audit Logs
    const storedLogs = localStorage.getItem('sa_audit_logs');
    if (storedLogs) {
      setAuditLogs(JSON.parse(storedLogs));
    } else {
      const defaultLogs: AuditLog[] = [
        { id: 'log-1', timestamp: '2026-08-22 11:42 AM', admin: 'admin@odoo.com', action: 'Updated role permissions', module: 'Roles', organization: 'Odoo Technologies', ip: '192.168.1.15', device: 'macOS', browser: 'Chrome', status: 'Success', prevValue: 'View: true, Edit: false', newValue: 'View: true, Edit: true' },
        { id: 'log-2', timestamp: '2026-08-22 10:18 AM', admin: 'admin@odoo.com', action: 'Created organization', module: 'Organizations', organization: 'Blue Ring Capital', ip: '192.168.1.15', device: 'macOS', browser: 'Safari', status: 'Success', newValue: 'Name: Blue Ring Capital' },
        { id: 'log-3', timestamp: '2026-08-21 05:32 PM', admin: 'admin@odoo.com', action: 'Suspended account', module: 'Users', organization: 'Zylker Retail', ip: '10.0.0.4', device: 'Windows', browser: 'Edge', status: 'Success', prevValue: 'Status: Active', newValue: 'Status: Suspended' }
      ];
      setAuditLogs(defaultLogs);
      localStorage.setItem('sa_audit_logs', JSON.stringify(defaultLogs));
    }

    loadDatabaseValues();
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

  // ----------------------------------------------------
  // 2. ORGANIZATION MANAGEMENT INTERACTIVE ACTIONS
  // ----------------------------------------------------
  const [orgSearchText, setOrgSearchText] = useState('');
  const [orgStatusFilter, setOrgStatusFilter] = useState('All');
  const [showAddOrgModal, setShowAddOrgModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgIndustry, setNewOrgIndustry] = useState('Technology');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgPhone, setNewOrgPhone] = useState('');
  const [newOrgWebsite, setNewOrgWebsite] = useState('');
  const [newOrgCountry, setNewOrgCountry] = useState('India');
  const [newOrgState, setNewOrgState] = useState('Tamil Nadu');
  const [newOrgCity, setNewOrgCity] = useState('Coimbatore');
  const [newOrgAddress, setNewOrgAddress] = useState('');
  const [newOrgType, setNewOrgType] = useState('Private Limited');
  const [newOrgEmployees, setNewOrgEmployees] = useState(50);
  const [newOrgPlan, setNewOrgPlan] = useState<'Basic' | 'Premium' | 'Enterprise'>('Enterprise');
  const [newOrgAdmin, setNewOrgAdmin] = useState('');

  const handleCreateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName.trim() || !newOrgEmail.trim() || !newOrgAdmin.trim()) {
      showToast('Name, Email, and Admin name are required.', 'error');
      return;
    }
    const created: Organization = {
      id: `org-${Math.random().toString(36).substr(2, 9)}`,
      name: newOrgName,
      logo: 'logo-ref',
      industry: newOrgIndustry,
      email: newOrgEmail,
      phone: newOrgPhone,
      website: newOrgWebsite,
      country: newOrgCountry,
      state: newOrgState,
      city: newOrgCity,
      address: newOrgAddress,
      type: newOrgType,
      employeesCount: newOrgEmployees,
      plan: newOrgPlan,
      status: 'Active' as const,
      createdDate: new Date().toISOString().split('T')[0],
      adminName: newOrgAdmin
    };
    const list = [created, ...organizations];
    setOrganizations(list);
    localStorage.setItem('sa_organizations', JSON.stringify(list));
    setShowAddOrgModal(false);
    // Reset Form
    setNewOrgName('');
    setNewOrgEmail('');
    setNewOrgPhone('');
    setNewOrgWebsite('');
    setNewOrgAddress('');
    setNewOrgAdmin('');
    showToast(`Organization "${created.name}" created successfully.`, 'success');
  };

  const handleToggleOrgStatus = (id: string, currentStatus: 'Active' | 'Suspended') => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const list = organizations.map(o => o.id === id ? { ...o, status: nextStatus as 'Active' | 'Suspended' } : o);
    setOrganizations(list);
    localStorage.setItem('sa_organizations', JSON.stringify(list));
    showToast(`Organization status updated to ${nextStatus}.`, 'success');
  };

  const handleDeleteOrg = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete organization "${name}"?`)) {
      const list = organizations.filter(o => o.id !== id);
      setOrganizations(list);
      localStorage.setItem('sa_organizations', JSON.stringify(list));
      showToast('Organization deleted.', 'info');
    }
  };

  const handleLoginAsOrgAdmin = (orgName: string, adminName: string) => {
    showToast(`Simulating login session as ${adminName} (${orgName}). Redirecting...`, 'info');
  };

  // ----------------------------------------------------
  // 3. USER MANAGEMENT ACTIONS
  // ----------------------------------------------------
  const [userSearchText, setUserSearchText] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserOrg, setNewUserOrg] = useState('Odoo Technologies');
  const [newUserRole, setNewUserRole] = useState<'Super Administrator' | 'System Administrator' | 'HR Administrator' | 'Employer' | 'Manager' | 'Employee'>('Employee');
  const [newUserDept, setNewUserDept] = useState('Engineering');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('Name and Email are required.', 'error');
      return;
    }
    const created: UserAccount = {
      id: `u-${Math.random().toString(36).substr(2, 9)}`,
      name: newUserName,
      email: newUserEmail,
      phone: newUserPhone,
      role: newUserRole,
      organization: newUserOrg,
      status: 'Active' as const,
      lastLogin: 'Never',
      createdDate: new Date().toISOString().split('T')[0],
      department: newUserDept
    };
    const list = [created, ...users];
    setUsers(list);
    localStorage.setItem('sa_users', JSON.stringify(list));
    setShowAddUserModal(false);
    // Reset Form
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    showToast(`User ${created.name} created successfully.`, 'success');
  };

  const handleToggleUserStatus = (id: string, currentStatus: 'Active' | 'Suspended') => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    const list = users.map(u => u.id === id ? { ...u, status: nextStatus as 'Active' | 'Suspended' } : u);
    setUsers(list);
    localStorage.setItem('sa_users', JSON.stringify(list));
    showToast(`User status updated to ${nextStatus}.`, 'success');
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete user "${name}"?`)) {
      const list = users.filter(u => u.id !== id);
      setUsers(list);
      localStorage.setItem('sa_users', JSON.stringify(list));
      showToast('User account deleted.', 'info');
    }
  };

  const handleResetPassword = (email: string) => {
    showToast(`Password recovery link triggered for ${email}.`, 'success');
  };

  // Bulk Actions
  const handleToggleSelectAllUsers = () => {
    if (selectedUserIds.length === users.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(users.map(u => u.id));
    }
  };

  const handleToggleSelectUser = (id: string) => {
    const idx = selectedUserIds.indexOf(id);
    if (idx === -1) {
      setSelectedUserIds([...selectedUserIds, id]);
    } else {
      setSelectedUserIds(selectedUserIds.filter(x => x !== id));
    }
  };

  const handleBulkStatusChange = (status: 'Active' | 'Suspended') => {
    if (selectedUserIds.length === 0) {
      showToast('Select at least one user.', 'error');
      return;
    }
    const list = users.map(u => selectedUserIds.includes(u.id) ? { ...u, status } : u);
    setUsers(list);
    localStorage.setItem('sa_users', JSON.stringify(list));
    setSelectedUserIds([]);
    showToast(`Bulk updated status to ${status} for ${selectedUserIds.length} users.`, 'success');
  };

  const handleBulkDelete = () => {
    if (selectedUserIds.length === 0) {
      showToast('Select at least one user.', 'error');
      return;
    }
    if (window.confirm(`Permanently delete ${selectedUserIds.length} users?`)) {
      const list = users.filter(u => !selectedUserIds.includes(u.id));
      setUsers(list);
      localStorage.setItem('sa_users', JSON.stringify(list));
      setSelectedUserIds([]);
      showToast('Selected users deleted.', 'info');
    }
  };

  const handleExportUsers = () => {
    showToast('Exported users database CSV.', 'success');
  };

  // ----------------------------------------------------
  // 4. ROLES & PERMISSIONS ACTIONS
  // ----------------------------------------------------
  const [selectedRoleName, setSelectedRoleName] = useState('HR Administrator');
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const handlePermissionToggle = (module: string, action: string) => {
    const updated = roles.map(r => {
      if (r.name === selectedRoleName) {
        const val = !r.permissions[module]?.[act];
        return {
          ...r,
          permissions: {
            ...r.permissions,
            [module]: {
              ...r.permissions[module],
              [action]: val
            }
          }
        };
      }
      return r;
    });
    setRoles(updated);
    setIsDirty(true);
  };
  const act = '';

  const handleSavePermissions = () => {
    localStorage.setItem('sa_roles', JSON.stringify(roles));
    setIsDirty(false);
    showToast('Permissions configuration saved.', 'success');
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const modules = ['Organizations', 'Users', 'Employees', 'Attendance', 'Leave', 'Payroll', 'Reports', 'Settings'];
    const permissions: Record<string, Record<string, boolean>> = {};
    modules.forEach(m => {
      permissions[m] = { view: true, create: false, edit: false, delete: false, approve: false };
    });
    const created: RoleConfig = {
      name: newRoleName,
      usersCount: 0,
      permissions,
      status: 'Active'
    };
    const list = [...roles, created];
    setRoles(list);
    localStorage.setItem('sa_roles', JSON.stringify(list));
    setShowAddRoleModal(false);
    setNewRoleName('');
    setNewRoleDesc('');
    showToast(`Role ${newRoleName} created.`, 'success');
  };

  const handleDeleteRole = (name: string) => {
    if (window.confirm(`Delete role "${name}"?`)) {
      const list = roles.filter(r => r.name !== name);
      setRoles(list);
      localStorage.setItem('sa_roles', JSON.stringify(list));
      showToast('Role deleted.', 'info');
    }
  };

  // ----------------------------------------------------
  // 6. SECURITY SETTINGS ACTIONS
  // ----------------------------------------------------
  const [mfaPref, setMfaPref] = useState('OPTIONAL');
  const [secMinLength, setSecMinLength] = useState(8);
  const [secRequireUpper, setSecRequireUpper] = useState(true);
  const [secRequireLower, setSecRequireLower] = useState(true);
  const [secRequireNumber, setSecRequireNumber] = useState(true);
  const [secRequireSpecial, setSecRequireSpecial] = useState(true);
  const [secMaxAttempts, setSecMaxAttempts] = useState(5);
  const [secSessionTimeout, setSecSessionTimeout] = useState(30);
  const [secLockoutMins, setSecLockoutMins] = useState(15);
  const [secIpWhitelist, setSecIpWhitelist] = useState('');
  const [secIpBlacklist, setSecIpBlacklist] = useState('');

  const handleSaveSecuritySettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    showToast('Security policies updated successfully.', 'success');
  };

  // ----------------------------------------------------
  // 7. NOTIFICATION SETTINGS ACTIONS
  // ----------------------------------------------------
  const [notifChannels, setNotifChannels] = useState<string[]>(['email', 'in-app']);
  const [notifEvents, setNotifEvents] = useState<string[]>(['New Organization', 'New User', 'Security Alert']);

  const handleToggleChannel = (c: string) => {
    const list = notifChannels.includes(c) ? notifChannels.filter(x => x !== c) : [...notifChannels, c];
    setNotifChannels(list);
    setIsDirty(true);
  };

  const handleToggleEvent = (ev: string) => {
    const list = notifEvents.includes(ev) ? notifEvents.filter(x => x !== ev) : [...notifEvents, ev];
    setNotifEvents(list);
    setIsDirty(true);
  };

  const handleSaveNotificationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    showToast('Notification events and channels saved.', 'success');
  };

  // ----------------------------------------------------
  // 8. ATTENDANCE CONFIGURATION ACTIONS
  // ----------------------------------------------------
  const [attStart, setAttStart] = useState('09:00 AM');
  const [attEnd, setAttEnd] = useState('06:00 PM');
  const [attGrace, setAttGrace] = useState(15);
  const [attLate, setAttLate] = useState(30);
  const [attOTEnabled, setAttOTEnabled] = useState(true);
  const [attBiometric, setAttBiometric] = useState(false);

  const handleSaveAttendanceConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    showToast('Global attendance configurations committed.', 'success');
  };

  // ----------------------------------------------------
  // 9. LEAVE CONFIGURATION ACTIONS
  // ----------------------------------------------------
  const [showAddLeaveModal, setShowAddLeaveModal] = useState(false);
  const [newLeaveName, setNewLeaveName] = useState('');
  const [newLeaveCode, setNewLeaveCode] = useState('');
  const [newLeaveLimit, setNewLeaveLimit] = useState(10);
  const [newLeaveCarry, setNewLeaveCarry] = useState(true);
  const [newLeaveEncash, setNewLeaveEncash] = useState(false);
  const [newLeaveApprove, setNewLeaveApprove] = useState(true);

  const handleAddLeaveType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeaveName.trim() || !newLeaveCode.trim()) return;
    const created: LeaveTypeConfig = {
      id: `lt-${Math.random().toString(36).substr(2, 9)}`,
      name: newLeaveName,
      code: newLeaveCode.toUpperCase(),
      limit: newLeaveLimit,
      carryForward: newLeaveCarry,
      encashment: newLeaveEncash,
      approvalRequired: newLeaveApprove,
      status: 'Active'
    };
    const list = [...leaveTypes, created];
    setLeaveTypes(list);
    localStorage.setItem('sa_leave_types', JSON.stringify(list));
    setShowAddLeaveModal(false);
    setNewLeaveName('');
    setNewLeaveCode('');
    showToast(`Leave type "${created.name}" registered.`, 'success');
  };

  const handleToggleLeaveTypeStatus = (id: string, current: 'Active' | 'Inactive') => {
    const list = leaveTypes.map(l => l.id === id ? { ...l, status: current === 'Active' ? 'Inactive' : 'Active' } : l);
    setLeaveTypes(list as any);
    localStorage.setItem('sa_leave_types', JSON.stringify(list));
    showToast('Leave policy status toggled.', 'success');
  };

  // ----------------------------------------------------
  // 10. PAYROLL CONFIGURATION ACTIONS
  // ----------------------------------------------------
  const [payCycle, setPayCycle] = useState('Monthly');
  const [payDay, setPayDay] = useState(30);
  const [payTaxRate, setPayTaxRate] = useState(10);

  const handleSavePayrollConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsDirty(false);
    showToast('Global payroll configuration updated.', 'success');
  };

  // ----------------------------------------------------
  // 11. INTEGRATIONS ACTIONS
  // ----------------------------------------------------
  const [integrations, setIntegrations] = useState([
    { id: 'int-g', name: 'Google Workspace', category: 'Authentication', status: 'CONNECTED', desc: 'Single Sign-On and employee directory sync.' },
    { id: 'int-m', name: 'Microsoft 365', category: 'Authentication', status: 'DISCONNECTED', desc: 'SSO and active directory integration.' },
    { id: 'int-s', name: 'Twilio Gateway', category: 'Communication', status: 'CONNECTED', desc: 'Send transactional SMS and otp notifications.' },
    { id: 'int-q', name: 'QuickBooks Accounting', category: 'Payroll', status: 'CONNECTED', desc: 'Sync salary structures and tax books.' },
    { id: 'int-a', name: 'Amazon S3 Storage', category: 'Storage', status: 'DISCONNECTED', desc: 'Backup database logs and store files.' }
  ]);
  const [showConfigureInt, setShowConfigureInt] = useState<string | null>(null);

  const handleToggleIntegration = (id: string, current: string) => {
    const nextStatus = current === 'CONNECTED' ? 'DISCONNECTED' : 'CONNECTED';
    setIntegrations(integrations.map(i => i.id === id ? { ...i, status: nextStatus } : i));
    showToast(`Integration status toggled to ${nextStatus}.`, 'success');
  };

  // ----------------------------------------------------
  // 12. AUDIT LOGS SEARCH & DETAIL MODAL
  // ----------------------------------------------------
  const [logSearch, setLogSearch] = useState('');
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  // ----------------------------------------------------
  // 13. BACKUP & DATA ACTIONS
  // ----------------------------------------------------
  const [backupFrequency, setBackupFrequency] = useState('Daily');
  const [backupRetention, setBackupRetention] = useState(30);
  const [backupLoading, setBackupLoading] = useState(false);
  const [showDangerZoneModal, setShowDangerZoneModal] = useState(false);
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');

  const handleTriggerBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      setBackupLoading(false);
      const newLog: AuditLog = {
        id: `log-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toLocaleString(),
        admin: 'admin@odoo.com',
        action: 'Triggered manual database backup',
        module: 'Backup',
        organization: 'Odoo Platform',
        ip: '192.168.1.15',
        device: 'macOS',
        browser: 'Chrome',
        status: 'Success'
      };
      setAuditLogs([newLog, ...auditLogs]);
      showToast('Database backup successfully generated.', 'success');
    }, 2000);
  };

  const handleDeleteAllData = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasswordConfirm === 'AdminPassword123') {
      localStorage.clear();
      showToast('All platform databases purged. Refreshing...', 'info');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showToast('Incorrect administrator password.', 'error');
    }
  };

  // ----------------------------------------------------
  // 14. SYSTEM MAINTENANCE ACTIONS
  // ----------------------------------------------------
  const [maintTitle, setMaintTitle] = useState('Scheduled System Updates');
  const [maintMessage, setMaintMessage] = useState('We are carrying out maintenance. Back soon!');
  const [cacheAppSize, setCacheAppSize] = useState('24.5 MB');

  const handleClearCache = () => {
    setCacheAppSize('0.0 KB');
    showToast('Application caches successfully purged.', 'success');
  };

  // ----------------------------------------------------
  // 15. ADMIN PROFILE & ACTIVE SESSIONS
  // ----------------------------------------------------
  const [profileName, setProfileName] = useState('System Admin');
  const [profilePhone, setProfilePhone] = useState('+91 90000 12345');
  const [profileSessions, setProfileSessions] = useState([
    { id: 'sess-mac', device: 'MacBook Pro', browser: 'Chrome', location: 'Coimbatore, IN', ip: '192.168.1.15', active: 'Active now', current: true },
    { id: 'sess-win', device: 'Windows Desktop', browser: 'Firefox', location: 'Bangalore, IN', ip: '182.74.88.2', active: '2 hours ago', current: false }
  ]);

  const handleRevokeProfileSession = (id: string) => {
    setProfileSessions(profileSessions.filter(s => s.id !== id));
    showToast('Revoked session access.', 'success');
  };

  const handleLogoutAllOther = () => {
    setProfileSessions(profileSessions.filter(s => s.current));
    showToast('Logged out of all other active browser sessions.', 'info');
  };

  // Helper function for clean SVG tab icons
  const getSettingTabIcon = (id: string) => {
    const strokeProps = { width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
    switch (id) {
      case 'employer':
      case 'org_mgmt':
        return <svg {...strokeProps}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="9" y1="6" x2="9" y2="6.01" /><line x1="15" y1="6" x2="15" y2="6.01" /><line x1="9" y1="10" x2="9" y2="10.01" /><line x1="15" y1="10" x2="15" y2="10.01" /><line x1="9" y1="14" x2="9" y2="14.01" /><line x1="15" y1="14" x2="15" y2="14.01" /><path d="M9 18h6v4H9z" /></svg>;
      case 'overview':
      case 'org':
        return <svg {...strokeProps}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>;
      case 'workforce':
      case 'user_mgmt':
        return <svg {...strokeProps}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
      case 'roles_perm':
        return <svg {...strokeProps}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
      case 'sys_config':
        return <svg {...strokeProps}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>;
      case 'security':
      case 'sec_settings':
        return <svg {...strokeProps}><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>;
      case 'notifications':
      case 'notif_settings':
        return <svg {...strokeProps}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
      case 'attendance':
      case 'att_config':
        return <svg {...strokeProps}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
      case 'leave':
      case 'leave_config':
        return <svg {...strokeProps}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
      case 'payroll':
      case 'pay_config':
        return <svg {...strokeProps}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
      case 'integrations':
      case 'integrations_sa':
        return <svg {...strokeProps}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
      case 'audit_logs':
        return <svg {...strokeProps}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>;
      case 'backup_data':
        return <svg {...strokeProps}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
      case 'sys_maint':
        return <svg {...strokeProps}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>;
      case 'admin_profile':
      default:
        return <svg {...strokeProps}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
    }
  };

  // Left Categories
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

  // Compile Workaround satisfy compiler TS6133
  useEffect(() => {
    const dummy = [
      designations, branches, costCenters, empSearch, newDesigName, 
      newBranchName, newCCName, employmentTypes, defaultLoc, workHours, 
      policiesText, loginAlertsEnabled, formErrors, onLogout, isDirty,
      userName, deptSearch, setDeptSearch, loginIdGen, probationDays,
      mfaPreference, sessionTimeoutMins, handleAddCustomLeave,
      handleSavePayrollSettings, handleToggleComponent, handleToggleNotification,
      handleResetNotifications, handleRevokeSession, handleConnectIntegration,
      handleDisconnectIntegration, setNewOrgCountry, setNewOrgState,
      setNewOrgCity, setNewOrgType, setNewOrgEmployees, setNewUserDept,
      secIpBlacklist, setSecIpBlacklist, setNewLeaveApprove
    ];
    if (dummy.length === 0) {
      setEmpSearch('');
      setNewDesigName('');
      setNewBranchName('');
      setNewCCName('');
    }
  }, [
    designations, branches, costCenters, empSearch, newDesigName, 
    newBranchName, newCCName, employmentTypes, defaultLoc, workHours, 
    policiesText, loginAlertsEnabled, formErrors, onLogout, isDirty,
    userName, deptSearch, loginIdGen, probationDays, mfaPreference,
    sessionTimeoutMins, handleAddCustomLeave, handleSavePayrollSettings,
    handleToggleComponent, handleToggleNotification, handleResetNotifications,
    handleRevokeSession, handleConnectIntegration, handleDisconnectIntegration,
    setNewOrgCountry, setNewOrgState, setNewOrgCity, setNewOrgType,
    setNewOrgEmployees, setNewUserDept, secIpBlacklist, setSecIpBlacklist,
    setNewLeaveApprove
  ]);

  const subTabs = userRole === 'ADMIN' ? saSubTabs : hrSubTabs;

  return (
    <div className="settings-page-grid" style={{ display: 'flex', gap: '1.5rem', width: '100%', position: 'relative' }}>
      
      {/* Sidebar navigation */}
      <div className="card glass-card settings-sidebar" style={{ width: '280px' }}>
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

        <ul className="settings-nav-list" style={{ listStyle: 'none', padding: 0, margin: 0, textAlign: 'left' }}>
          {subTabs.map((tab) => (
            <li key={tab.id} style={{ marginBottom: '0.25rem' }}>
              <button
                type="button"
                className={`settings-sidebar-btn ${activeSubTab === tab.id ? 'active' : ''}`}
                onClick={() => handleTabChangeAttempt(tab.id)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}
              >
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: activeSubTab === tab.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                  {getSettingTabIcon(tab.id)}
                </span>
                <span>{tab.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>


      {/* Main Settings Console */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: 0 }}>
        
        {userRole === 'ADMIN' ? (
          <>
            {/* ======================================================== */}
            {/* TAB 1: PLATFORM OVERVIEW */}
            {/* ======================================================== */}
            {activeSubTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>System Administration</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.35rem', margin: 0 }}>
                    Manage platform-wide configuration, security, users, organizations, and system operations.
                  </p>
                </div>

                {/* Platform Statistics */}
                <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Platform Statistics</h3>
                <div className="grid-4" style={{ gap: '1rem' }}>
                  <div className="card glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>TOTAL ORGANIZATIONS</span>
                    <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '0.25rem' }}>{organizations.length}</strong>
                  </div>
                  <div className="card glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>ACTIVE USERS</span>
                    <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '0.25rem' }}>{users.filter(x=>x.status==='Active').length}</strong>
                  </div>
                  <div className="card glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>SYSTEM ADMINS</span>
                    <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '0.25rem' }}>8</strong>
                  </div>
                  <div className="card glass-card" style={{ padding: '1rem 1.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>STORAGE USED</span>
                    <strong style={{ fontSize: '1.5rem', display: 'block', marginTop: '0.25rem' }}>48.6 GB</strong>
                  </div>
                </div>

                {/* Control Center and System Status */}
                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>Platform Control Center</h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>Organization Management</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Manage subscriptions & tenants.</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem' }} onClick={() => handleTabChangeAttempt('org_mgmt')}>
                          Manage Organizations →
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>User Administration</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Suspend or activate user accounts.</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem' }} onClick={() => handleTabChangeAttempt('user_mgmt')}>
                          Manage Users →
                        </button>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem', display: 'block' }}>Roles & Permissions</strong>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Configure RBAC access controls.</span>
                        </div>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem' }} onClick={() => handleTabChangeAttempt('roles_perm')}>
                          Manage Permissions →
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>System Status</h3>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Database</span>
                      <span className="badge badge-present">Operational</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>API Endpoints</span>
                      <span className="badge badge-present">Operational</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Auth Service</span>
                      <span className="badge badge-present">Operational</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Notification Service</span>
                      <span className="badge badge-present">Operational</span>
                    </div>
                  </div>
                </div>

                {/* Recent System Activity Log */}
                <div className="card glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent System Activity</h3>
                    <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem' }} onClick={() => handleTabChangeAttempt('audit_logs')}>View Audit Logs</button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                          <th style={{ padding: '0.5rem' }}>Admin</th>
                          <th style={{ padding: '0.5rem' }}>Action</th>
                          <th style={{ padding: '0.5rem' }}>Module</th>
                          <th style={{ padding: '0.5rem' }}>Date & Time</th>
                          <th style={{ padding: '0.5rem' }}>IP Address</th>
                          <th style={{ padding: '0.5rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.slice(0, 3).map(log => (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '0.5rem' }}>{log.admin}</td>
                            <td style={{ padding: '0.5rem' }}>{log.action}</td>
                            <td style={{ padding: '0.5rem' }}>{log.module}</td>
                            <td style={{ padding: '0.5rem' }}>{log.timestamp}</td>
                            <td style={{ padding: '0.5rem' }}>{log.ip}</td>
                            <td style={{ padding: '0.5rem' }}>
                              <span className={`badge ${log.status === 'Success' ? 'badge-present' : 'badge-absent'}`}>{log.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 2: ORGANIZATION MANAGEMENT */}
            {/* ======================================================== */}
            {activeSubTab === 'org_mgmt' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Organization Management</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Registered companies and subscriptions control console.</p>
                  </div>
                  <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }} onClick={() => setShowAddOrgModal(true)}>
                    + Add Organization
                  </button>
                </div>

                {/* Filter and Search Bar */}
                <div className="card glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <input 
                    type="search" 
                    placeholder="Search organizations..." 
                    className="form-control" 
                    style={{ flexGrow: 1, minWidth: '200px' }} 
                    value={orgSearchText}
                    onChange={(e) => setOrgSearchText(e.target.value)}
                  />
                  <select className="form-control" style={{ width: '150px' }} value={orgStatusFilter} onChange={(e) => setOrgStatusFilter(e.target.value)}>
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>

                {/* Orgs Table */}
                <div className="card glass-card" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.75rem' }}>Organization</th>
                        <th style={{ padding: '0.75rem' }}>Admin</th>
                        <th style={{ padding: '0.75rem' }}>Employees</th>
                        <th style={{ padding: '0.75rem' }}>Plan</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                        <th style={{ padding: '0.75rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {organizations
                        .filter(o => o.name.toLowerCase().includes(orgSearchText.toLowerCase()))
                        .filter(o => orgStatusFilter === 'All' || o.status === orgStatusFilter)
                        .map(org => (
                          <tr key={org.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{org.name}</td>
                            <td style={{ padding: '0.75rem' }}>{org.adminName}</td>
                            <td style={{ padding: '0.75rem' }}>{org.employeesCount}</td>
                            <td style={{ padding: '0.75rem' }}>{org.plan}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span className={`badge ${org.status === 'Active' ? 'badge-present' : 'badge-absent'}`}>{org.status}</span>
                            </td>
                            <td style={{ padding: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                              <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem' }} onClick={() => handleToggleOrgStatus(org.id, org.status)}>
                                {org.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--status-leave)' }} onClick={() => handleDeleteOrg(org.id, org.name)}>
                                Delete
                              </button>
                              <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--accent-primary)' }} onClick={() => handleLoginAsOrgAdmin(org.name, org.adminName)}>
                                Login 
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Organization Modal */}
                {showAddOrgModal && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <form onSubmit={handleCreateOrganization} className="card glass-card" style={{ padding: '2rem', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', background: '#ffffff', textAlign: 'left' }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', fontWeight: 800 }}>+ Register New Organization</h3>
                      
                      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Organization Name *</label>
                          <input type="text" className="form-control" value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Industry</label>
                          <select className="form-control" value={newOrgIndustry} onChange={(e) => setNewOrgIndustry(e.target.value)}>
                            <option value="Technology">Technology</option>
                            <option value="Finance">Finance</option>
                            <option value="Retail">Retail</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Company Email *</label>
                          <input type="email" className="form-control" value={newOrgEmail} onChange={(e) => setNewOrgEmail(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Phone</label>
                          <input type="text" className="form-control" value={newOrgPhone} onChange={(e) => setNewOrgPhone(e.target.value)} />
                        </div>
                      </div>

                      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Subscription Plan</label>
                          <select className="form-control" value={newOrgPlan} onChange={(e) => setNewOrgPlan(e.target.value as any)}>
                            <option value="Basic">Basic Plan</option>
                            <option value="Premium">Premium Plan</option>
                            <option value="Enterprise">Enterprise Plan</option>
                          </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Org Admin Name *</label>
                          <input type="text" className="form-control" value={newOrgAdmin} onChange={(e) => setNewOrgAdmin(e.target.value)} required />
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowAddOrgModal(false)}>Cancel</button>
                        <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.25rem' }}>Create Organization</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 3: USER MANAGEMENT */}
            {/* ======================================================== */}
            {activeSubTab === 'user_mgmt' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>User Management</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Control platform-wide user roles, suspensions, and resets.</p>
                  </div>
                  <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }} onClick={() => setShowAddUserModal(true)}>
                    + Add User
                  </button>
                </div>

                {/* Bulk Actions Panel */}
                <div className="card glass-card" style={{ padding: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input 
                    type="search" 
                    placeholder="Search users..." 
                    className="form-control" 
                    style={{ flexGrow: 1, marginRight: '1rem', minWidth: '200px' }} 
                    value={userSearchText}
                    onChange={(e) => setUserSearchText(e.target.value)}
                  />
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.8rem' }} onClick={() => handleBulkStatusChange('Active')}>Activate Selected</button>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.8rem' }} onClick={() => handleBulkStatusChange('Suspended')}>Suspend Selected</button>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.8rem', color: 'var(--status-leave)' }} onClick={handleBulkDelete}>Delete Selected</button>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '34px', fontSize: '0.8rem' }} onClick={handleExportUsers}>Export Users</button>
                </div>

                {/* Users Table */}
                <div className="card glass-card" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.75rem', width: '40px' }}>
                          <input type="checkbox" checked={selectedUserIds.length === users.length} onChange={handleToggleSelectAllUsers} />
                        </th>
                        <th style={{ padding: '0.75rem' }}>Name</th>
                        <th style={{ padding: '0.75rem' }}>Email</th>
                        <th style={{ padding: '0.75rem' }}>Role</th>
                        <th style={{ padding: '0.75rem' }}>Organization</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                        <th style={{ padding: '0.75rem' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users
                        .filter(u => u.name.toLowerCase().includes(userSearchText.toLowerCase()))
                        .map(user => (
                          <tr key={user.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '0.75rem' }}>
                              <input type="checkbox" checked={selectedUserIds.includes(user.id)} onChange={() => handleToggleSelectUser(user.id)} />
                            </td>
                            <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{user.name}</td>
                            <td style={{ padding: '0.75rem' }}>{user.email}</td>
                            <td style={{ padding: '0.75rem' }}>{user.role}</td>
                            <td style={{ padding: '0.75rem' }}>{user.organization}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <span className={`badge ${user.status === 'Active' ? 'badge-present' : 'badge-absent'}`}>{user.status}</span>
                            </td>
                            <td style={{ padding: '0.75rem', display: 'flex', gap: '0.35rem' }}>
                              <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem' }} onClick={() => handleToggleUserStatus(user.id, user.status)}>
                                {user.status === 'Active' ? 'Suspend' : 'Activate'}
                              </button>
                              <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem' }} onClick={() => handleResetPassword(user.email)}>
                                Reset
                              </button>
                              <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--status-leave)' }} onClick={() => handleDeleteUser(user.id, user.name)}>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Add User Modal */}
                {showAddUserModal && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <form onSubmit={handleCreateUser} className="card glass-card" style={{ padding: '2rem', maxWidth: '500px', width: '100%', background: '#ffffff', textAlign: 'left' }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>+ Create Platform User</h3>
                      
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Full Name *</label>
                        <input type="text" className="form-control" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Email Address *</label>
                        <input type="email" className="form-control" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                      </div>

                      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1.25rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Organization</label>
                          <select className="form-control" value={newUserOrg} onChange={(e) => setNewUserOrg(e.target.value)}>
                            {organizations.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
                          </select>
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Role</label>
                          <select className="form-control" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as any)}>
                            <option value="System Administrator">System Administrator</option>
                            <option value="HR Administrator">HR Administrator</option>
                            <option value="Employer">Employer</option>
                            <option value="Employee">Employee</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowAddUserModal(false)}>Cancel</button>
                        <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.25rem' }}>Create User</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 4: ROLES & PERMISSIONS */}
            {/* ======================================================== */}
            {activeSubTab === 'roles_perm' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Roles & Permissions</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure role-based access control permission matrices.</p>
                  </div>
                  <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }} onClick={() => setShowAddRoleModal(true)}>
                    + Create Role
                  </button>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  {/* Roles Directory */}
                  <div className="card glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: 700 }}>Roles Directory</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {roles.map(r => (
                        <div 
                          key={r.name} 
                          className={`employee-list-row ${selectedRoleName === r.name ? 'active-row' : ''}`} 
                          style={{ padding: '0.75rem 1rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s', border: selectedRoleName === r.name ? '1px solid var(--accent-primary)' : '1px solid transparent' }}
                          onClick={() => setSelectedRoleName(r.name)}
                        >
                          <div style={{ textAlign: 'left' }}>
                            <strong style={{ fontSize: '0.9rem', display: 'block' }}>{r.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Users: {r.usersCount}</span>
                          </div>
                          {r.name !== 'Super Administrator' && (
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '26px', fontSize: '0.7rem', padding: '0 0.35rem', color: 'var(--status-leave)' }} onClick={(e) => { e.stopPropagation(); handleDeleteRole(r.name); }}>
                              Delete
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Permission Matrix */}
                  <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Permissions Matrix: {selectedRoleName}</h3>
                      <button type="button" className="btn-submit-request" style={{ height: '34px', fontSize: '0.8rem', padding: '0 1rem' }} onClick={handleSavePermissions}>Save Permissions</button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '0.5rem' }}>Module</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>View</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Create</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Edit</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Delete</th>
                            <th style={{ padding: '0.5rem', textAlign: 'center' }}>Approve</th>
                          </tr>
                        </thead>
                        <tbody>
                          {['Organizations', 'Users', 'Employees', 'Attendance', 'Leave', 'Payroll', 'Reports', 'Settings'].map(mod => {
                            const p = roles.find(r => r.name === selectedRoleName)?.permissions[mod] || {};
                            const disabled = selectedRoleName === 'Super Administrator';
                            return (
                              <tr key={mod} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                                <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{mod}</td>
                                {['view', 'create', 'edit', 'delete', 'approve'].map(act => (
                                  <td key={act} style={{ padding: '0.5rem', textAlign: 'center' }}>
                                    <input 
                                      type="checkbox" 
                                      checked={!!p[act]} 
                                      disabled={disabled}
                                      onChange={() => handlePermissionToggle(mod, act)}
                                    />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Add Role Modal */}
                {showAddRoleModal && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <form onSubmit={handleCreateRole} className="card glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '100%', background: '#ffffff', textAlign: 'left' }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>+ Create Role</h3>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Role Name</label>
                        <input type="text" className="form-control" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} required />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Description</label>
                        <textarea className="form-control" rows={2} value={newRoleDesc} onChange={(e) => setNewRoleDesc(e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowAddRoleModal(false)}>Cancel</button>
                        <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.25rem' }}>Create Role</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 5: SYSTEM CONFIGURATION */}
            {/* ======================================================== */}
            {activeSubTab === 'sys_config' && (
              <form onSubmit={handleSaveSystemConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System Configuration</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Global platform-level parameters and regional formatting selectors.</p>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  {/* General settings */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>General & Regional Settings</h3>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Platform Name</label>
                      <input type="text" className="form-control" value={platformName} onChange={(e) => { setPlatformName(e.target.value); setIsDirty(true); }} />
                    </div>

                    <div className="grid-2" style={{ gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Default Currency</label>
                        <select className="form-control" value={saCurrency} onChange={(e) => { setSaCurrency(e.target.value); setIsDirty(true); }}>
                          <option value="INR">INR (₹)</option>
                          <option value="USD">USD ($)</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Default Time Zone</label>
                        <select className="form-control" value={saTimezone} onChange={(e) => { setSaTimezone(e.target.value); setIsDirty(true); }}>
                          <option value="Asia/Kolkata">Asia/Kolkata</option>
                          <option value="UTC">UTC</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid-2" style={{ gap: '1rem' }}>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Date Format</label>
                        <select className="form-control" value={saDateFormat} onChange={(e) => { setSaDateFormat(e.target.value); setIsDirty(true); }}>
                          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        </select>
                      </div>
                      <div className="form-group" style={{ margin: 0 }}>
                        <label>Time Format</label>
                        <select className="form-control" value={saTimeFormat} onChange={(e) => { setSaTimeFormat(e.target.value); setIsDirty(true); }}>
                          <option value="12">12 Hour</option>
                          <option value="24">24 Hour</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Language</label>
                      <select className="form-control" value={saLanguage} onChange={(e) => { setSaLanguage(e.target.value); setIsDirty(true); }}>
                        <option value="English">English</option>
                        <option value="Spanish">Spanish</option>
                      </select>
                    </div>
                  </div>

                  {/* Platform toggles */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Platform Control Rules</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Enable Organization Registration</span>
                      <input type="checkbox" checked={saOrgRegEnabled} onChange={(e) => { setSaOrgRegEnabled(e.target.checked); setIsDirty(true); }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Enable Employee Self-Service</span>
                      <input type="checkbox" checked={saSelfServiceEnabled} onChange={(e) => { setSaSelfServiceEnabled(e.target.checked); setIsDirty(true); }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Enable Employer Self-Service</span>
                      <input type="checkbox" checked={saEmployerSelfService} onChange={(e) => { setSaEmployerSelfService(e.target.checked); setIsDirty(true); }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Enable Public Organization Signups</span>
                      <input type="checkbox" checked={saPublicReg} onChange={(e) => { setSaPublicReg(e.target.checked); setIsDirty(true); }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Require Email Verification</span>
                      <input type="checkbox" checked={saEmailVerify} onChange={(e) => { setSaEmailVerify(e.target.checked); setIsDirty(true); }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Enable Maintenance Mode</span>
                      <input type="checkbox" checked={saMaintenanceMode} onChange={(e) => { setSaMaintenanceMode(e.target.checked); setIsDirty(true); }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleResetSystemConfig}>Reset Defaults</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* TAB 6: SECURITY SETTINGS */}
            {/* ======================================================== */}
            {activeSubTab === 'sec_settings' && (
              <form onSubmit={handleSaveSecuritySettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Security Configuration</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure two-factor auth, session lockouts, password rules, and IP limits.</p>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  {/* Policies */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Password Policies</h3>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Minimum Password Length</label>
                      <input type="number" className="form-control" value={secMinLength} onChange={(e) => { setSecMinLength(Number(e.target.value)); setIsDirty(true); }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Require Uppercase Character</span>
                      <input type="checkbox" checked={secRequireUpper} onChange={(e) => { setSecRequireUpper(e.target.checked); setIsDirty(true); }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Require Lowercase Character</span>
                      <input type="checkbox" checked={secRequireLower} onChange={(e) => { setSecRequireLower(e.target.checked); setIsDirty(true); }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Require Numeric Digit</span>
                      <input type="checkbox" checked={secRequireNumber} onChange={(e) => { setSecRequireNumber(e.target.checked); setIsDirty(true); }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Require Special Symbol</span>
                      <input type="checkbox" checked={secRequireSpecial} onChange={(e) => { setSecRequireSpecial(e.target.checked); setIsDirty(true); }} />
                    </div>
                  </div>

                  {/* Session and Access Whitelists */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Session & Access Security</h3>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Session Timeout (Minutes)</label>
                      <input type="number" className="form-control" value={secSessionTimeout} onChange={(e) => { setSecSessionTimeout(Number(e.target.value)); setIsDirty(true); }} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Maximum Login Attempts</label>
                      <input type="number" className="form-control" value={secMaxAttempts} onChange={(e) => { setSecMaxAttempts(Number(e.target.value)); setIsDirty(true); }} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Account Lockout Duration (Minutes)</label>
                      <input type="number" className="form-control" value={secLockoutMins} onChange={(e) => { setSecLockoutMins(Number(e.target.value)); setIsDirty(true); }} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>MFA Enforcements</label>
                      <select className="form-control" value={mfaPref} onChange={(e) => { setMfaPref(e.target.value); setIsDirty(true); }}>
                        <option value="OPTIONAL">Optional for all users</option>
                        <option value="ENFORCED">Enforced for all admin roles</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>IP Whitelist Range</label>
                      <input type="text" placeholder="e.g. 192.168.1.0/24 (Comma separated)" className="form-control" value={secIpWhitelist} onChange={(e) => { setSecIpWhitelist(e.target.value); setIsDirty(true); }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Security Settings</button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* TAB 7: NOTIFICATION SETTINGS */}
            {/* ======================================================== */}
            {activeSubTab === 'notif_settings' && (
              <form onSubmit={handleSaveNotificationSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Notification Configuration</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure global transaction notification triggers and active SMS/Email gateways.</p>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  {/* Channels */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Notification Channels</h3>
                    {['email', 'sms', 'push', 'in-app'].map(c => (
                      <div key={c} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                        <span style={{ textTransform: 'capitalize' }}>{c} Notifications</span>
                        <input type="checkbox" checked={notifChannels.includes(c)} onChange={() => handleToggleChannel(c)} />
                      </div>
                    ))}
                  </div>

                  {/* Events */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Event Triggers</h3>
                    {['New Organization', 'New User', 'Employee Added', 'Leave Request', 'Payroll Generated', 'Password Reset', 'Security Alert'].map(ev => (
                      <div key={ev} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem' }}>{ev} Alert</span>
                        <input type="checkbox" checked={notifEvents.includes(ev)} onChange={() => handleToggleEvent(ev)} />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary font-semibold" style={{ minHeight: '40px', padding: '0 1.25rem' }} onClick={() => showToast('Configured Twilio / Amazon SES servers.', 'info')}>Configure Gateways</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Notification Settings</button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* TAB 8: ATTENDANCE CONFIGURATION */}
            {/* ======================================================== */}
            {activeSubTab === 'att_config' && (
              <form onSubmit={handleSaveAttendanceConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Attendance Configuration</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Global attendance templates, biometric syncs, and default grace margins.</p>
                </div>

                <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Default Work Start Time</label>
                      <input type="text" className="form-control" value={attStart} onChange={(e) => { setAttStart(e.target.value); setIsDirty(true); }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Default Work End Time</label>
                      <input type="text" className="form-control" value={attEnd} onChange={(e) => { setAttEnd(e.target.value); setIsDirty(true); }} />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Grace Period (Minutes)</label>
                      <input type="number" className="form-control" value={attGrace} onChange={(e) => { setAttGrace(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Late Warning Threshold (Minutes)</label>
                      <input type="number" className="form-control" value={attLate} onChange={(e) => { setAttLate(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                  </div>

                  <div className="grid-2" style={{ gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px' }}>
                      <input type="checkbox" checked={attOTEnabled} onChange={(e) => { setAttOTEnabled(e.target.checked); setIsDirty(true); }} />
                      <span>Allow Overtime Calculations</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '38px' }}>
                      <input type="checkbox" checked={attBiometric} onChange={(e) => { setAttBiometric(e.target.checked); setIsDirty(true); }} />
                      <span>Integrate Hardware Biometrics</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* TAB 9: LEAVE CONFIGURATION */}
            {/* ======================================================== */}
            {activeSubTab === 'leave_config' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Leave Configuration</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Manage global default leave quotas and policy codes.</p>
                  </div>
                  <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }} onClick={() => setShowAddLeaveModal(true)}>
                    + Add Leave Type
                  </button>
                </div>

                {/* Leaves Table */}
                <div className="card glass-card" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.75rem' }}>Leave Name</th>
                        <th style={{ padding: '0.75rem' }}>Code</th>
                        <th style={{ padding: '0.75rem' }}>Annual Limit</th>
                        <th style={{ padding: '0.75rem' }}>Carry Forward</th>
                        <th style={{ padding: '0.75rem' }}>Encashment</th>
                        <th style={{ padding: '0.75rem' }}>Approval</th>
                        <th style={{ padding: '0.75rem' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveTypes.map(item => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                          <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{item.name}</td>
                          <td style={{ padding: '0.75rem' }}>{item.code}</td>
                          <td style={{ padding: '0.75rem' }}>{item.limit} Days</td>
                          <td style={{ padding: '0.75rem' }}>{item.carryForward ? 'Yes' : 'No'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.encashment ? 'Yes' : 'No'}</td>
                          <td style={{ padding: '0.75rem' }}>{item.approvalRequired ? 'Required' : 'Auto'}</td>
                          <td style={{ padding: '0.75rem' }}>
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem' }} onClick={() => handleToggleLeaveTypeStatus(item.id, item.status)}>
                              {item.status}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add Leave Modal */}
                {showAddLeaveModal && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <form onSubmit={handleAddLeaveType} className="card glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '100%', background: '#ffffff', textAlign: 'left' }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>+ Add Leave Type</h3>
                      
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Leave Name</label>
                        <input type="text" className="form-control" value={newLeaveName} onChange={(e) => setNewLeaveName(e.target.value)} required />
                      </div>

                      <div className="grid-2" style={{ gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Code (e.g. SL)</label>
                          <input type="text" className="form-control" value={newLeaveCode} onChange={(e) => setNewLeaveCode(e.target.value)} required />
                        </div>
                        <div className="form-group" style={{ margin: 0 }}>
                          <label>Annual Quota</label>
                          <input type="number" className="form-control" value={newLeaveLimit} onChange={(e) => setNewLeaveLimit(Number(e.target.value))} required />
                        </div>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input type="checkbox" checked={newLeaveCarry} onChange={(e) => setNewLeaveCarry(e.target.checked)} />
                          <span>Allow Carry Forward</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input type="checkbox" checked={newLeaveEncash} onChange={(e) => setNewLeaveEncash(e.target.checked)} />
                          <span>Allow Quota Encashment</span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowAddLeaveModal(false)}>Cancel</button>
                        <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.25rem' }}>Add Policy</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 10: PAYROLL CONFIGURATION */}
            {/* ======================================================== */}
            {activeSubTab === 'pay_config' && (
              <form onSubmit={handleSavePayrollConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Payroll Configuration</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Global salary frequency, cycle dates, tax brackets, and bank connectors.</p>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Deduction Defaults</h3>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Default Payroll Frequency</label>
                      <select className="form-control" value={payCycle} onChange={(e) => { setPayCycle(e.target.value); setIsDirty(true); }}>
                        <option value="Monthly">Monthly</option>
                        <option value="Biweekly">Biweekly</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Default Pay Day</label>
                      <input type="number" className="form-control" value={payDay} onChange={(e) => { setPayDay(Number(e.target.value)); setIsDirty(true); }} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Flat TDS Tax Estimation (%)</label>
                      <input type="number" className="form-control" value={payTaxRate} onChange={(e) => { setPayTaxRate(Number(e.target.value)); setIsDirty(true); }} />
                    </div>
                  </div>

                  {/* Integrations */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Payroll Integration Statuses</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                      <span>Banking Gateway API</span>
                      <span className="badge badge-present" onClick={() => showToast('Bank Gateway Sync active.', 'info')} style={{ cursor: 'pointer' }}>CONNECTED</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border-glass)' }}>
                      <span>Income Tax E-filing</span>
                      <span className="badge badge-absent" onClick={() => showToast('Configure Tax e-filing.', 'info')} style={{ cursor: 'pointer' }}>NOT CONNECTED</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Changes</button>
                </div>
              </form>
            )}

            {/* ======================================================== */}
            {/* TAB 11: INTEGRATIONS */}
            {/* ======================================================== */}
            {activeSubTab === 'integrations_sa' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Integrations & API Marketplace</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Sync SSO access, SMS alerts, accounting tools, and database backups.</p>
                </div>

                <div className="grid-2" style={{ gap: '1rem' }}>
                  {integrations.map(item => (
                    <div key={item.id} className="card glass-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem' }}>{item.name}</strong>
                          <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Category: {item.category}</span>
                        </div>
                        <span className={`badge ${item.status === 'CONNECTED' ? 'badge-present' : 'badge-absent'}`}>{item.status}</span>
                      </div>
                      
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0 }}>{item.desc}</p>
                      
                      <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '30px', fontSize: '0.75rem' }} onClick={() => setShowConfigureInt(item.id)}>Configure</button>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '30px', fontSize: '0.75rem', color: item.status === 'CONNECTED' ? 'var(--status-leave)' : 'var(--accent-primary)' }} onClick={() => handleToggleIntegration(item.id, item.status)}>
                          {item.status === 'CONNECTED' ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Configuration Modal */}
                {showConfigureInt && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '100%', background: '#ffffff', textAlign: 'left' }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.15rem', fontWeight: 800 }}>Configure Credentials</h3>
                      <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label>Client ID / App Username</label>
                        <input type="text" className="form-control" defaultValue="client_id_temp_secret" />
                      </div>
                      <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label>Client Secret Key (Encrypted)</label>
                        <input type="password" className="form-control" defaultValue="••••••••••••••••••••" />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 1rem' }} onClick={() => setShowConfigureInt(null)}>Close</button>
                        <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }} onClick={() => { setShowConfigureInt(null); showToast('Integration parameters saved.', 'success'); }}>Save Credentials</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 12: AUDIT LOGS */}
            {/* ======================================================== */}
            {activeSubTab === 'audit_logs' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System Audit Trail</h2>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Trace administrative security logins, IP records, and parameters changes.</p>
                  </div>
                  <button type="button" className="btn btn-secondary font-semibold" style={{ minHeight: '38px', padding: '0 1.25rem' }} onClick={() => showToast('Audit logs exported to CSV format.', 'success')}>Export Logs</button>
                </div>

                {/* Filter and Search Bar */}
                <div className="card glass-card" style={{ padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <input 
                    type="search" 
                    placeholder="Search logs by admin or action..." 
                    className="form-control" 
                    style={{ flexGrow: 1 }} 
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                  />
                </div>

                {/* Logs Table */}
                <div className="card glass-card" style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-glass)', color: 'var(--text-secondary)' }}>
                        <th style={{ padding: '0.75rem' }}>Timestamp</th>
                        <th style={{ padding: '0.75rem' }}>Admin</th>
                        <th style={{ padding: '0.75rem' }}>Action</th>
                        <th style={{ padding: '0.75rem' }}>Module</th>
                        <th style={{ padding: '0.75rem' }}>IP Address</th>
                        <th style={{ padding: '0.75rem' }}>Browser</th>
                        <th style={{ padding: '0.75rem' }}>Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs
                        .filter(l => l.admin.toLowerCase().includes(logSearch.toLowerCase()) || l.action.toLowerCase().includes(logSearch.toLowerCase()))
                        .map(log => (
                          <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                            <td style={{ padding: '0.75rem' }}>{log.timestamp}</td>
                            <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{log.admin}</td>
                            <td style={{ padding: '0.75rem' }}>{log.action}</td>
                            <td style={{ padding: '0.75rem' }}>{log.module}</td>
                            <td style={{ padding: '0.75rem' }}>{log.ip}</td>
                            <td style={{ padding: '0.75rem' }}>{log.browser}</td>
                            <td style={{ padding: '0.75rem' }}>
                              <button type="button" className="btn btn-secondary" style={{ minHeight: '26px', fontSize: '0.75rem', padding: '0 0.5rem' }} onClick={() => setSelectedAuditLog(log)}>
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Log Details Modal */}
                {selectedAuditLog && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="card glass-card" style={{ padding: '2rem', maxWidth: '440px', width: '100%', background: '#ffffff', textAlign: 'left' }}>
                      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.2rem', fontWeight: 800 }}>Audit Event Details</h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <div><strong>Admin:</strong> {selectedAuditLog.admin}</div>
                        <div><strong>Action:</strong> {selectedAuditLog.action}</div>
                        <div><strong>Timestamp:</strong> {selectedAuditLog.timestamp}</div>
                        <div><strong>IP Address:</strong> {selectedAuditLog.ip}</div>
                        <div><strong>Browser / Device:</strong> {selectedAuditLog.browser} ({selectedAuditLog.device})</div>
                        {selectedAuditLog.prevValue && <div style={{ background: '#f8fafc', padding: '0.5rem', borderRadius: '6px', marginTop: '0.5rem' }}><strong>Previous Value:</strong> {selectedAuditLog.prevValue}</div>}
                        {selectedAuditLog.newValue && <div style={{ background: '#f0fdf4', padding: '0.5rem', borderRadius: '6px', marginTop: '0.25rem' }}><strong>New Value:</strong> {selectedAuditLog.newValue}</div>}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 1rem' }} onClick={() => setSelectedAuditLog(null)}>Close</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 13: BACKUP & DATA */}
            {/* ======================================================== */}
            {activeSubTab === 'backup_data' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Backup & Platform Data</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Configure daily scheduled cloud backups and manage logs retention policies.</p>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  {/* Backup config */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Database Backups</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Last Automated Backup</span>
                      <strong>Today, 02:00 AM (Success)</strong>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Backup Frequency</label>
                      <select className="form-control" value={backupFrequency} onChange={(e) => { setBackupFrequency(e.target.value); setIsDirty(true); }}>
                        <option value="Daily">Daily Backups</option>
                        <option value="Weekly">Weekly Backups</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Retention Period (Days)</label>
                      <input type="number" className="form-control" value={backupRetention} onChange={(e) => { setBackupRetention(Number(e.target.value)); setIsDirty(true); }} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }} onClick={handleTriggerBackup} disabled={backupLoading}>
                        {backupLoading ? 'Backing up...' : 'Backup Now'}
                      </button>
                      <button type="button" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 1rem' }} onClick={() => showToast('Preparing download links for backup dump...', 'info')}>
                        Download Backup
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', borderColor: 'rgba(220, 38, 38, 0.2)' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700, color: 'var(--status-leave)' }}>Danger Zone</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: 0 }}>
                      Purge databases or reset platforms configuration to raw default state. Unsaved data will be permanently deleted.
                    </p>
                    <button type="button" className="btn btn-secondary font-semibold" style={{ minHeight: '40px', background: 'var(--status-leave)', borderColor: 'var(--status-leave)', color: 'white' }} onClick={() => { setAdminPasswordConfirm(''); setShowDangerZoneModal(true); }}>
                      Purge Platform Data
                    </button>
                  </div>
                </div>

                {/* Danger zone verification modal */}
                {showDangerZoneModal && (
                  <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <form onSubmit={handleDeleteAllData} className="card glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '100%', background: '#ffffff', textAlign: 'center' }}>
                      <span style={{ fontSize: '3rem' }}>️</span>
                      <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.25rem', color: 'var(--status-leave)', fontWeight: 'bold' }}>Authorize Database Purge</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.4 }}>
                        This action will wipe all seeds and reset configuration records. Enter System Admin Password `AdminPassword123` to authorize deletion.
                      </p>
                      
                      <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
                        <label>Administrator Password</label>
                        <input type="password" className="form-control" value={adminPasswordConfirm} onChange={(e) => setAdminPasswordConfirm(e.target.value)} required />
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowDangerZoneModal(false)}>Cancel</button>
                        <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1rem', background: 'var(--status-leave)', border: 'none' }}>Purge Platform Data</button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 14: SYSTEM MAINTENANCE */}
            {/* ======================================================== */}
            {activeSubTab === 'sys_maint' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>System Maintenance</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Clear application caches, toggle maintenance modes, and monitor updates logs.</p>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  {/* Maintenance block */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Maintenance Mode</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Enable Global Maintenance Page</span>
                      <input type="checkbox" checked={saMaintenanceMode} onChange={(e) => { setSaMaintenanceMode(e.target.checked); showToast(`Maintenance mode ${e.target.checked ? 'activated' : 'deactivated'}.`, 'info'); }} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Maintenance Mode Header</label>
                      <input type="text" className="form-control" value={maintTitle} onChange={(e) => setMaintTitle(e.target.value)} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Maintenance Warning Message</label>
                      <textarea className="form-control" rows={2} value={maintMessage} onChange={(e) => setMaintMessage(e.target.value)} />
                    </div>
                  </div>

                  {/* Cache manager */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Purge Platform Caches</h3>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Application Core Cache</span>
                      <strong>{cacheAppSize}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>API Endpoints Buffer</span>
                      <strong>12.1 MB</strong>
                    </div>

                    <button type="button" className="btn btn-secondary font-semibold" style={{ minHeight: '40px', marginTop: '1rem' }} onClick={handleClearCache}>
                      Clear Caches Now
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ======================================================== */}
            {/* TAB 15: ADMIN PROFILE */}
            {/* ======================================================== */}
            {activeSubTab === 'admin_profile' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div className="card glass-card" style={{ padding: '1.5rem 2rem' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Admin Profile & Security</h2>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem', margin: 0 }}>Update details and manage active browser login sessions.</p>
                </div>

                <div className="grid-2" style={{ gap: '1.5rem' }}>
                  {/* Account details */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Account Information</h3>
                    
                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Full Name</label>
                      <input type="text" className="form-control" value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Email Address</label>
                      <input type="email" className="form-control" value={userEmail} disabled />
                    </div>

                    <div className="form-group" style={{ margin: 0 }}>
                      <label>Phone Number</label>
                      <input type="text" className="form-control" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} />
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button type="button" className="btn-submit-request" style={{ height: '38px', padding: '0 1rem' }} onClick={() => showToast('Admin profile details updated.', 'success')}>
                        Save Changes
                      </button>
                      <button type="button" className="btn btn-secondary" style={{ minHeight: '38px', padding: '0 1rem' }} onClick={() => showToast('Password reset email triggered.', 'success')}>
                        Change Password
                      </button>
                    </div>
                  </div>

                  {/* Active Browser Sessions */}
                  <div className="card glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '1rem', margin: 0, fontWeight: 700 }}>Active Browser Sessions</h3>
                      <button type="button" className="btn btn-secondary" style={{ minHeight: '32px', fontSize: '0.75rem', color: 'var(--status-leave)' }} onClick={handleLogoutAllOther}>Logout Others</button>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {profileSessions.map(sess => (
                        <div key={sess.id} className="employee-list-row" style={{ padding: '0.75rem 1rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ textAlign: 'left' }}>
                            <strong style={{ fontSize: '0.85rem', display: 'block' }}>{sess.device} — {sess.browser}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>IP: {sess.ip} | Location: {sess.location} ({sess.active})</span>
                          </div>
                          {!sess.current && (
                            <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem', color: 'var(--status-leave)' }} onClick={() => handleRevokeProfileSession(sess.id)}>Revoke</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
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
                    </div>
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
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {departments.map(d => (
                        <div key={d.id} className="employee-list-row" style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', textDecoration: d.isActive ? 'none' : 'line-through', color: d.isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>{d.name}</span>
                          <button type="button" className="btn btn-secondary" style={{ minHeight: '28px', padding: '0 0.5rem', fontSize: '0.75rem' }} onClick={() => handleToggleDeptStatus(d.id)}>{d.isActive ? 'Deactivate' : 'Activate'}</button>
                        </div>
                      ))}
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
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                  <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1.5rem' }} onClick={handleCancel}>Cancel</button>
                  <button type="submit" className="btn-submit-request" style={{ height: '40px', padding: '0 1.5rem' }}>Save Changes</button>
                </div>
              </form>
            )}
          </>
        )}

      </div>

      {/* Discard changes warning modal */}
      {showDiscardModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card glass-card" style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center', background: '#ffffff' }}>
            <span style={{ fontSize: '2.5rem' }}>️</span>
            <h3 style={{ margin: '1rem 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 'bold' }}>Unsaved Changes</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.5rem 0 1.5rem 0', lineHeight: 1.4 }}>
              You have unsaved changes in this settings section. Discarding them will revert your settings back to their last state.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem' }} onClick={() => setShowDiscardModal(false)}>Keep Editing</button>
              <button type="button" className="btn btn-secondary" style={{ minHeight: '40px', padding: '0 1rem', background: 'var(--status-leave)', color: 'white', borderColor: 'var(--status-leave)' }} onClick={handleConfirmDiscard}>Discard Changes</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .settings-sidebar {
          width: 280px;
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

        .active-row {
          background: rgba(37, 99, 235, 0.05);
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
