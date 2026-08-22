// ==========================================
// HRMS Mock API & State Layer (localStorage)
// ==========================================

export type UserRole = 'ADMIN' | 'HR_OFFICER' | 'EMPLOYEE';

export interface Employee {
  id: string;
  loginId: string;
  firstName: string;
  lastName: string;
  email: string;
  personalEmail?: string;
  mobile: string;
  department: string;
  jobPosition: string;
  managerId?: string;
  companyId: string;
  location: string;
  dateOfBirth: string;
  dateOfJoining: string;
  residingAddress: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  nationality: string;
  maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  panNo?: string;
  uanNo?: string;
  empCode: string;
  bankAccountNumber: string; // Plain in mock, simulated encrypted at rest
  bankName: string;
  ifscCode: string;
  resumeUrl?: string;
  skills: string[];
  certifications: string[];
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  mustResetPassword?: boolean;
  passwordHash: string; // Mock password check
}

export type WageType = 'FIXED';
export type WagePeriod = 'MONTHLY' | 'YEARLY';

export interface SalaryComponent {
  name: 'BASIC' | 'HRA' | 'STANDARD_ALLOWANCE' | 'PERFORMANCE_BONUS' | 'LTA' | 'FIXED_ALLOWANCE';
  computationType: 'FIXED_AMOUNT' | 'PERCENTAGE_OF_WAGE' | 'PERCENTAGE_OF_COMPONENT';
  computationValue: number; // percentage (e.g. 50) or paise
  referenceComponent?: 'BASIC';
  computedAmount: number; // paise
}

export interface SalaryConfig {
  employeeId: string;
  wageType: WageType;
  wagePeriod: WagePeriod;
  wageAmount: number; // paise
  components: SalaryComponent[];
  pfEmployeeRate: number; // e.g. 0.12
  pfEmployerRate: number; // e.g. 0.12
  professionalTax: number; // paise
}

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInAt?: string; // ISO String
  checkOutAt?: string; // ISO String
  workHours?: number; // hours
  extraHours?: number; // hours
  breakTime?: number; // minutes
  status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE';
}

export type TimeOffType = 'PAID_TIME_OFF' | 'SICK_LEAVE' | 'UNPAID_LEAVE';

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  type: TimeOffType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  allocationDays: number;
  attachmentUrl?: string;
  reason?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewerId?: string;
  reviewerNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface TimeOffBalance {
  employeeId: string;
  type: 'PAID_TIME_OFF' | 'SICK_LEAVE';
  allocatedDays: number;
  usedDays: number;
  remainingDays: number;
}

// LocalStorage Keys
const KEYS = {
  EMPLOYEES: 'hrms_employees',
  SALARIES: 'hrms_salaries',
  ATTENDANCE: 'hrms_attendance',
  LEAVE_REQUESTS: 'hrms_leave_requests',
  LEAVE_BALANCES: 'hrms_leave_balances',
  CURRENT_USER: 'hrms_current_user',
};

// Default Configurations
const DEFAULT_CONFIGS = {
  COMPANY_PREFIX: 'OI',
  STANDARD_WORK_HOURS: 8,
  DEFAULT_BREAK_TIME_MINS: 60, // 1 hour
  SICK_LEAVE_ATTACHMENT_THRESHOLD_DAYS: 2,
};

// Seed Data
const SEED_EMPLOYEES: Employee[] = [
  {
    id: 'emp-admin-uuid',
    loginId: 'OIADMI20260001',
    firstName: 'System',
    lastName: 'Admin',
    email: 'admin@company.com',
    mobile: '9876543210',
    department: 'Operations',
    jobPosition: 'IT Administrator',
    companyId: 'OI-UUID',
    location: 'Bangalore',
    dateOfBirth: '1985-05-10',
    dateOfJoining: '2026-01-01',
    residingAddress: '123 Admin Lane, Bangalore, India',
    gender: 'MALE',
    nationality: 'Indian',
    maritalStatus: 'MARRIED',
    empCode: 'ADM-001',
    bankAccountNumber: '12345678901',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0001234',
    skills: ['Admin', 'Security', 'Networks'],
    certifications: ['CISSP'],
    role: 'ADMIN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mustResetPassword: false,
    passwordHash: 'AdminPassword123' // Mock plaintext check for demo simplicity
  },
  {
    id: 'emp-hr-uuid',
    loginId: 'OIHRMS20260002',
    firstName: 'HR',
    lastName: 'Officer',
    email: 'hr@company.com',
    mobile: '9876543211',
    department: 'Human Resources',
    jobPosition: 'HR Manager',
    companyId: 'OI-UUID',
    location: 'Bangalore',
    dateOfBirth: '1990-08-15',
    dateOfJoining: '2026-01-01',
    residingAddress: '456 HR Blvd, Bangalore, India',
    gender: 'FEMALE',
    nationality: 'Indian',
    maritalStatus: 'SINGLE',
    empCode: 'HR-001',
    bankAccountNumber: '98765432109',
    bankName: 'HDFC Bank',
    ifscCode: 'HDFC0000123',
    skills: ['Onboarding', 'Payroll', 'Relations'],
    certifications: ['SHRM-CP'],
    role: 'HR_OFFICER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mustResetPassword: false,
    passwordHash: 'HRPassword123'
  },
  {
    id: 'emp-employee-uuid',
    loginId: 'OIANRA20260003',
    firstName: 'Anita',
    lastName: 'Rao',
    email: 'employee@company.com',
    mobile: '9876543212',
    department: 'Engineering',
    jobPosition: 'Software Engineer',
    managerId: 'emp-hr-uuid',
    companyId: 'OI-UUID',
    location: 'Bangalore',
    dateOfBirth: '1995-12-05',
    dateOfJoining: '2026-03-15',
    residingAddress: '789 Developer Rd, Bangalore, India',
    gender: 'FEMALE',
    nationality: 'Indian',
    maritalStatus: 'SINGLE',
    empCode: 'ENG-001',
    bankAccountNumber: '55554444333',
    bankName: 'ICICI Bank',
    ifscCode: 'ICIC0000456',
    skills: ['React', 'TypeScript', 'CSS'],
    certifications: ['AWS Cloud Practitioner'],
    role: 'EMPLOYEE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mustResetPassword: true, // Forces reset on first login
    passwordHash: 'EmpPassword123'
  }
];

const SEED_BALANCES: TimeOffBalance[] = [
  { employeeId: 'emp-admin-uuid', type: 'PAID_TIME_OFF', allocatedDays: 24, usedDays: 0, remainingDays: 24 },
  { employeeId: 'emp-admin-uuid', type: 'SICK_LEAVE', allocatedDays: 7, usedDays: 0, remainingDays: 7 },
  
  { employeeId: 'emp-hr-uuid', type: 'PAID_TIME_OFF', allocatedDays: 24, usedDays: 0, remainingDays: 24 },
  { employeeId: 'emp-hr-uuid', type: 'SICK_LEAVE', allocatedDays: 7, usedDays: 0, remainingDays: 7 },
  
  { employeeId: 'emp-employee-uuid', type: 'PAID_TIME_OFF', allocatedDays: 24, usedDays: 2, remainingDays: 22 }, // used 2 unpaid/paid days
  { employeeId: 'emp-employee-uuid', type: 'SICK_LEAVE', allocatedDays: 7, usedDays: 0, remainingDays: 7 },
];

const SEED_SALARIES: SalaryConfig[] = [
  {
    employeeId: 'emp-employee-uuid',
    wageType: 'FIXED',
    wagePeriod: 'MONTHLY',
    wageAmount: 5000000, // ₹50,000 in paise
    pfEmployeeRate: 0.12,
    pfEmployerRate: 0.12,
    professionalTax: 20000, // ₹200 in paise
    components: [
      { name: 'BASIC', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 50, computedAmount: 2500000 },
      { name: 'HRA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 50, referenceComponent: 'BASIC', computedAmount: 1250000 },
      { name: 'STANDARD_ALLOWANCE', computationType: 'FIXED_AMOUNT', computationValue: 416700, computedAmount: 416700 },
      { name: 'PERFORMANCE_BONUS', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 8.33, referenceComponent: 'BASIC', computedAmount: 208250 },
      { name: 'LTA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 8.33, referenceComponent: 'BASIC', computedAmount: 208250 },
      { name: 'FIXED_ALLOWANCE', computationType: 'FIXED_AMOUNT', computationValue: 416800, computedAmount: 416800 } // balancing
    ]
  }
];

const SEED_ATTENDANCE: Attendance[] = [
  // Anita Rao checked in/out on 2026-08-20 (Normal working day, worked 8 hours, 1 hour break)
  {
    id: 'att-1',
    employeeId: 'emp-employee-uuid',
    date: '2026-08-20',
    checkInAt: '2026-08-20T03:30:00Z', // 09:00 AM IST
    checkOutAt: '2026-08-20T12:30:00Z', // 06:00 PM IST
    workHours: 8.0,
    extraHours: 0.0,
    breakTime: 60,
    status: 'PRESENT'
  },
  // Anita Rao checked in/out on 2026-08-21 (Normal working day, worked 9.5 hours, 1 hour break)
  {
    id: 'att-2',
    employeeId: 'emp-employee-uuid',
    date: '2026-08-21',
    checkInAt: '2026-08-21T03:30:00Z', // 09:00 AM IST
    checkOutAt: '2026-08-21T14:00:00Z', // 07:30 PM IST
    workHours: 9.5,
    extraHours: 1.5,
    breakTime: 60,
    status: 'PRESENT'
  }
];

// Helper to initialize local storage
export const initializeMockDB = () => {
  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(SEED_EMPLOYEES));
  }
  if (!localStorage.getItem(KEYS.SALARIES)) {
    localStorage.setItem(KEYS.SALARIES, JSON.stringify(SEED_SALARIES));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE)) {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE));
  }
  if (!localStorage.getItem(KEYS.LEAVE_BALANCES)) {
    localStorage.setItem(KEYS.LEAVE_BALANCES, JSON.stringify(SEED_BALANCES));
  }
  if (!localStorage.getItem(KEYS.LEAVE_REQUESTS)) {
    localStorage.setItem(KEYS.LEAVE_REQUESTS, JSON.stringify([]));
  }
};

// Database Accessors
export const getStoredData = <T>(key: string): T[] => {
  initializeMockDB();
  return JSON.parse(localStorage.getItem(key) || '[]');
};

const saveStoredData = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// --- AUTHENTICATION API ---

export const mockAuthLogin = async (identifier: string, passwordHash: string) => {
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  
  // Find employee by email or loginId
  const employee = employees.find(
    (emp) => (emp.email === identifier || emp.loginId === identifier)
  );

  if (!employee || employee.passwordHash !== passwordHash) {
    throw { errorCode: 'ERR-AUTH-01', message: 'Invalid Login ID/Email or password.' };
  }

  const token = `mock-jwt-token-for-${employee.id}`;
  const response = {
    token,
    mustResetPassword: !!employee.mustResetPassword,
    role: employee.role,
    user: {
      id: employee.id,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      loginId: employee.loginId,
      role: employee.role
    }
  };

  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(response));
  return response;
};

export const mockAuthLogout = () => {
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const mockGetCurrentUser = () => {
  const current = localStorage.getItem(KEYS.CURRENT_USER);
  return current ? JSON.parse(current) : null;
};

export const mockResetPassword = async (employeeId: string, currentPasswordHash: string, newPasswordHash: string) => {
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const index = employees.findIndex((emp) => emp.id === employeeId);

  if (index === -1) {
    throw { errorCode: 'ERR-AUTH-01', message: 'Employee not found.' };
  }

  const emp = employees[index];
  if (emp.passwordHash !== currentPasswordHash) {
    throw { errorCode: 'ERR-AUTH-01', message: 'Incorrect current password.', field: 'currentPassword' };
  }

  // Password policy check: min 10 characters, upper, lower, digit
  const passwordLength = newPasswordHash.length;
  const hasUpper = /[A-Z]/.test(newPasswordHash);
  const hasLower = /[a-z]/.test(newPasswordHash);
  const hasDigit = /[0-9]/.test(newPasswordHash);

  if (passwordLength < 10 || !hasUpper || !hasLower || !hasDigit) {
    throw {
      errorCode: 'ERR-VAL-01',
      message: 'Password must be at least 10 characters long, containing uppercase, lowercase, and numeric characters.',
      field: 'newPassword'
    };
  }

  emp.passwordHash = newPasswordHash;
  emp.mustResetPassword = false;
  emp.updatedAt = new Date().toISOString();

  employees[index] = emp;
  saveStoredData(KEYS.EMPLOYEES, employees);

  // Update active session
  const activeSession = mockGetCurrentUser();
  if (activeSession && activeSession.user.id === employeeId) {
    activeSession.mustResetPassword = false;
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(activeSession));
  }

  return { success: true };
};

// --- EMPLOYEES API ---

export const mockCreateEmployee = async (callerId: string, employeeData: Omit<Employee, 'id' | 'loginId' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'empCode'>) => {
  const caller = getStoredData<Employee>(KEYS.EMPLOYEES).find((e) => e.id === callerId);
  if (!caller || (caller.role !== 'ADMIN' && caller.role !== 'HR_OFFICER')) {
    throw { errorCode: 'ERR-SEC-01', message: 'Unauthorized. Only Admins or HR Officers can onboarding new employees.' };
  }

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);

  // Check email conflict
  if (employees.some((e) => e.email === employeeData.email)) {
    throw { errorCode: 'ERR-VAL-02', message: 'An employee with this email already exists.', field: 'email' };
  }

  const id = `emp-uuid-${Math.random().toString(36).substr(2, 9)}`;
  const dateObj = new Date(employeeData.dateOfJoining);
  const year = dateObj.getFullYear();

  // Serial logic: Count hires for this prefix + year
  const prefix = DEFAULT_CONFIGS.COMPANY_PREFIX;
  const yearlyHires = employees.filter((e) => {
    const eDate = new Date(e.dateOfJoining);
    return e.loginId.startsWith(prefix) && eDate.getFullYear() === year;
  });

  const nextSerial = yearlyHires.length + 1;
  const serialStr = String(nextSerial).padStart(4, '0');

  // Format first 2 letters of first name and last name, uppercase
  const first2First = employeeData.firstName.substring(0, 2).toUpperCase().padEnd(2, 'X');
  const first2Last = employeeData.lastName.substring(0, 2).toUpperCase().padEnd(2, 'X');

  const loginId = `${prefix}${first2First}${first2Last}${year}${serialStr}`;
  const empCode = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
  const tempPassword = `TempPass@${Math.floor(1000 + Math.random() * 9000)}`;

  const newEmployee: Employee = {
    ...employeeData,
    id,
    loginId,
    empCode,
    passwordHash: tempPassword, // Initial single-use password
    mustResetPassword: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  employees.push(newEmployee);
  saveStoredData(KEYS.EMPLOYEES, employees);

  // Create initial Leave Balances
  const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
  balances.push(
    { employeeId: id, type: 'PAID_TIME_OFF', allocatedDays: 24, usedDays: 0, remainingDays: 24 },
    { employeeId: id, type: 'SICK_LEAVE', allocatedDays: 7, usedDays: 0, remainingDays: 7 }
  );
  saveStoredData(KEYS.LEAVE_BALANCES, balances);

  // Create initial SalaryConfig (defaulting to zero wage, ready for Admin setup)
  const salaries = getStoredData<SalaryConfig>(KEYS.SALARIES);
  salaries.push({
    employeeId: id,
    wageType: 'FIXED',
    wagePeriod: 'MONTHLY',
    wageAmount: 0,
    pfEmployeeRate: 0.12,
    pfEmployerRate: 0.12,
    professionalTax: 20000,
    components: []
  });
  saveStoredData(KEYS.SALARIES, salaries);

  return {
    employeeId: id,
    loginId,
    tempPassword
  };
};

export const mockGetEmployees = (callerRole: UserRole, viewReadOnly: boolean = false) => {
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);

  return employees.map((emp) => {
    // If not Admin or HR and we are loading in detailed edit mode, throw.
    // In read-only mode, strip sensitive bank/salary fields.
    if (viewReadOnly) {
      const { bankAccountNumber, bankName, ifscCode, panNo, uanNo, passwordHash, ...safeInfo } = emp;
      return safeInfo;
    }
    
    // If caller is HR/Admin, they see everything. If EMPLOYEE calls they only get safety data.
    if (callerRole === 'EMPLOYEE') {
      const { bankAccountNumber, bankName, ifscCode, passwordHash, ...safeInfo } = emp;
      return safeInfo;
    }
    
    return emp;
  });
};

export const mockGetEmployeeById = (callerId: string, callerRole: UserRole, targetId: string, viewReadOnly: boolean = false) => {
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const emp = employees.find((e) => e.id === targetId);

  if (!emp) return null;

  if (callerId !== targetId && callerRole === 'EMPLOYEE' && !viewReadOnly) {
    throw { errorCode: 'ERR-SEC-01', message: 'Forbidden. You do not have access to edit this profile.' };
  }

  if (viewReadOnly || (callerRole === 'EMPLOYEE' && callerId !== targetId)) {
    const { bankAccountNumber, bankName, ifscCode, passwordHash, ...safeInfo } = emp;
    return safeInfo;
  }

  return emp;
};

export const mockUpdateEmployeeProfile = (employeeId: string, updateData: Partial<Employee>) => {
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const index = employees.findIndex((e) => e.id === employeeId);

  if (index === -1) throw { errorCode: 'ERR-VAL-01', message: 'Employee not found.' };

  const current = employees[index];

  // Whitelist editable fields for employees
  const updated = {
    ...current,
    personalEmail: updateData.personalEmail,
    mobile: updateData.mobile || current.mobile,
    residingAddress: updateData.residingAddress || current.residingAddress,
    maritalStatus: updateData.maritalStatus || current.maritalStatus,
    bankAccountNumber: updateData.bankAccountNumber || current.bankAccountNumber,
    bankName: updateData.bankName || current.bankName,
    ifscCode: updateData.ifscCode || current.ifscCode,
    panNo: updateData.panNo || current.panNo,
    uanNo: updateData.uanNo || current.uanNo,
    skills: updateData.skills || current.skills,
    certifications: updateData.certifications || current.certifications,
    resumeUrl: updateData.resumeUrl || current.resumeUrl,
    updatedAt: new Date().toISOString()
  };

  employees[index] = updated;
  saveStoredData(KEYS.EMPLOYEES, employees);
  return updated;
};

// --- SALARY & PAYROLL API (Admin Only) ---

export const mockGetSalaryConfig = (callerRole: UserRole, employeeId: string) => {
  if (callerRole !== 'ADMIN') {
    throw { errorCode: 'ERR-SEC-01', message: 'Forbidden. Only administrators can view salary info.' };
  }

  const salaries = getStoredData<SalaryConfig>(KEYS.SALARIES);
  const config = salaries.find((s) => s.employeeId === employeeId);

  return config || null;
};

export const mockUpdateSalaryConfig = (callerRole: UserRole, employeeId: string, wageAmount: number) => {
  if (callerRole !== 'ADMIN') {
    throw { errorCode: 'ERR-SEC-01', message: 'Forbidden. Only administrators can update salary info.' };
  }

  const salaries = getStoredData<SalaryConfig>(KEYS.SALARIES);
  const index = salaries.findIndex((s) => s.employeeId === employeeId);

  // Auto-calculate components
  const basic = Math.round(wageAmount * 0.50); // Basic = 50% of wage
  const hra = Math.round(basic * 0.50); // HRA = 50% of Basic
  const standardAllowance = 416700; // Fixed ₹4167/month in paise
  const performanceBonus = Math.round(basic * 0.0833); // 8.33% of Basic
  const lta = Math.round(basic * 0.0833); // 8.33% of Basic

  const otherComponentsSum = basic + hra + standardAllowance + performanceBonus + lta;
  const fixedAllowance = wageAmount - otherComponentsSum;

  if (fixedAllowance < 0) {
    throw {
      errorCode: 'ERR-CALC-01',
      message: `The sum of defined salary components (₹${(otherComponentsSum/100).toLocaleString()}) exceeds the specified Wage (₹${(wageAmount/100).toLocaleString()}). Fixed allowance cannot go negative. Please increase the base wage.`,
    };
  }

  const components: SalaryComponent[] = [
    { name: 'BASIC', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 50, computedAmount: basic },
    { name: 'HRA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 50, referenceComponent: 'BASIC', computedAmount: hra },
    { name: 'STANDARD_ALLOWANCE', computationType: 'FIXED_AMOUNT', computationValue: 416700, computedAmount: standardAllowance },
    { name: 'PERFORMANCE_BONUS', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 8.33, referenceComponent: 'BASIC', computedAmount: performanceBonus },
    { name: 'LTA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 8.33, referenceComponent: 'BASIC', computedAmount: lta },
    { name: 'FIXED_ALLOWANCE', computationType: 'FIXED_AMOUNT', computationValue: fixedAllowance, computedAmount: fixedAllowance }
  ];

  const updatedConfig: SalaryConfig = {
    employeeId,
    wageType: 'FIXED',
    wagePeriod: 'MONTHLY',
    wageAmount,
    components,
    pfEmployeeRate: 0.12,
    pfEmployerRate: 0.12,
    professionalTax: 20000,
  };

  if (index === -1) {
    salaries.push(updatedConfig);
  } else {
    salaries[index] = updatedConfig;
  }

  saveStoredData(KEYS.SALARIES, salaries);
  return updatedConfig;
};

// --- ATTENDANCE API ---

export const mockCheckIn = async (employeeId: string) => {
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const today = new Date().toISOString().split('T')[0];

  // Check if already checked in today with no checkout
  const activeRecord = attendanceLogs.find(
    (a) => a.employeeId === employeeId && a.date === today && !a.checkOutAt
  );

  if (activeRecord) {
    throw { errorCode: 'ERR-STATE-01', message: 'You are already checked in. Please check out first.' };
  }

  const newLog: Attendance = {
    id: `att-uuid-${Math.random().toString(36).substr(2, 9)}`,
    employeeId,
    date: today,
    checkInAt: new Date().toISOString(),
    breakTime: DEFAULT_CONFIGS.DEFAULT_BREAK_TIME_MINS,
    status: 'PRESENT'
  };

  attendanceLogs.push(newLog);
  saveStoredData(KEYS.ATTENDANCE, attendanceLogs);
  return newLog;
};

export const mockCheckOut = async (employeeId: string) => {
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const today = new Date().toISOString().split('T')[0];

  // Find open check-in
  const activeIndex = attendanceLogs.findIndex(
    (a) => a.employeeId === employeeId && a.date === today && !a.checkOutAt
  );

  if (activeIndex === -1) {
    throw { errorCode: 'ERR-STATE-02', message: 'No active check-in found for today.' };
  }

  const record = attendanceLogs[activeIndex];
  const checkOutAt = new Date().toISOString();
  
  // Calculate hours
  const checkInTime = new Date(record.checkInAt!).getTime();
  const checkOutTime = new Date(checkOutAt).getTime();
  const breakMins = record.breakTime || DEFAULT_CONFIGS.DEFAULT_BREAK_TIME_MINS;
  
  // Total work hours = checkout - checkin - break
  const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
  const actualWorkHours = Math.max(0, diffHours - (breakMins / 60));
  
  const standardHours = DEFAULT_CONFIGS.STANDARD_WORK_HOURS;
  const extraHours = Math.max(0, actualWorkHours - standardHours);

  record.checkOutAt = checkOutAt;
  record.workHours = parseFloat(actualWorkHours.toFixed(2));
  record.extraHours = parseFloat(extraHours.toFixed(2));
  record.status = 'PRESENT';

  attendanceLogs[activeIndex] = record;
  saveStoredData(KEYS.ATTENDANCE, attendanceLogs);

  return record;
};

export const mockGetAttendanceHistory = (employeeId: string, month: number, year: number) => {
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  
  return attendanceLogs.filter((log) => {
    const logDate = new Date(log.date);
    return (
      log.employeeId === employeeId &&
      logDate.getMonth() === month &&
      logDate.getFullYear() === year
    );
  });
};

export const mockGetDailyAttendanceSummary = (callerRole: UserRole, dateString: string) => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-01', message: 'Forbidden. Attendance dashboards are admin-only.' };
  }

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const leaveRequests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);

  const dailyLogs = attendanceLogs.filter((log) => log.date === dateString);
  const approvedLeaves = leaveRequests.filter(
    (req) => req.status === 'APPROVED' && dateString >= req.startDate && dateString <= req.endDate
  );

  return employees.map((emp) => {
    const log = dailyLogs.find((l) => l.employeeId === emp.id);
    const leave = approvedLeaves.find((l) => l.employeeId === emp.id);
    
    let status: 'PRESENT' | 'ABSENT' | 'ON_LEAVE' = 'ABSENT';
    if (leave) {
      status = 'ON_LEAVE';
    } else if (log) {
      status = 'PRESENT';
    }

    return {
      employeeId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      jobPosition: emp.jobPosition,
      loginId: emp.loginId,
      checkIn: log?.checkInAt,
      checkOut: log?.checkOutAt,
      workHours: log?.workHours || 0,
      status
    };
  });
};

// --- TIME OFF API ---

export const mockGetTimeOffBalances = (employeeId: string) => {
  const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
  return balances.filter((b) => b.employeeId === employeeId);
};

export const mockSubmitTimeOffRequest = async (employeeId: string, requestData: Omit<TimeOffRequest, 'id' | 'employeeId' | 'status' | 'createdAt'>) => {
  // Validate request dates
  if (requestData.startDate > requestData.endDate) {
    throw { errorCode: 'ERR-VAL-01', message: 'Start date cannot be after end date.', field: 'startDate' };
  }

  const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
  const requests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);

  // Balance checking for PAID and SICK types
  if (requestData.type !== 'UNPAID_LEAVE') {
    const bal = balances.find((b) => b.employeeId === employeeId && b.type === requestData.type);
    const remaining = bal ? bal.remainingDays : 0;
    
    // Check pending requests consuming balance
    const pendingSum = requests
      .filter((r) => r.employeeId === employeeId && r.type === requestData.type && r.status === 'PENDING')
      .reduce((sum, r) => sum + r.allocationDays, 0);

    if (requestData.allocationDays > (remaining - pendingSum)) {
      throw {
        errorCode: 'ERR-VAL-03',
        message: `Insufficient leave balance. Remaining: ${remaining} days. Requested: ${requestData.allocationDays} days (with ${pendingSum} days pending review).`,
      };
    }
  }

  // Sick Leave Attachment threshold check (> 2 consecutive days, i.e., 3 or more days)
  if (
    requestData.type === 'SICK_LEAVE' &&
    requestData.allocationDays > DEFAULT_CONFIGS.SICK_LEAVE_ATTACHMENT_THRESHOLD_DAYS &&
    !requestData.attachmentUrl
  ) {
    throw {
      errorCode: 'ERR-VAL-04',
      message: `A medical certificate attachment is required for sick leave requests exceeding ${DEFAULT_CONFIGS.SICK_LEAVE_ATTACHMENT_THRESHOLD_DAYS} consecutive days.`,
      field: 'attachmentUrl'
    };
  }

  const id = `req-uuid-${Math.random().toString(36).substr(2, 9)}`;
  const newRequest: TimeOffRequest = {
    ...requestData,
    id,
    employeeId,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  requests.push(newRequest);
  saveStoredData(KEYS.LEAVE_REQUESTS, requests);

  return newRequest;
};

export const mockGetLeaveRequests = (callerId: string, callerRole: UserRole) => {
  const requests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);

  const decorated = requests.map((req) => {
    const emp = employees.find((e) => e.id === req.employeeId);
    return {
      ...req,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee',
      department: emp?.department || '',
      loginId: emp?.loginId || ''
    };
  });

  if (callerRole === 'EMPLOYEE') {
    return decorated.filter((r) => r.employeeId === callerId);
  }

  return decorated; // HR and Admin see all
};

export const mockReviewLeaveRequest = async (reviewerId: string, callerRole: UserRole, requestId: string, status: 'APPROVED' | 'REJECTED', reviewerNote?: string) => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-01', message: 'Forbidden. Only HR Officers or Administrators can review leave requests.' };
  }

  const requests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);
  const reqIndex = requests.findIndex((r) => r.id === requestId);

  if (reqIndex === -1) {
    throw { errorCode: 'ERR-VAL-01', message: 'Leave request not found.' };
  }

  const req = requests[reqIndex];

  if (req.status !== 'PENDING') {
    throw { errorCode: 'ERR-STATE-03', message: `This leave request has already been reviewed and is marked as ${req.status}.` };
  }

  // If approved, decrement balance
  if (status === 'APPROVED' && req.type !== 'UNPAID_LEAVE') {
    const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
    const balIndex = balances.findIndex((b) => b.employeeId === req.employeeId && b.type === req.type);

    if (balIndex !== -1) {
      const bal = balances[balIndex];
      bal.usedDays = parseFloat((bal.usedDays + req.allocationDays).toFixed(2));
      bal.remainingDays = parseFloat((bal.allocatedDays - bal.usedDays).toFixed(2));
      balances[balIndex] = bal;
      saveStoredData(KEYS.LEAVE_BALANCES, balances);
    }
  }

  req.status = status;
  req.reviewerId = reviewerId;
  req.reviewerNote = reviewerNote;
  req.reviewedAt = new Date().toISOString();

  requests[reqIndex] = req;
  saveStoredData(KEYS.LEAVE_REQUESTS, requests);

  // If approved, create Attendance logs as "ON_LEAVE" for the range
  if (status === 'APPROVED') {
    const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      
      // Upsert leave record in attendance
      const index = attendanceLogs.findIndex((a) => a.employeeId === req.employeeId && a.date === dateStr);
      const leaveRecord: Attendance = {
        id: index !== -1 ? attendanceLogs[index].id : `att-uuid-${Math.random().toString(36).substr(2, 9)}`,
        employeeId: req.employeeId,
        date: dateStr,
        status: 'ON_LEAVE'
      };

      if (index !== -1) {
        attendanceLogs[index] = leaveRecord;
      } else {
        attendanceLogs.push(leaveRecord);
      }
    }
    saveStoredData(KEYS.ATTENDANCE, attendanceLogs);
  }

  return req;
};

// --- PAYROLL math feeds ---

export const mockGetPayableDaysSummary = (employeeId: string, month: number, year: number) => {
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const leaveRequests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);

  // Get total days in this month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Count weekends (let's assume Saturdays and Sundays are non-working, e.g. 5-day week)
  let workingDays = 0;
  const unpaidLeaveDays = leaveRequests
    .filter((r) => r.employeeId === employeeId && r.status === 'APPROVED' && r.type === 'UNPAID_LEAVE')
    .reduce((sum, r) => {
      // Calculate days in this month for this leave
      const start = new Date(r.startDate);
      const end = new Date(r.endDate);
      let count = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getMonth() === month && d.getFullYear() === year) {
          count += 1;
        }
      }
      return sum + count;
    }, 0);

  // Find recorded attendances
  const logs = attendanceLogs.filter((l) => {
    const logDate = new Date(l.date);
    return l.employeeId === employeeId && logDate.getMonth() === month && logDate.getFullYear() === year;
  });

  const presentDays = logs.filter((l) => l.status === 'PRESENT').length;
  const paidLeaveDays = logs.filter((l) => l.status === 'ON_LEAVE').length; // Already marked as ON_LEAVE from approved requests

  // Standard working days in month (excluding weekends)
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const date = new Date(year, month, day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sat/Sun
      workingDays++;
    }
  }

  // Missing days = working days in month - (present days + approved paid leaves)
  const missingDays = Math.max(0, workingDays - (presentDays + paidLeaveDays));
  
  // Payable days calculation
  const payableDays = Math.max(0, workingDays - unpaidLeaveDays - missingDays);

  return {
    totalWorkingDays: workingDays,
    presentDays,
    paidLeaveDays,
    unpaidLeaveDays,
    missingDays,
    payableDays
  };
};

export interface ProjectTask {
  id: string;
  title: string;
  project: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  ccPoints: number;
}

const SEED_TASKS: ProjectTask[] = [
  { id: 'task-1', title: 'Website Design', project: 'Pixel Ring Website', priority: 'HIGH', status: 'IN_PROGRESS', ccPoints: 4 },
  { id: 'task-2', title: 'Database Migration', project: 'Backend Services', priority: 'MEDIUM', status: 'COMPLETED', ccPoints: 5 },
  { id: 'task-3', title: 'API Documentation', project: 'Developer Portal', priority: 'LOW', status: 'PENDING', ccPoints: 2 },
];

export const mockGetTasks = (): ProjectTask[] => {
  if (!localStorage.getItem('hrms_tasks')) {
    localStorage.setItem('hrms_tasks', JSON.stringify(SEED_TASKS));
  }
  return JSON.parse(localStorage.getItem('hrms_tasks') || '[]');
};

export const mockUpdateTaskStatus = (taskId: string, status: ProjectTask['status']): ProjectTask[] => {
  const tasks = mockGetTasks();
  const index = tasks.findIndex(t => t.id === taskId);
  if (index !== -1) {
    tasks[index].status = status;
    localStorage.setItem('hrms_tasks', JSON.stringify(tasks));
  }
  return tasks;
};

export const mockCreateTask = (task: Omit<ProjectTask, 'id'>): ProjectTask[] => {
  const tasks = mockGetTasks();
  const newTask = {
    ...task,
    id: `task-uuid-${Math.random().toString(36).substr(2, 9)}`
  };
  tasks.push(newTask);
  localStorage.setItem('hrms_tasks', JSON.stringify(tasks));
  return tasks;
};
