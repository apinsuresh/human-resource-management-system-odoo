// ==========================================
// HRMS Mock API & State Layer (localStorage)
// ==========================================

export type UserRole = 'ADMIN' | 'HR_OFFICER' | 'EMPLOYEE' | 'EMPLOYER';

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
  employmentType?: string;
  updatedAt: string;
  mustResetPassword?: boolean;
  passwordHash: string; // Mock password check
  status?: 'PENDING_ACTIVATION' | 'ACTIVE' | 'PASSWORD_CHANGE_REQUIRED' | 'SUSPENDED' | 'LOCKED' | 'DEACTIVATED';
  failedAttempts?: number;
}

export type WageType = 'FIXED';
export type WagePeriod = 'MONTHLY' | 'YEARLY';

export interface SalaryComponent {
  name: string;
  computationType: 'FIXED_AMOUNT' | 'PERCENTAGE_OF_WAGE' | 'PERCENTAGE_OF_COMPONENT' | 'PERCENTAGE_OF_GROSS';
  computationValue: number; // percentage (e.g. 50) or paise
  referenceComponent?: string;
  computedAmount: number; // paise
  description?: string;
  status?: 'Active' | 'Inactive';
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
  workingDays?: number; // default 5
  breakTimeMins?: number; // default 60
  pfCalculationBase?: 'BASIC_SALARY' | 'GROSS_SALARY';
  customDeductions?: any[];
}

export interface SalaryHistoryRecord {
  id: string;
  employeeId: string;
  effectiveDate: string;
  monthlySalary: number; // paise
  basic: number; // paise
  gross: number; // paise
  net: number; // paise
  updatedBy: string;
  createdAt: string;
}

export interface SalaryAuditLog {
  id: string;
  admin: string;
  employee: string;
  prevSalary: number; // paise
  newSalary: number; // paise
  changedComponents: string;
  timestamp: string;
  ip: string;
  device: string;
  action: string;
}

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'ON_LEAVE' | 'HALF_DAY' | 'MISSING' | 'WEEKEND' | 'HOLIDAY';

export interface Attendance {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInAt?: string; // ISO String
  checkOutAt?: string; // ISO String
  workHours?: number; // hours
  extraHours?: number; // hours
  breakTime?: number; // minutes
  status: AttendanceStatus;
  correctedBy?: string; // userId who last corrected this record
  correctionReason?: string;
}

export interface AttendanceCorrectionAudit {
  id: string;
  attendanceId: string;
  employeeId: string;
  changedBy: string; // userId
  changedByName: string;
  field: 'checkInAt' | 'checkOutAt' | 'status';
  oldValue: string;
  newValue: string;
  reason: string;
  timestamp: string;
}

export type TimeOffType = 'PAID_TIME_OFF' | 'SICK_LEAVE' | 'UNPAID_LEAVE' | 'MATERNITY_LEAVE' | 'PATERNITY_LEAVE' | string;
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveTypeConfig {
  id: string;
  code: string;
  name: string;
  description?: string;
  isPaid: boolean;
  annualAllocation: number;
  carryForward: boolean;
  maxCarryForward: number;
  expiryDate?: string;
  halfDayAllowed: boolean;
  docRequiredThresholdDays: number;
  requireApproval: boolean;
  isActive: boolean;
}

export interface TimeOffRequest {
  id: string;
  employeeId: string;
  employeeName?: string;
  loginId?: string;
  department?: string;
  jobPosition?: string;
  companyId?: string;
  type: TimeOffType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  allocationDays: number;
  isHalfDay?: boolean;
  halfDayPeriod?: 'FIRST_HALF' | 'SECOND_HALF';
  attachmentUrl?: string;
  reason?: string;
  status: LeaveRequestStatus;
  reviewerId?: string;
  reviewerName?: string;
  reviewerNote?: string;
  createdAt: string;
  reviewedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
}

export interface TimeOffBalance {
  id?: string;
  employeeId: string;
  type: TimeOffType;
  allocatedDays: number;
  usedDays: number;
  pendingDays?: number;
  remainingDays: number;
  carryForwardDays?: number;
}

export interface LeaveAuditLog {
  id: string;
  action: 'CREATE' | 'APPROVE' | 'REJECT' | 'CANCEL' | 'ALLOCATION_UPDATE' | 'LEAVE_TYPE_UPDATE';
  actorId: string;
  actorName: string;
  employeeId: string;
  employeeName: string;
  details: string;
  timestamp: string;
}

// LocalStorage Keys
const KEYS = {
  EMPLOYEES: 'hrms_employees',
  SALARIES: 'hrms_salaries',
  ATTENDANCE: 'hrms_attendance',
  ATTENDANCE_AUDIT: 'hrms_attendance_audit',
  LEAVE_REQUESTS: 'hrms_leave_requests',
  LEAVE_BALANCES: 'hrms_leave_balances',
  LEAVE_TYPES: 'hrms_leave_types',
  LEAVE_AUDIT: 'hrms_leave_audit',
  NOTIFICATIONS: 'hrms_notifications',
  CURRENT_USER: 'hrms_current_user',
  SALARY_HISTORY: 'hrms_salary_history',
  SALARY_AUDIT_LOGS: 'hrms_salary_audit_logs',
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
    mustResetPassword: false,
    passwordHash: 'EmpPassword123'
  },
  {
    id: 'emp-employer-uuid',
    loginId: 'OIEMPL20260004',
    firstName: 'Executive',
    lastName: 'Director',
    email: 'employer@company.com',
    mobile: '9876543213',
    department: 'Leadership',
    jobPosition: 'Managing Director',
    companyId: 'OI-UUID',
    location: 'Bangalore',
    dateOfBirth: '1975-01-01',
    dateOfJoining: '2026-01-01',
    residingAddress: '100 Executive Boulevard, Bangalore, India',
    gender: 'MALE',
    nationality: 'Indian',
    maritalStatus: 'MARRIED',
    empCode: 'DIR-001',
    bankAccountNumber: '99998888777',
    bankName: 'Axis Bank',
    ifscCode: 'UTIB0000123',
    skills: ['Strategy', 'Leadership', 'Finance'],
    certifications: ['MBA'],
    role: 'EMPLOYER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    mustResetPassword: false,
    passwordHash: 'EmployerPassword123'
  }
];

const SEED_LEAVE_TYPES: LeaveTypeConfig[] = [
  {
    id: 'lt-pto',
    code: 'PAID_TIME_OFF',
    name: 'Paid Time Off',
    description: 'General annual vacation and personal leave',
    isPaid: true,
    annualAllocation: 24,
    carryForward: true,
    maxCarryForward: 5,
    expiryDate: '2026-12-31',
    halfDayAllowed: true,
    docRequiredThresholdDays: 0,
    requireApproval: true,
    isActive: true,
  },
  {
    id: 'lt-sick',
    code: 'SICK_LEAVE',
    name: 'Sick Leave',
    description: 'Medical and healthcare leave',
    isPaid: true,
    annualAllocation: 7,
    carryForward: false,
    maxCarryForward: 0,
    expiryDate: '2026-12-31',
    halfDayAllowed: true,
    docRequiredThresholdDays: 2,
    requireApproval: true,
    isActive: true,
  },
  {
    id: 'lt-unpaid',
    code: 'UNPAID_LEAVE',
    name: 'Unpaid Leave',
    description: 'Leave without pay when balances are exhausted',
    isPaid: false,
    annualAllocation: 30,
    carryForward: false,
    maxCarryForward: 0,
    expiryDate: '2026-12-31',
    halfDayAllowed: true,
    docRequiredThresholdDays: 0,
    requireApproval: true,
    isActive: true,
  },
  {
    id: 'lt-maternity',
    code: 'MATERNITY_LEAVE',
    name: 'Maternity Leave',
    description: 'Maternity leave for eligible female employees',
    isPaid: true,
    annualAllocation: 180,
    carryForward: false,
    maxCarryForward: 0,
    expiryDate: '2026-12-31',
    halfDayAllowed: false,
    docRequiredThresholdDays: 1,
    requireApproval: true,
    isActive: true,
  },
  {
    id: 'lt-paternity',
    code: 'PATERNITY_LEAVE',
    name: 'Paternity Leave',
    description: 'Paternity leave for eligible employees',
    isPaid: true,
    annualAllocation: 15,
    carryForward: false,
    maxCarryForward: 0,
    expiryDate: '2026-12-31',
    halfDayAllowed: false,
    docRequiredThresholdDays: 1,
    requireApproval: true,
    isActive: true,
  },
];

const SEED_BALANCES: TimeOffBalance[] = [
  { id: 'bal-1', employeeId: 'emp-admin-uuid', type: 'PAID_TIME_OFF', allocatedDays: 24, usedDays: 0, remainingDays: 24 },
  { id: 'bal-2', employeeId: 'emp-admin-uuid', type: 'SICK_LEAVE', allocatedDays: 7, usedDays: 0, remainingDays: 7 },
  
  { id: 'bal-3', employeeId: 'emp-hr-uuid', type: 'PAID_TIME_OFF', allocatedDays: 24, usedDays: 0, remainingDays: 24 },
  { id: 'bal-4', employeeId: 'emp-hr-uuid', type: 'SICK_LEAVE', allocatedDays: 7, usedDays: 0, remainingDays: 7 },
  
  { id: 'bal-5', employeeId: 'emp-employee-uuid', type: 'PAID_TIME_OFF', allocatedDays: 24, usedDays: 2, remainingDays: 22 },
  { id: 'bal-6', employeeId: 'emp-employee-uuid', type: 'SICK_LEAVE', allocatedDays: 7, usedDays: 0, remainingDays: 7 },
  { id: 'bal-7', employeeId: 'emp-employer-uuid', type: 'PAID_TIME_OFF', allocatedDays: 24, usedDays: 0, remainingDays: 24 },
  { id: 'bal-8', employeeId: 'emp-employer-uuid', type: 'SICK_LEAVE', allocatedDays: 7, usedDays: 0, remainingDays: 7 },
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
  },
  {
    employeeId: 'emp-employer-uuid',
    wageType: 'FIXED',
    wagePeriod: 'MONTHLY',
    wageAmount: 15000000, // ₹1,50,000 in paise
    pfEmployeeRate: 0.12,
    pfEmployerRate: 0.12,
    professionalTax: 20000, // ₹200 in paise
    components: [
      { name: 'BASIC', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 50, computedAmount: 7500000 },
      { name: 'HRA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 50, referenceComponent: 'BASIC', computedAmount: 3750000 },
      { name: 'STANDARD_ALLOWANCE', computationType: 'FIXED_AMOUNT', computationValue: 1000000, computedAmount: 1000000 },
      { name: 'PERFORMANCE_BONUS', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 10, referenceComponent: 'BASIC', computedAmount: 750000 },
      { name: 'LTA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 10, referenceComponent: 'BASIC', computedAmount: 750000 },
      { name: 'FIXED_ALLOWANCE', computationType: 'FIXED_AMOUNT', computationValue: 1250000, computedAmount: 1250000 }
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

// Helper to hash passwords securely in memory
export const hashPassword = (password: string): string => {
  let hash = 5381;
  for (let i = 0; i < password.length; i++) {
    hash = (hash * 33) ^ password.charCodeAt(i);
  }
  return `sha256_${(hash >>> 0).toString(16)}`;
};

// Helper to initialize local storage
export const initializeMockDB = () => {
  if (!localStorage.getItem(KEYS.EMPLOYEES)) {
    const hashed = SEED_EMPLOYEES.map(emp => ({
      ...emp,
      status: 'ACTIVE',
      failedAttempts: 0,
      passwordHash: hashPassword(emp.passwordHash)
    }));
    localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(hashed));
  } else {
    // Migration: clear any lingering mustResetPassword / PASSWORD_CHANGE_REQUIRED from old seeds
    const stored = JSON.parse(localStorage.getItem(KEYS.EMPLOYEES) || '[]');
    let changed = false;
    const patched = stored.map((emp: any) => {
      if (emp.mustResetPassword || emp.status === 'PASSWORD_CHANGE_REQUIRED') {
        changed = true;
        return { ...emp, mustResetPassword: false, status: 'ACTIVE' };
      }
      return emp;
    });
    if (changed) localStorage.setItem(KEYS.EMPLOYEES, JSON.stringify(patched));
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
  if (!localStorage.getItem(KEYS.LEAVE_TYPES)) {
    localStorage.setItem(KEYS.LEAVE_TYPES, JSON.stringify(SEED_LEAVE_TYPES));
  }
  if (!localStorage.getItem(KEYS.LEAVE_AUDIT)) {
    localStorage.setItem(KEYS.LEAVE_AUDIT, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.NOTIFICATIONS)) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ATTENDANCE_AUDIT)) {
    localStorage.setItem(KEYS.ATTENDANCE_AUDIT, JSON.stringify([]));
  }

  // Seeding Employer Details Company Settings
  if (!localStorage.getItem('hrms_company_settings')) {
    localStorage.setItem('hrms_company_settings', JSON.stringify({
      companyName: 'Odoo Technologies',
      companyCode: 'OI',
      industry: 'Technology',
      companyEmail: 'info@odoo.com',
      phoneNumber: '+91 98765 43210',
      website: 'https://www.odoo.com',
      regNumber: 'U72900TZ2024PTC032101',
      address: '123, Business Park, Coimbatore, Tamil Nadu, India - 641001',
      estDate: '2024-01-15',
      companySize: '101-200',
      companyType: 'Private Limited',
      country: 'India',
      state: 'Tamil Nadu',
      city: 'Coimbatore'
    }));
  }

  // Seeding Departments
  if (!localStorage.getItem('hrms_departments')) {
    localStorage.setItem('hrms_departments', JSON.stringify([
      { id: 'dept-eng', name: 'Engineering', headId: 'emp-employee-uuid', isActive: true },
      { id: 'dept-hr', name: 'Human Resources', headId: 'emp-hr-uuid', isActive: true },
      { id: 'dept-ops', name: 'Operations', headId: 'emp-admin-uuid', isActive: true }
    ]));
  }

  // Seeding Designations
  if (!localStorage.getItem('hrms_designations')) {
    localStorage.setItem('hrms_designations', JSON.stringify([
      { id: 'des-se', name: 'Software Engineer', isActive: true },
      { id: 'des-pm', name: 'Product Manager', isActive: true },
      { id: 'des-hro', name: 'HR Officer', isActive: true }
    ]));
  }

  // Seeding Branches
  if (!localStorage.getItem('hrms_branches')) {
    localStorage.setItem('hrms_branches', JSON.stringify([
      { id: 'loc-blr', name: 'Bangalore Office', isActive: true },
      { id: 'loc-cbe', name: 'Coimbatore Office', isActive: true }
    ]));
  }

  // Seeding Cost Centers
  if (!localStorage.getItem('hrms_cost_centers')) {
    localStorage.setItem('hrms_cost_centers', JSON.stringify([
      { id: 'cc-rd', name: 'R&D Division', isActive: true },
      { id: 'cc-hq', name: 'Corporate Headquarter', isActive: true }
    ]));
  }

  // Seeding Workforce policies
  if (!localStorage.getItem('hrms_workforce_policies')) {
    localStorage.setItem('hrms_workforce_policies', JSON.stringify({
      idFormat: 'EMP-{YYYY}-{SERIAL}',
      loginIdGeneration: 'FIRSTNAME_LASTNAME',
      serialNumber: 1001,
      employmentTypes: ['Full-time', 'Part-time', 'Contract', 'Intern'],
      probationPeriodDays: 90,
      defaultLocation: 'loc-blr',
      workingHours: 8,
      policiesText: 'Standard company terms and code of conduct apply.'
    }));
  }

  // Seeding Attendance Settings
  if (!localStorage.getItem('hrms_attendance_settings')) {
    localStorage.setItem('hrms_attendance_settings', JSON.stringify({
      workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      checkInTime: '09:00 AM',
      checkOutTime: '06:00 PM',
      breakDurationMins: 60,
      gracePeriodMins: 15,
      lateArrivalPenalty: 'WARN_AND_DEDUCT',
      earlyCheckoutPenalty: 'WARN',
      overtimeEnabled: true,
      halfDayThresholdHours: 4,
      missingAttendanceRule: 'MARK_ABSENT',
      requireApproval: true
    }));
  }

  // Seeding Leave Policies
  if (!localStorage.getItem('hrms_leave_policies')) {
    localStorage.setItem('hrms_leave_policies', JSON.stringify({
      allocations: [
        { type: 'PAID_TIME_OFF', days: 24, carryForward: true, maxCarryForward: 5, expiryDate: '2026-12-31' },
        { type: 'SICK_LEAVE', days: 7, carryForward: false, maxCarryForward: 0, expiryDate: '2026-12-31' },
        { type: 'UNPAID_TIME_OFF', days: 30, carryForward: false, maxCarryForward: 0, expiryDate: '2026-12-31' }
      ],
      halfDayAllowed: true,
      maxConsecutiveDays: 10,
      approvalHierarchy: 'MANAGER_THEN_HR',
      docRequiredThresholdDays: 2,
      customLeaves: []
    }));
  }

  // Seeding Payroll Settings
  if (!localStorage.getItem('hrms_payroll_settings')) {
    localStorage.setItem('hrms_payroll_settings', JSON.stringify({
      frequency: 'MONTHLY',
      cycleStartDay: 1,
      cycleEndDay: 30,
      pfEmployeeRate: 0.12,
      pfEmployerRate: 0.12,
      professionalTax: 20000,
      enabledComponents: ['BASIC', 'HRA', 'STANDARD_ALLOWANCE', 'PERFORMANCE_BONUS', 'LTA', 'FIXED_ALLOWANCE', 'PROVIDENT_FUND', 'PROFESSIONAL_TAX'],
      approvalRequired: true
    }));
  }

  // Seeding Notifications preferences
  if (!localStorage.getItem('hrms_notifications_settings')) {
    localStorage.setItem('hrms_notifications_settings', JSON.stringify({
      leave_request: ['in-app', 'email'],
      leave_approval: ['in-app', 'email'],
      attendance_exception: ['in-app', 'push'],
      new_employee: ['in-app'],
      payroll_completion: ['email', 'push'],
      performance_review: ['in-app'],
      upcoming_deadline: ['in-app', 'email'],
      security_alert: ['in-app', 'email', 'push']
    }));
  }

  // Seeding Security Settings
  if (!localStorage.getItem('hrms_security_settings')) {
    localStorage.setItem('hrms_security_settings', JSON.stringify({
      mfaPreference: 'OPTIONAL',
      loginNotifications: true,
      sessionTimeoutMins: 30,
      activeSessions: [
        { id: 'sess-1', device: 'macOS Chrome', ip: '192.168.1.5', lastActive: 'Just now', isCurrent: true }
      ]
    }));
  }

  // Seeding Integrations
  if (!localStorage.getItem('hrms_integrations')) {
    localStorage.setItem('hrms_integrations', JSON.stringify([
      { id: 'int-1', name: 'QuickBooks Payroll', type: 'Payroll', status: 'CONNECTED', lastSync: '10 minutes ago', apiKey: '••••••••••••••••' },
      { id: 'int-2', name: 'Xero Accounting', type: 'Accounting', status: 'CONNECTED', lastSync: '1 hour ago', apiKey: '••••••••••••••••' },
      { id: 'int-3', name: 'Google Calendar', type: 'Calendar', status: 'DISCONNECTED', lastSync: 'Never', apiKey: '' }
    ]));
  }

  // Seeding Salary History
  if (!localStorage.getItem(KEYS.SALARY_HISTORY)) {
    localStorage.setItem(KEYS.SALARY_HISTORY, JSON.stringify([
      {
        id: 'hist-1',
        employeeId: 'emp-employee-uuid',
        effectiveDate: '01/08/2026',
        monthlySalary: 5000000,
        basic: 2500000,
        gross: 5000000,
        net: 4680000,
        updatedBy: 'System Admin',
        createdAt: new Date().toISOString()
      }
    ]));
  }

  // Seeding Salary Audit Logs
  if (!localStorage.getItem(KEYS.SALARY_AUDIT_LOGS)) {
    localStorage.setItem(KEYS.SALARY_AUDIT_LOGS, JSON.stringify([
      {
        id: 'aud-1',
        admin: 'admin@odoo.com',
        employee: 'Anita Rao',
        prevSalary: 4500000,
        newSalary: 5000000,
        changedComponents: 'Basic Salary, HRA, Standard Allowance',
        timestamp: '2026-08-22 10:30 AM',
        ip: '192.168.1.15',
        device: 'macOS (Chrome)',
        action: 'Admin updated monthly salary from ₹45,000 to ₹50,000.'
      }
    ]));
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

// --- AUDIT LOGGING SERVICE ---
export const mockWriteAuditLog = (
  admin: string,
  action: string,
  module: string,
  status: string,
  prevValue?: string,
  newValue?: string
) => {
  const stored = localStorage.getItem('sa_audit_logs');
  const logs = stored ? JSON.parse(stored) : [];
  const newLog = {
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toLocaleString(),
    admin,
    action,
    module,
    organization: 'Odoo Platform',
    ip: '192.168.1.15',
    device: 'macOS',
    browser: 'Chrome',
    status,
    prevValue,
    newValue
  };
  logs.unshift(newLog);
  localStorage.setItem('sa_audit_logs', JSON.stringify(logs));
};

// --- AUTHENTICATION API ---

export const mockAuthLogin = async (identifier: string, rawPassword: string) => {
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  
  // Find employee by email or loginId
  const employeeIndex = employees.findIndex(
    (emp) => (emp.email === identifier || emp.loginId === identifier)
  );

  if (employeeIndex === -1) {
    mockWriteAuditLog(identifier, `Login failed: Invalid identifier`, 'Auth', 'Failure');
    throw { errorCode: 'ERR-AUTH-01', message: 'Invalid Login ID/Email or password.' };
  }

  const employee = employees[employeeIndex];

  // Check locks and suspensions
  if (employee.status === 'LOCKED') {
    mockWriteAuditLog(employee.email, `Blocked login attempt: Account locked`, 'Auth', 'Failure');
    throw { errorCode: 'ERR-AUTH-02', message: 'This account has been locked due to multiple failed login attempts. Please contact your system administrator.' };
  }

  if (employee.status === 'SUSPENDED') {
    mockWriteAuditLog(employee.email, `Blocked login attempt: Account suspended`, 'Auth', 'Failure');
    throw { errorCode: 'ERR-AUTH-03', message: 'This account has been suspended. Please contact HR.' };
  }

  if (employee.status === 'DEACTIVATED') {
    mockWriteAuditLog(employee.email, `Blocked login attempt: Account deactivated`, 'Auth', 'Failure');
    throw { errorCode: 'ERR-AUTH-04', message: 'This account is deactivated.' };
  }

  const computedHash = hashPassword(rawPassword);

  if (employee.passwordHash !== computedHash) {
    // Increment failed attempts
    const attempts = (employee.failedAttempts || 0) + 1;
    employee.failedAttempts = attempts;

    if (attempts >= 5) {
      employee.status = 'LOCKED';
      mockWriteAuditLog(employee.email, 'Account locked due to 5 failed login attempts', 'Auth', 'Locked');
    } else {
      mockWriteAuditLog(employee.email, `Failed login attempt (Attempt ${attempts}/5)`, 'Auth', 'Failure');
    }

    employees[employeeIndex] = employee;
    saveStoredData(KEYS.EMPLOYEES, employees);

    if (attempts >= 5) {
      throw { errorCode: 'ERR-AUTH-02', message: 'This account has been locked due to multiple failed login attempts. Please contact your system administrator.' };
    } else {
      throw { errorCode: 'ERR-AUTH-01', message: 'Invalid Login ID/Email or password.' };
    }
  }

  // Reset failed attempts on success
  employee.failedAttempts = 0;
  employees[employeeIndex] = employee;
  saveStoredData(KEYS.EMPLOYEES, employees);

  const token = `mock-jwt-token-for-${employee.id}`;
  const response = {
    token,
    mustResetPassword: employee.status === 'PASSWORD_CHANGE_REQUIRED' || employee.status === 'PENDING_ACTIVATION' || !!employee.mustResetPassword,
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

  mockWriteAuditLog(employee.email, 'User logged in successfully', 'Auth', 'Success');
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(response));
  return response;
};

export const mockAuthLogout = () => {
  const active = mockGetCurrentUser();
  if (active) {
    mockWriteAuditLog(active.user.email, 'User logged out', 'Auth', 'Success');
  }
  localStorage.removeItem(KEYS.CURRENT_USER);
};

export const mockGetCurrentUser = () => {
  const current = localStorage.getItem(KEYS.CURRENT_USER);
  return current ? JSON.parse(current) : null;
};

export const mockForgotPassword = async (identifier: string) => {
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const employee = employees.find(
    (emp) => (emp.email === identifier || emp.loginId === identifier)
  );

  if (employee) {
    mockWriteAuditLog(employee.email, 'Requested password recovery OTP', 'Auth', 'Success');
  } else {
    mockWriteAuditLog(identifier, 'Password recovery requested for non-existent identifier', 'Auth', 'Success');
  }

  // Always return a generic success message to prevent user enumeration
  return { 
    success: true, 
    message: 'If the account exists, password recovery instructions have been sent.' 
  };
};

export const mockVerifyOtpAndResetPassword = async (identifier: string, otp: string, newPassword: string) => {
  if (otp !== '123456') {
    throw { errorCode: 'ERR-VAL-01', message: 'Invalid OTP verification code. Please check your instructions.' };
  }

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const index = employees.findIndex(
    (emp) => (emp.email === identifier || emp.loginId === identifier)
  );

  if (index === -1) {
    throw { errorCode: 'ERR-AUTH-01', message: 'Account not found.' };
  }

  const emp = employees[index];

  // Strong password check: min 8-12 characters, upper, lower, digit, special character
  const passwordLength = newPassword.length;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasDigit = /[0-9]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);

  if (passwordLength < 8 || passwordLength > 20 || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    throw {
      errorCode: 'ERR-VAL-01',
      message: 'Password must be between 8 and 20 characters, containing uppercase, lowercase, numeric, and special characters.',
      field: 'newPassword'
    };
  }

  emp.passwordHash = hashPassword(newPassword);
  emp.status = 'ACTIVE';
  emp.mustResetPassword = false;
  emp.failedAttempts = 0;
  emp.updatedAt = new Date().toISOString();

  employees[index] = emp;
  saveStoredData(KEYS.EMPLOYEES, employees);

  mockWriteAuditLog(emp.email, 'Password successfully reset via OTP verification', 'Auth', 'Success');
  return { success: true };
};

export const mockResetPassword = async (employeeId: string, currentPasswordRaw: string, newPasswordRaw: string) => {
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const index = employees.findIndex((emp) => emp.id === employeeId);

  if (index === -1) {
    throw { errorCode: 'ERR-AUTH-01', message: 'Employee not found.' };
  }

  const emp = employees[index];
  const currentHash = hashPassword(currentPasswordRaw);

  if (emp.passwordHash !== currentHash) {
    throw { errorCode: 'ERR-AUTH-01', message: 'Incorrect current password.', field: 'currentPassword' };
  }

  // Strong password checks
  const passwordLength = newPasswordRaw.length;
  const hasUpper = /[A-Z]/.test(newPasswordRaw);
  const hasLower = /[a-z]/.test(newPasswordRaw);
  const hasDigit = /[0-9]/.test(newPasswordRaw);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPasswordRaw);

  if (passwordLength < 8 || passwordLength > 20 || !hasUpper || !hasLower || !hasDigit || !hasSpecial) {
    throw {
      errorCode: 'ERR-VAL-01',
      message: 'Password must be between 8 and 20 characters, containing uppercase, lowercase, numeric, and special characters.',
      field: 'newPassword'
    };
  }

  emp.passwordHash = hashPassword(newPasswordRaw);
  emp.status = 'ACTIVE';
  emp.mustResetPassword = false;
  emp.failedAttempts = 0;
  emp.updatedAt = new Date().toISOString();

  employees[index] = emp;
  saveStoredData(KEYS.EMPLOYEES, employees);

  // Update active session
  const activeSession = mockGetCurrentUser();
  if (activeSession && activeSession.user.id === employeeId) {
    activeSession.mustResetPassword = false;
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(activeSession));
  }

  mockWriteAuditLog(emp.email, 'Temporary password updated successfully on first login', 'Auth', 'Success');
  return { success: true };
};

// Helper to generate a strong temporary password meeting criteria:
// Random, Strong, Minimum 8-12 characters, Uppercase, Lowercase, Number, Special character.
export const generateTempPassword = (): string => {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const digits = '23456789';
  const specials = '!@#$%^&*()_+~|}{[]:;?><,./-=';
  
  // Guarantee one of each character class is included
  let pwd = '';
  pwd += uppers[Math.floor(Math.random() * uppers.length)];
  pwd += lowers[Math.floor(Math.random() * lowers.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  pwd += specials[Math.floor(Math.random() * specials.length)];
  
  const allChars = uppers + lowers + digits + specials;
  for (let i = 0; i < 6; i++) {
    pwd += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle characters
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
};

// --- EMPLOYEES API ---

export const mockCreateEmployee = async (callerId: string, employeeData: Omit<Employee, 'id' | 'loginId' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'empCode'>) => {
  const caller = getStoredData<Employee>(KEYS.EMPLOYEES).find((e) => e.id === callerId);
  if (!caller || (caller.role !== 'ADMIN' && caller.role !== 'HR_OFFICER')) {
    throw { errorCode: 'ERR-SEC-01', message: 'Unauthorized. Only Admins or HR Officers can onboarding new employees.' };
  }

  // Load Company Settings to fetch companyCode
  const companySettingsStr = localStorage.getItem('hrms_company_settings');
  const companySettings = companySettingsStr ? JSON.parse(companySettingsStr) : null;
  const companyCode = companySettings ? companySettings.companyCode : null;

  if (!companyCode || companyCode.trim().length < 2 || companyCode.trim().length > 5) {
    throw { errorCode: 'ERR-CONFIG-01', message: 'Company Code is not configured. An Admin must configure a 2-5 character uppercase Company Code under settings before creating employee accounts.' };
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
  const prefix = companyCode.toUpperCase();
  const yearlyHires = employees.filter((e) => {
    const eDate = new Date(e.dateOfJoining);
    return e.loginId.startsWith(prefix) && eDate.getFullYear() === year;
  });

  // Unique Login ID and Serial calculation (Duplicate Prevention check loop)
  let serial = yearlyHires.length + 1;
  const first2First = employeeData.firstName.substring(0, 2).toUpperCase().padEnd(2, 'X');
  const first2Last = employeeData.lastName.substring(0, 2).toUpperCase().padEnd(2, 'X');
  
  let loginId = `${prefix}${first2First}${first2Last}${year}${String(serial).padStart(4, '0')}`;
  while (employees.some(e => e.loginId === loginId)) {
    serial++;
    loginId = `${prefix}${first2First}${first2Last}${year}${String(serial).padStart(4, '0')}`;
  }

  const empCode = `EMP-${String(employees.length + 1).padStart(3, '0')}`;
  const tempPassword = generateTempPassword();

  const newEmployee: Employee = {
    ...employeeData,
    id,
    loginId,
    empCode,
    passwordHash: hashPassword(tempPassword), // Hashed before storage
    status: 'PENDING_ACTIVATION',
    failedAttempts: 0,
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

  // Create initial SalaryConfig
  const salaries = getStoredData<SalaryConfig>(KEYS.SALARIES);
  salaries.push({
    employeeId: id,
    wageType: 'FIXED',
    wagePeriod: 'MONTHLY',
    wageAmount: 5000000, // ₹50,000 in paise
    pfEmployeeRate: 0.12,
    pfEmployerRate: 0.12,
    professionalTax: 20000,
    workingDays: 5,
    breakTimeMins: 60,
    pfCalculationBase: 'BASIC_SALARY',
    components: [
      { name: 'BASIC', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 50, computedAmount: 2500000, description: 'Basic salary is calculated based on the configured percentage of monthly wages.', status: 'Active' },
      { name: 'HRA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 50, referenceComponent: 'BASIC', computedAmount: 1250000, description: 'HRA is calculated based on the configured percentage of basic salary.', status: 'Active' },
      { name: 'STANDARD_ALLOWANCE', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 8.334, computedAmount: 416700, description: 'Standard allowance component.', status: 'Active' },
      { name: 'PERFORMANCE_BONUS', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 4.165, computedAmount: 208250, description: 'Performance bonus component.', status: 'Active' },
      { name: 'LTA', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 4.165, computedAmount: 208250, description: 'Leave travel allowance component.', status: 'Active' },
      { name: 'FIXED_ALLOWANCE', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 5.836, computedAmount: 291800, description: 'Fixed allowance component.', status: 'Active' }
    ],
    customDeductions: []
  });
  saveStoredData(KEYS.SALARIES, salaries);

  mockWriteAuditLog(caller.email, `Created new employee account: ${employeeData.firstName} ${employeeData.lastName} (${loginId})`, 'Users', 'Success');

  return {
    employeeId: id,
    loginId,
    tempPassword
  };
};

export const mockUpdateEmployeeStatus = (
  callerRole: UserRole,
  employeeId: string,
  newStatus: 'ACTIVE' | 'SUSPENDED' | 'UNLOCK' | 'DEACTIVATED',
  adminEmail: string
) => {
  if (callerRole !== 'ADMIN' && callerRole !== 'HR_OFFICER') {
    throw { errorCode: 'ERR-SEC-01', message: 'Unauthorized. Only Administrators or HR Officers can modify account status.' };
  }

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const index = employees.findIndex(e => e.id === employeeId);

  if (index === -1) {
    throw { errorCode: 'ERR-VAL-01', message: 'Employee not found.' };
  }

  const emp = employees[index];
  const prevStatus = emp.status || 'ACTIVE';
  
  if (newStatus === 'UNLOCK') {
    emp.status = 'ACTIVE';
    emp.failedAttempts = 0;
  } else {
    emp.status = newStatus;
  }

  emp.updatedAt = new Date().toISOString();
  employees[index] = emp;
  saveStoredData(KEYS.EMPLOYEES, employees);

  mockWriteAuditLog(
    adminEmail,
    `Updated account status for ${emp.firstName} ${emp.lastName} from ${prevStatus} to ${emp.status}`,
    'Users',
    'Success',
    prevStatus,
    emp.status
  );

  return emp;
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
    throw { errorCode: 'ERR-SEC-403', message: '403 — Access Denied. Insufficient permissions.' };
  }

  const salaries = getStoredData<SalaryConfig>(KEYS.SALARIES);
  let config = salaries.find((s) => s.employeeId === employeeId);

  // Return a default template if no config exists yet for this employee
  if (!config) {
    config = {
      employeeId,
      wageType: 'FIXED',
      wagePeriod: 'MONTHLY',
      wageAmount: 5000000, // ₹50,000 in paise
      pfEmployeeRate: 0.12,
      pfEmployerRate: 0.12,
      professionalTax: 20000, // ₹200 in paise
      workingDays: 5,
      breakTimeMins: 60,
      pfCalculationBase: 'BASIC_SALARY',
      components: [
        { name: 'BASIC', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 50, computedAmount: 2500000, description: 'Basic salary is calculated based on the configured percentage of monthly wages.', status: 'Active' },
        { name: 'HRA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 50, referenceComponent: 'BASIC', computedAmount: 1250000, description: 'HRA is calculated based on the configured percentage of basic salary.', status: 'Active' },
        { name: 'STANDARD_ALLOWANCE', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 8.334, computedAmount: 416700, description: 'Standard allowance component.', status: 'Active' },
        { name: 'PERFORMANCE_BONUS', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 4.165, computedAmount: 208250, description: 'Performance bonus component.', status: 'Active' },
        { name: 'LTA', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 4.165, computedAmount: 208250, description: 'Leave travel allowance component.', status: 'Active' },
        { name: 'FIXED_ALLOWANCE', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 5.836, computedAmount: 291800, description: 'Fixed allowance component.', status: 'Active' }
      ],
      customDeductions: []
    };
  }

  return config;
};

export const mockUpdateSalaryConfig = (
  callerRole: UserRole, 
  employeeId: string, 
  configOrWage: Partial<SalaryConfig> | number, 
  adminEmail: string = 'hr@company.com'
) => {
  if (callerRole !== 'ADMIN') {
    throw { errorCode: 'ERR-SEC-403', message: '403 — Access Denied. Insufficient permissions.' };
  }

  const salaries = getStoredData<SalaryConfig>(KEYS.SALARIES);
  const index = salaries.findIndex((s) => s.employeeId === employeeId);

  const prevConfig = index !== -1 ? salaries[index] : null;
  const prevSalary = prevConfig ? prevConfig.wageAmount : 4500000; // default prev ₹45,000

  let updatedConfig: SalaryConfig;

  if (typeof configOrWage === 'number') {
    const wageAmount = configOrWage as number;
    const basic = Math.round(wageAmount * 0.50);
    const hra = Math.round(basic * 0.50);
    const standardAllowance = 416700;
    const performanceBonus = Math.round(basic * 0.0833);
    const lta = Math.round(basic * 0.0833);
    const otherComponentsSum = basic + hra + standardAllowance + performanceBonus + lta;
    const fixedAllowance = wageAmount - otherComponentsSum;

    const components: SalaryComponent[] = [
      { name: 'BASIC', computationType: 'PERCENTAGE_OF_WAGE', computationValue: 50, computedAmount: basic },
      { name: 'HRA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 50, referenceComponent: 'BASIC', computedAmount: hra },
      { name: 'STANDARD_ALLOWANCE', computationType: 'FIXED_AMOUNT', computationValue: 416700, computedAmount: standardAllowance },
      { name: 'PERFORMANCE_BONUS', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 8.33, referenceComponent: 'BASIC', computedAmount: performanceBonus },
      { name: 'LTA', computationType: 'PERCENTAGE_OF_COMPONENT', computationValue: 8.33, referenceComponent: 'BASIC', computedAmount: lta },
      { name: 'FIXED_ALLOWANCE', computationType: 'FIXED_AMOUNT', computationValue: fixedAllowance < 0 ? 0 : fixedAllowance, computedAmount: fixedAllowance < 0 ? 0 : fixedAllowance }
    ];

    updatedConfig = {
      employeeId,
      wageType: 'FIXED',
      wagePeriod: 'MONTHLY',
      wageAmount,
      components,
      pfEmployeeRate: 0.12,
      pfEmployerRate: 0.12,
      professionalTax: 20000,
      workingDays: 5,
      breakTimeMins: 60,
      pfCalculationBase: 'BASIC_SALARY',
      customDeductions: []
    };
  } else {
    const config = configOrWage as Partial<SalaryConfig>;
    updatedConfig = {
      employeeId,
      wageType: 'FIXED',
      wagePeriod: 'MONTHLY',
      wageAmount: config.wageAmount || 5000000,
      components: config.components || [],
      pfEmployeeRate: config.pfEmployeeRate !== undefined ? config.pfEmployeeRate : 0.12,
      pfEmployerRate: config.pfEmployerRate !== undefined ? config.pfEmployerRate : 0.12,
      professionalTax: config.professionalTax !== undefined ? config.professionalTax : 20000,
      workingDays: config.workingDays || 5,
      breakTimeMins: config.breakTimeMins || 60,
      pfCalculationBase: config.pfCalculationBase || 'BASIC_SALARY',
      customDeductions: config.customDeductions || []
    };
  }

  if (index === -1) {
    salaries.push(updatedConfig);
  } else {
    salaries[index] = updatedConfig;
  }
  saveStoredData(KEYS.SALARIES, salaries);

  // 1. Add record to Salary History
  const history = getStoredData<SalaryHistoryRecord>(KEYS.SALARY_HISTORY);
  const basicComp = updatedConfig.components.find(c => c.name === 'BASIC');
  const basicAmount = basicComp ? basicComp.computedAmount : Math.round(updatedConfig.wageAmount * 0.5);
  
  // Deductions calculations
  const pfBase = updatedConfig.pfCalculationBase === 'BASIC_SALARY' ? basicAmount : updatedConfig.wageAmount;
  const pfDeduction = Math.round(pfBase * updatedConfig.pfEmployeeRate);
  const otherDeductions = updatedConfig.customDeductions ? updatedConfig.customDeductions.filter(d => d.status === 'Active').reduce((sum, d) => {
    if (d.computationType === 'Percentage') {
      return sum + Math.round(updatedConfig.wageAmount * (d.value / 100));
    }
    return sum + d.value;
  }, 0) : 0;
  const totalDeductions = pfDeduction + updatedConfig.professionalTax + otherDeductions;
  const netSalary = updatedConfig.wageAmount - totalDeductions;

  const newHist: SalaryHistoryRecord = {
    id: `hist-${Math.random().toString(36).substr(2, 9)}`,
    employeeId,
    effectiveDate: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
    monthlySalary: updatedConfig.wageAmount,
    basic: basicAmount,
    gross: updatedConfig.wageAmount,
    net: netSalary,
    updatedBy: adminEmail,
    createdAt: new Date().toISOString()
  };
  history.unshift(newHist);
  saveStoredData(KEYS.SALARY_HISTORY, history);

  // 2. Add record to Salary Audit Logs
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const emp = employees.find(e => e.id === employeeId);
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee';

  const auditLogs = getStoredData<SalaryAuditLog>(KEYS.SALARY_AUDIT_LOGS);
  const newAudit: SalaryAuditLog = {
    id: `aud-${Math.random().toString(36).substr(2, 9)}`,
    admin: adminEmail,
    employee: empName,
    prevSalary,
    newSalary: updatedConfig.wageAmount,
    changedComponents: updatedConfig.components.map(c => c.name).join(', '),
    timestamp: new Date().toLocaleString(),
    ip: '192.168.1.15',
    device: 'macOS (Chrome)',
    action: `Admin updated monthly salary for ${empName} from ₹${(prevSalary / 100).toLocaleString()} to ₹${(updatedConfig.wageAmount / 100).toLocaleString()}.`
  };
  auditLogs.unshift(newAudit);
  saveStoredData(KEYS.SALARY_AUDIT_LOGS, auditLogs);

  return updatedConfig;
};

export const mockGetSalaryHistory = (callerRole: UserRole, employeeId: string) => {
  if (callerRole !== 'ADMIN') {
    throw { errorCode: 'ERR-SEC-403', message: '403 — Access Denied. Insufficient permissions.' };
  }
  const history = getStoredData<SalaryHistoryRecord>(KEYS.SALARY_HISTORY);
  return history.filter(h => h.employeeId === employeeId);
};

export const mockGetSalaryAuditLogs = (callerRole: UserRole) => {
  if (callerRole !== 'ADMIN') {
    throw { errorCode: 'ERR-SEC-403', message: '403 — Access Denied. Insufficient permissions.' };
  }
  return getStoredData<SalaryAuditLog>(KEYS.SALARY_AUDIT_LOGS);
};

export const mockExportSalaryDetails = (callerRole: UserRole, employeeId: string) => {
  if (callerRole !== 'ADMIN') {
    throw { errorCode: 'ERR-SEC-403', message: '403 — Access Denied. Insufficient permissions.' };
  }
  
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const emp = employees.find(e => e.id === employeeId);
  const name = emp ? `${emp.firstName} ${emp.lastName}` : 'Employee';
  
  const salaries = getStoredData<SalaryConfig>(KEYS.SALARIES);
  const config = salaries.find(s => s.employeeId === employeeId);
  
  if (!config) {
    throw { errorCode: 'ERR-VAL-01', message: 'No salary configuration found to export.' };
  }

  const csv = `Employee,Monthly Salary,Basic Salary,PF Employee Contribution,Professional Tax\n` + 
              `"${name}",₹${(config.wageAmount/100).toFixed(2)},₹${((config.wageAmount*0.5)/100).toFixed(2)},12%,₹200.00`;
              
  return { csv, filename: `${name.toLowerCase().replace(/ /g, '_')}_salary_details.csv` };
};

// --- ATTENDANCE API ---

// Helper: get attendance settings from localStorage
const getAttendanceSettings = () => {
  try {
    const raw = localStorage.getItem('hrms_attendance_settings');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

// Helper: is a date a weekend per settings
const isWeekend = (dateStr: string): boolean => {
  const settings = getAttendanceSettings();
  const workingDays = settings?.workingDays || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const d = new Date(dateStr + 'T12:00:00'); // avoid UTC offset issues
  return !workingDays.includes(dayNames[d.getDay()]);
};

// Helper: compute attendance status from a log record + settings
const computeAttendanceStatus = (
  log: Attendance | undefined,
  hasApprovedLeave: boolean,
  dateStr: string,
  settings: any
): AttendanceStatus => {
  const todayStr = new Date().toISOString().split('T')[0];
  if (isWeekend(dateStr)) return 'WEEKEND';
  if (hasApprovedLeave) return 'ON_LEAVE';
  if (!log) {
    if (dateStr > todayStr) return 'WEEKEND'; // future date — neutral
    return 'ABSENT';
  }
  if (log.checkInAt && !log.checkOutAt) return 'MISSING'; // missing checkout
  const halfDayThreshold = settings?.halfDayThresholdHours ?? 4;
  const standardHours = DEFAULT_CONFIGS.STANDARD_WORK_HOURS;
  const worked = log.workHours ?? 0;
  if (worked >= standardHours) return 'PRESENT';
  if (worked >= halfDayThreshold) return 'HALF_DAY';
  if (worked > 0) return 'HALF_DAY';
  return 'PRESENT'; // checked in and out but 0 hours (very short shift)
};

export const mockCheckIn = async (employeeId: string) => {
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const today = new Date().toISOString().split('T')[0];

  const activeRecord = attendanceLogs.find(
    (a) => a.employeeId === employeeId && a.date === today && !a.checkOutAt
  );

  if (activeRecord) {
    throw { errorCode: 'ERR-STATE-01', message: 'You are already checked in. Please check out first.' };
  }

  const settings = getAttendanceSettings();
  const breakMins = settings?.breakDurationMins ?? DEFAULT_CONFIGS.DEFAULT_BREAK_TIME_MINS;

  const newLog: Attendance = {
    id: `att-uuid-${Math.random().toString(36).substr(2, 9)}`,
    employeeId,
    date: today,
    checkInAt: new Date().toISOString(),
    breakTime: breakMins,
    status: 'PRESENT'
  };

  attendanceLogs.push(newLog);
  saveStoredData(KEYS.ATTENDANCE, attendanceLogs);
  return newLog;
};

export const mockCheckOut = async (employeeId: string) => {
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const today = new Date().toISOString().split('T')[0];

  const activeIndex = attendanceLogs.findIndex(
    (a) => a.employeeId === employeeId && a.date === today && !a.checkOutAt
  );

  if (activeIndex === -1) {
    throw { errorCode: 'ERR-STATE-02', message: 'No active check-in found for today.' };
  }

  const record = attendanceLogs[activeIndex];
  const checkOutAt = new Date().toISOString();

  const checkInTime = new Date(record.checkInAt!).getTime();
  const checkOutTime = new Date(checkOutAt).getTime();
  const breakMins = record.breakTime ?? DEFAULT_CONFIGS.DEFAULT_BREAK_TIME_MINS;
  const settings = getAttendanceSettings();
  const standardHours = settings?.standardWorkHours ?? DEFAULT_CONFIGS.STANDARD_WORK_HOURS;
  const halfDayThreshold = settings?.halfDayThresholdHours ?? 4;

  const diffHours = (checkOutTime - checkInTime) / (1000 * 60 * 60);
  const actualWorkHours = Math.max(0, diffHours - (breakMins / 60));
  const extraHours = Math.max(0, actualWorkHours - standardHours);

  let finalStatus: AttendanceStatus = 'PRESENT';
  if (actualWorkHours >= standardHours) finalStatus = 'PRESENT';
  else if (actualWorkHours >= halfDayThreshold) finalStatus = 'HALF_DAY';
  else finalStatus = 'HALF_DAY';

  record.checkOutAt = checkOutAt;
  record.workHours = parseFloat(actualWorkHours.toFixed(2));
  record.extraHours = parseFloat(extraHours.toFixed(2));
  record.status = finalStatus;

  attendanceLogs[activeIndex] = record;
  saveStoredData(KEYS.ATTENDANCE, attendanceLogs);
  return record;
};

export const mockGetAttendanceHistory = (employeeId: string, month: number, year: number) => {
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  return attendanceLogs.filter((log) => {
    const logDate = new Date(log.date + 'T12:00:00');
    return (
      log.employeeId === employeeId &&
      logDate.getMonth() === month &&
      logDate.getFullYear() === year
    );
  });
};

// Full daily summary for Admin/HR — with smart status calculation
export const mockGetDailyAttendanceSummary = (callerRole: UserRole, dateString: string, searchQuery?: string) => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied. Insufficient permissions.' };
  }

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const leaveRequests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);
  const settings = getAttendanceSettings();

  const dailyLogs = attendanceLogs.filter((log) => log.date === dateString);
  const approvedLeaves = leaveRequests.filter(
    (req) => req.status === 'APPROVED' && dateString >= req.startDate && dateString <= req.endDate
  );

  let filteredEmployees = employees.filter(e => e.role !== 'EMPLOYER');
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredEmployees = filteredEmployees.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.loginId.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.jobPosition.toLowerCase().includes(q)
    );
  }

  return filteredEmployees.map((emp) => {
    const log = dailyLogs.find((l) => l.employeeId === emp.id);
    const leave = approvedLeaves.find((l) => l.employeeId === emp.id);
    const status = computeAttendanceStatus(log, !!leave, dateString, settings);

    return {
      attendanceId: log?.id,
      employeeId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      jobPosition: emp.jobPosition,
      loginId: emp.loginId,
      checkIn: log?.checkInAt,
      checkOut: log?.checkOutAt,
      workHours: log?.workHours ?? 0,
      extraHours: log?.extraHours ?? 0,
      status,
      correctedBy: log?.correctedBy,
      correctionReason: log?.correctionReason,
    };
  });
};

// Monthly attendance summary for a single employee (payroll-ready)
export const mockGetPayableDaysSummary = (employeeId: string, month: number, year: number) => {
  const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const leaveRequests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);
  const settings = getAttendanceSettings();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = new Date().toISOString().split('T')[0];

  let presentDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let missingDays = 0;
  let paidLeaveDays = 0;
  let unpaidLeaveDays = 0;
  let weekendDays = 0;
  let totalWorkHours = 0;
  let totalExtraHours = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (dateStr > todayStr) continue; // skip future dates

    if (isWeekend(dateStr)) { weekendDays++; continue; }

    const log = attendanceLogs.find(a => a.employeeId === employeeId && a.date === dateStr);
    const approvedLeave = leaveRequests.find(r =>
      r.employeeId === employeeId &&
      r.status === 'APPROVED' &&
      dateStr >= r.startDate &&
      dateStr <= r.endDate
    );

    const status = computeAttendanceStatus(log, !!approvedLeave, dateStr, settings);

    switch (status) {
      case 'PRESENT':
        presentDays++;
        totalWorkHours += log?.workHours ?? 0;
        totalExtraHours += log?.extraHours ?? 0;
        break;
      case 'HALF_DAY':
        halfDays++;
        totalWorkHours += log?.workHours ?? 0;
        totalExtraHours += log?.extraHours ?? 0;
        break;
      case 'MISSING':
        missingDays++;
        totalWorkHours += log?.workHours ?? 0;
        break;
      case 'ON_LEAVE':
        if (approvedLeave?.type === 'UNPAID_LEAVE') unpaidLeaveDays++;
        else paidLeaveDays++;
        break;
      case 'ABSENT':
        absentDays++;
        break;
    }
  }

  const workingDays = daysInMonth - weekendDays;
  const payableDays = presentDays + (halfDays * 0.5) + paidLeaveDays;

  return {
    presentDays,
    halfDays,
    absentDays,
    missingDays,
    paidLeaveDays,
    unpaidLeaveDays,
    weekendDays,
    workingDays,
    payableDays: parseFloat(payableDays.toFixed(1)),
    totalWorkHours: parseFloat(totalWorkHours.toFixed(2)),
    totalExtraHours: parseFloat(totalExtraHours.toFixed(2)),
  };
};

// Monthly summary for all employees (Admin/HR view)
export const mockGetMonthlyAttendanceSummary = (callerRole: UserRole, month: number, year: number, searchQuery?: string) => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied.' };
  }
  let employees = getStoredData<Employee>(KEYS.EMPLOYEES).filter(e => e.role !== 'EMPLOYER');
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    employees = employees.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.loginId.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }
  return employees.map(emp => {
    const summary = mockGetPayableDaysSummary(emp.id, month, year);
    return {
      employeeId: emp.id,
      name: `${emp.firstName} ${emp.lastName}`,
      department: emp.department,
      jobPosition: emp.jobPosition,
      loginId: emp.loginId,
      ...summary
    };
  });
};

// Attendance Correction — Admin/HR only
export const mockCorrectAttendance = async (
  correctorId: string,
  correctorRole: UserRole,
  attendanceId: string,
  corrections: { checkInAt?: string; checkOutAt?: string; reason: string }
) => {
  if (correctorRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied. Only HR Officers and Administrators may correct attendance.' };
  }
  if (!corrections.reason || corrections.reason.trim().length < 5) {
    throw { errorCode: 'ERR-VAL-01', message: 'A reason of at least 5 characters is required for attendance corrections.' };
  }

  const logs = getStoredData<Attendance>(KEYS.ATTENDANCE);
  const idx = logs.findIndex(a => a.id === attendanceId);
  if (idx === -1) throw { errorCode: 'ERR-VAL-02', message: 'Attendance record not found.' };

  const record = { ...logs[idx] };
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const corrector = employees.find(e => e.id === correctorId);
  const correctorName = corrector ? `${corrector.firstName} ${corrector.lastName}` : correctorId;

  const auditEntries: AttendanceCorrectionAudit[] = [];
  const settings = getAttendanceSettings();

  if (corrections.checkInAt !== undefined && corrections.checkInAt !== record.checkInAt) {
    auditEntries.push({
      id: `aud-${Math.random().toString(36).substr(2, 9)}`,
      attendanceId,
      employeeId: record.employeeId,
      changedBy: correctorId,
      changedByName: correctorName,
      field: 'checkInAt',
      oldValue: record.checkInAt ?? '--',
      newValue: corrections.checkInAt,
      reason: corrections.reason,
      timestamp: new Date().toISOString(),
    });
    record.checkInAt = corrections.checkInAt;
  }

  if (corrections.checkOutAt !== undefined && corrections.checkOutAt !== record.checkOutAt) {
    auditEntries.push({
      id: `aud-${Math.random().toString(36).substr(2, 9)}`,
      attendanceId,
      employeeId: record.employeeId,
      changedBy: correctorId,
      changedByName: correctorName,
      field: 'checkOutAt',
      oldValue: record.checkOutAt ?? '--',
      newValue: corrections.checkOutAt,
      reason: corrections.reason,
      timestamp: new Date().toISOString(),
    });
    record.checkOutAt = corrections.checkOutAt;
  }

  // Recalculate hours after correction
  if (record.checkInAt && record.checkOutAt) {
    const breakMins = record.breakTime ?? DEFAULT_CONFIGS.DEFAULT_BREAK_TIME_MINS;
    const standardHours = settings?.standardWorkHours ?? DEFAULT_CONFIGS.STANDARD_WORK_HOURS;
    const halfDayThreshold = settings?.halfDayThresholdHours ?? 4;
    const diff = (new Date(record.checkOutAt).getTime() - new Date(record.checkInAt).getTime()) / (1000 * 60 * 60);
    const worked = Math.max(0, diff - (breakMins / 60));
    const extra = Math.max(0, worked - standardHours);
    record.workHours = parseFloat(worked.toFixed(2));
    record.extraHours = parseFloat(extra.toFixed(2));
    record.status = worked >= standardHours ? 'PRESENT' : worked >= halfDayThreshold ? 'HALF_DAY' : 'HALF_DAY';
  } else if (record.checkInAt && !record.checkOutAt) {
    record.status = 'MISSING';
  }

  record.correctedBy = correctorId;
  record.correctionReason = corrections.reason;

  logs[idx] = record;
  saveStoredData(KEYS.ATTENDANCE, logs);

  if (auditEntries.length > 0) {
    const auditLog = getStoredData<AttendanceCorrectionAudit>(KEYS.ATTENDANCE_AUDIT);
    auditLog.push(...auditEntries);
    saveStoredData(KEYS.ATTENDANCE_AUDIT, auditLog);
  }

  return record;
};

// Get audit log for a specific attendance record
export const mockGetAttendanceAuditLog = (callerRole: UserRole, attendanceId: string): AttendanceCorrectionAudit[] => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied.' };
  }
  const auditLog = getStoredData<AttendanceCorrectionAudit>(KEYS.ATTENDANCE_AUDIT);
  return auditLog.filter(a => a.attendanceId === attendanceId);
};

// Payroll-ready summary for a specific employee (used by PayrollView)
export const mockGetAttendanceSummaryForPayroll = (
  callerRole: UserRole,
  callerId: string,
  targetEmployeeId: string,
  month: number,
  year: number
) => {
  if (callerRole === 'EMPLOYEE' && callerId !== targetEmployeeId) {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied.' };
  }
  return mockGetPayableDaysSummary(targetEmployeeId, month, year);
};

// --- TIME OFF / LEAVE MANAGEMENT API ---

export const mockGetCompanyHolidays = () => {
  return [
    { date: '2026-01-01', name: 'New Year\'s Day' },
    { date: '2026-01-26', name: 'Republic Day' },
    { date: '2026-08-15', name: 'Independence Day' },
    { date: '2026-10-02', name: 'Gandhi Jayanti' },
    { date: '2026-12-25', name: 'Christmas Day' },
  ];
};

export const mockWriteLeaveAudit = (
  action: LeaveAuditLog['action'],
  actorId: string,
  actorName: string,
  employeeId: string,
  employeeName: string,
  details: string
) => {
  const logs = getStoredData<LeaveAuditLog>(KEYS.LEAVE_AUDIT);
  const newLog: LeaveAuditLog = {
    id: `laud-${Math.random().toString(36).substr(2, 9)}`,
    action,
    actorId,
    actorName,
    employeeId,
    employeeName,
    details,
    timestamp: new Date().toISOString(),
  };
  logs.unshift(newLog);
  saveStoredData(KEYS.LEAVE_AUDIT, logs);
  return newLog;
};

export const mockWriteNotification = (userId: string, title: string, message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
  const notifs = getStoredData<any>(KEYS.NOTIFICATIONS);
  const newNotif = {
    id: `notif-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title,
    message,
    type,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifs.unshift(newNotif);
  saveStoredData(KEYS.NOTIFICATIONS, notifs);
  return newNotif;
};

export const mockGetLeaveTypes = (): LeaveTypeConfig[] => {
  return getStoredData<LeaveTypeConfig>(KEYS.LEAVE_TYPES);
};

export const mockCreateLeaveType = async (callerRole: UserRole, config: Omit<LeaveTypeConfig, 'id'>) => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied. Only Administrators can configure leave types.' };
  }
  const types = getStoredData<LeaveTypeConfig>(KEYS.LEAVE_TYPES);
  if (types.some(t => t.code.toUpperCase() === config.code.toUpperCase())) {
    throw { errorCode: 'ERR-VAL-01', message: `Leave type code "${config.code}" already exists.` };
  }

  const newType: LeaveTypeConfig = {
    ...config,
    id: `lt-${Math.random().toString(36).substr(2, 9)}`,
    code: config.code.toUpperCase().replace(/\s+/g, '_'),
  };

  types.push(newType);
  saveStoredData(KEYS.LEAVE_TYPES, types);

  // Auto-seed balances for existing employees for new leave type
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);

  employees.forEach(emp => {
    if (!balances.some(b => b.employeeId === emp.id && b.type === newType.code)) {
      balances.push({
        id: `bal-${Math.random().toString(36).substr(2, 9)}`,
        employeeId: emp.id,
        type: newType.code,
        allocatedDays: newType.annualAllocation,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: newType.annualAllocation,
        carryForwardDays: 0,
      });
    }
  });

  saveStoredData(KEYS.LEAVE_BALANCES, balances);
  return newType;
};

export const mockUpdateLeaveType = async (callerRole: UserRole, id: string, updates: Partial<LeaveTypeConfig>) => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied.' };
  }
  const types = getStoredData<LeaveTypeConfig>(KEYS.LEAVE_TYPES);
  const index = types.findIndex(t => t.id === id);
  if (index === -1) throw { errorCode: 'ERR-VAL-01', message: 'Leave type not found.' };

  types[index] = { ...types[index], ...updates };
  saveStoredData(KEYS.LEAVE_TYPES, types);
  return types[index];
};

export const mockGetTimeOffBalances = (employeeId: string): TimeOffBalance[] => {
  const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
  const types = mockGetLeaveTypes();
  const empBalances = balances.filter((b) => b.employeeId === employeeId);

  // If balances are missing for some active leave types, dynamically populate
  const missingTypes = types.filter(t => t.isActive && !empBalances.some(b => b.type === t.code));
  if (missingTypes.length > 0) {
    missingTypes.forEach(t => {
      const newBal: TimeOffBalance = {
        id: `bal-${Math.random().toString(36).substr(2, 9)}`,
        employeeId,
        type: t.code,
        allocatedDays: t.annualAllocation,
        usedDays: 0,
        pendingDays: 0,
        remainingDays: t.annualAllocation,
      };
      balances.push(newBal);
      empBalances.push(newBal);
    });
    saveStoredData(KEYS.LEAVE_BALANCES, balances);
  }

  return empBalances;
};

export const mockGetLeaveAllocations = (
  _callerId: string,
  callerRole: UserRole,
  searchQuery?: string,
  departmentFilter?: string,
  typeFilter?: string
) => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied.' };
  }

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES).filter(e => e.role !== 'EMPLOYER');
  const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
  const requests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);
  const leaveTypes = mockGetLeaveTypes();

  let filteredEmployees = employees;
  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredEmployees = filteredEmployees.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(q) ||
      e.loginId.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
    );
  }

  if (departmentFilter && departmentFilter !== 'ALL') {
    filteredEmployees = filteredEmployees.filter(e => e.department === departmentFilter);
  }

  const result: Array<{
    id: string;
    employeeId: string;
    employeeName: string;
    loginId: string;
    department: string;
    leaveType: string;
    leaveTypeName: string;
    allocatedDays: number;
    usedDays: number;
    pendingDays: number;
    availableDays: number;
    carryForwardDays: number;
  }> = [];

  filteredEmployees.forEach(emp => {
    leaveTypes.forEach(lt => {
      if (typeFilter && typeFilter !== 'ALL' && lt.code !== typeFilter) return;

      let bal = balances.find(b => b.employeeId === emp.id && b.type === lt.code);
      if (!bal) {
        bal = {
          id: `bal-${Math.random().toString(36).substr(2, 9)}`,
          employeeId: emp.id,
          type: lt.code,
          allocatedDays: lt.annualAllocation,
          usedDays: 0,
          pendingDays: 0,
          remainingDays: lt.annualAllocation,
        };
      }

      const pendingSum = requests
        .filter(r => r.employeeId === emp.id && r.type === lt.code && r.status === 'PENDING')
        .reduce((sum, r) => sum + r.allocationDays, 0);

      result.push({
        id: bal.id || `bal-${emp.id}-${lt.code}`,
        employeeId: emp.id,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        loginId: emp.loginId,
        department: emp.department,
        leaveType: lt.code,
        leaveTypeName: lt.name,
        allocatedDays: bal.allocatedDays,
        usedDays: bal.usedDays,
        pendingDays: pendingSum,
        availableDays: parseFloat(Math.max(0, bal.allocatedDays - bal.usedDays - pendingSum).toFixed(1)),
        carryForwardDays: bal.carryForwardDays || 0,
      });
    });
  });

  return result;
};

export const mockUpdateLeaveAllocation = async (
  callerId: string,
  callerRole: UserRole,
  employeeId: string,
  type: string,
  allocatedDays: number,
  carryForwardDays: number = 0
) => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied. Only HR Officers and Administrators can manage allocations.' };
  }

  const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);

  const emp = employees.find(e => e.id === employeeId);
  const caller = employees.find(e => e.id === callerId);
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : employeeId;
  const callerName = caller ? `${caller.firstName} ${caller.lastName}` : callerId;

  let index = balances.findIndex(b => b.employeeId === employeeId && b.type === type);
  let oldAllocated = 0;

  if (index !== -1) {
    oldAllocated = balances[index].allocatedDays;
    balances[index].allocatedDays = allocatedDays;
    balances[index].carryForwardDays = carryForwardDays;
    balances[index].remainingDays = parseFloat((allocatedDays - balances[index].usedDays).toFixed(1));
  } else {
    balances.push({
      id: `bal-${Math.random().toString(36).substr(2, 9)}`,
      employeeId,
      type,
      allocatedDays,
      usedDays: 0,
      pendingDays: 0,
      remainingDays: allocatedDays,
      carryForwardDays,
    });
  }

  saveStoredData(KEYS.LEAVE_BALANCES, balances);

  mockWriteLeaveAudit(
    'ALLOCATION_UPDATE',
    callerId,
    callerName,
    employeeId,
    empName,
    `Updated ${type} allocation from ${oldAllocated} days to ${allocatedDays} days (Carry forward: ${carryForwardDays} days).`
  );

  return { success: true };
};

export const mockCalculateWorkingDays = (startDateStr: string, endDateStr: string, isHalfDay: boolean = false): number => {
  if (!startDateStr || !endDateStr) return 0;
  if (isHalfDay) return 0.5;

  const start = new Date(startDateStr + 'T12:00:00');
  const end = new Date(endDateStr + 'T12:00:00');
  if (start > end) return 0;

  const holidays = mockGetCompanyHolidays().map(h => h.date);
  let days = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const dateStr = d.toISOString().split('T')[0];
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !holidays.includes(dateStr)) {
      days++;
    }
  }

  return Math.max(0.5, days);
};

export const mockSubmitTimeOffRequest = async (
  employeeId: string,
  requestData: Omit<TimeOffRequest, 'id' | 'employeeId' | 'status' | 'createdAt'>
) => {
  if (requestData.startDate > requestData.endDate) {
    throw { errorCode: 'ERR-VAL-01', message: 'Start date cannot be after end date.', field: 'startDate' };
  }

  const requests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);
  const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
  const leaveTypes = mockGetLeaveTypes();
  const leaveConfig = leaveTypes.find(t => t.code === requestData.type);

  // 1. Overlapping Request Validation
  const hasOverlap = requests.some(r =>
    r.employeeId === employeeId &&
    r.status !== 'REJECTED' &&
    r.status !== 'CANCELLED' &&
    !(requestData.endDate < r.startDate || requestData.startDate > r.endDate)
  );

  if (hasOverlap) {
    throw {
      errorCode: 'ERR-VAL-02',
      message: 'You already have a pending or approved leave request covering part of this period.',
    };
  }

  // 2. Balance checking for paid leave types
  const isPaidType = leaveConfig ? leaveConfig.isPaid : requestData.type !== 'UNPAID_LEAVE';
  if (isPaidType) {
    const bal = balances.find((b) => b.employeeId === employeeId && b.type === requestData.type);
    const remaining = bal ? bal.remainingDays : 0;

    const pendingSum = requests
      .filter((r) => r.employeeId === employeeId && r.type === requestData.type && r.status === 'PENDING')
      .reduce((sum, r) => sum + r.allocationDays, 0);

    const available = remaining - pendingSum;

    if (requestData.allocationDays > available) {
      throw {
        errorCode: 'ERR-VAL-03',
        message: `Insufficient leave balance. Available: ${available} days (${remaining} remaining, ${pendingSum} pending review). Requested: ${requestData.allocationDays} days.`,
      };
    }
  }

  // 3. Attachment requirement threshold check
  const thresholdDays = leaveConfig?.docRequiredThresholdDays ?? DEFAULT_CONFIGS.SICK_LEAVE_ATTACHMENT_THRESHOLD_DAYS;
  if (
    thresholdDays > 0 &&
    requestData.allocationDays > thresholdDays &&
    !requestData.attachmentUrl
  ) {
    throw {
      errorCode: 'ERR-VAL-04',
      message: `An attachment/document is required for ${requestData.type.replace(/_/g, ' ')} requests exceeding ${thresholdDays} consecutive days.`,
      field: 'attachmentUrl'
    };
  }

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const emp = employees.find(e => e.id === employeeId);
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : employeeId;

  const id = `req-uuid-${Math.random().toString(36).substr(2, 9)}`;
  const newRequest: TimeOffRequest = {
    ...requestData,
    id,
    employeeId,
    status: 'PENDING',
    createdAt: new Date().toISOString()
  };

  requests.unshift(newRequest);
  saveStoredData(KEYS.LEAVE_REQUESTS, requests);

  // Write Audit Log
  mockWriteLeaveAudit(
    'CREATE',
    employeeId,
    empName,
    employeeId,
    empName,
    `Submitted ${requestData.type} request for ${requestData.allocationDays} day(s) from ${requestData.startDate} to ${requestData.endDate}.`
  );

  // Notify HR Officers and Admin
  const hrOfficers = employees.filter(e => e.role === 'HR_OFFICER' || e.role === 'ADMIN');
  hrOfficers.forEach(hr => {
    mockWriteNotification(
      hr.id,
      'New Leave Request',
      `${empName} submitted a ${requestData.type.replace(/_/g, ' ')} request for ${requestData.allocationDays} day(s).`,
      'info'
    );
  });

  return newRequest;
};

export const mockGetLeaveRequests = (
  callerId: string,
  callerRole: UserRole,
  filters?: {
    searchQuery?: string;
    statusFilter?: string;
    typeFilter?: string;
    deptFilter?: string;
    employeeIdFilter?: string;
  }
) => {
  const requests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);
  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);

  let decorated = requests.map((req) => {
    const emp = employees.find((e) => e.id === req.employeeId);
    const reviewer = req.reviewerId ? employees.find((e) => e.id === req.reviewerId) : null;
    return {
      ...req,
      employeeName: emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown Employee',
      department: emp?.department || '',
      loginId: emp?.loginId || '',
      jobPosition: emp?.jobPosition || '',
      reviewerName: reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : (req.reviewerId || ''),
    };
  });

  if (callerRole === 'EMPLOYEE') {
    return decorated.filter((r) => r.employeeId === callerId);
  }

  // Admin / HR Officer filtering
  if (filters?.employeeIdFilter) {
    decorated = decorated.filter(r => r.employeeId === filters.employeeIdFilter);
  }

  if (filters?.deptFilter && filters.deptFilter !== 'ALL') {
    decorated = decorated.filter(r => r.department === filters.deptFilter);
  }

  if (filters?.statusFilter && filters.statusFilter !== 'ALL') {
    decorated = decorated.filter(r => r.status === filters.statusFilter);
  }

  if (filters?.typeFilter && filters.typeFilter !== 'ALL') {
    decorated = decorated.filter(r => r.type === filters.typeFilter);
  }

  if (filters?.searchQuery && filters.searchQuery.trim()) {
    const q = filters.searchQuery.trim().toLowerCase();
    decorated = decorated.filter(r =>
      r.employeeName.toLowerCase().includes(q) ||
      r.loginId.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      (r.reason && r.reason.toLowerCase().includes(q))
    );
  }

  return decorated;
};

export const mockReviewLeaveRequest = async (
  reviewerId: string,
  callerRole: UserRole,
  requestId: string,
  status: 'APPROVED' | 'REJECTED',
  reviewerNote?: string
) => {
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

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const reviewer = employees.find(e => e.id === reviewerId);
  const emp = employees.find(e => e.id === req.employeeId);
  const reviewerName = reviewer ? `${reviewer.firstName} ${reviewer.lastName}` : reviewerId;
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : req.employeeId;

  // Deduct balance if APPROVED and paid leave type
  if (status === 'APPROVED') {
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
  req.reviewerName = reviewerName;
  req.reviewerNote = reviewerNote;
  req.reviewedAt = new Date().toISOString();

  requests[reqIndex] = req;
  saveStoredData(KEYS.LEAVE_REQUESTS, requests);

  // If approved, create Attendance logs as "ON_LEAVE" for working days in date range
  if (status === 'APPROVED') {
    const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
    const start = new Date(req.startDate + 'T12:00:00');
    const end = new Date(req.endDate + 'T12:00:00');

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = d.getDay();

      // Exclude weekends (Sat=6, Sun=0) from attendance ON_LEAVE marking
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
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
    }
    saveStoredData(KEYS.ATTENDANCE, attendanceLogs);
  }

  // Audit Log
  mockWriteLeaveAudit(
    status === 'APPROVED' ? 'APPROVE' : 'REJECT',
    reviewerId,
    reviewerName,
    req.employeeId,
    empName,
    `${status} ${req.type} request (${req.allocationDays} days). Note: "${reviewerNote || 'None'}"`
  );

  // Notification to employee
  mockWriteNotification(
    req.employeeId,
    `Leave Request ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`,
    `Your ${req.type.replace(/_/g, ' ')} request from ${req.startDate} to ${req.endDate} has been ${status.toLowerCase()} by ${reviewerName}.${reviewerNote ? ` Note: ${reviewerNote}` : ''}`,
    status === 'APPROVED' ? 'success' : 'warning'
  );

  return req;
};

export const mockCancelLeaveRequest = async (
  callerId: string,
  callerRole: UserRole,
  requestId: string,
  reason?: string
) => {
  const requests = getStoredData<TimeOffRequest>(KEYS.LEAVE_REQUESTS);
  const index = requests.findIndex(r => r.id === requestId);
  if (index === -1) throw { errorCode: 'ERR-VAL-01', message: 'Leave request not found.' };

  const req = requests[index];

  // Security: Employee can only cancel own request
  if (callerRole === 'EMPLOYEE' && req.employeeId !== callerId) {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied. You cannot cancel another employee\'s leave request.' };
  }

  if (req.status === 'CANCELLED') {
    throw { errorCode: 'ERR-STATE-01', message: 'This leave request is already cancelled.' };
  }

  if (req.status === 'REJECTED') {
    throw { errorCode: 'ERR-STATE-02', message: 'Cannot cancel a rejected leave request.' };
  }

  const employees = getStoredData<Employee>(KEYS.EMPLOYEES);
  const caller = employees.find(e => e.id === callerId);
  const emp = employees.find(e => e.id === req.employeeId);
  const callerName = caller ? `${caller.firstName} ${caller.lastName}` : callerId;
  const empName = emp ? `${emp.firstName} ${emp.lastName}` : req.employeeId;

  // Restore balance if was approved
  if (req.status === 'APPROVED') {
    const balances = getStoredData<TimeOffBalance>(KEYS.LEAVE_BALANCES);
    const balIndex = balances.findIndex(b => b.employeeId === req.employeeId && b.type === req.type);
    if (balIndex !== -1) {
      const bal = balances[balIndex];
      bal.usedDays = parseFloat(Math.max(0, bal.usedDays - req.allocationDays).toFixed(2));
      bal.remainingDays = parseFloat((bal.allocatedDays - bal.usedDays).toFixed(2));
      balances[balIndex] = bal;
      saveStoredData(KEYS.LEAVE_BALANCES, balances);
    }

    // Remove ON_LEAVE status in Attendance
    const attendanceLogs = getStoredData<Attendance>(KEYS.ATTENDANCE);
    const start = new Date(req.startDate + 'T12:00:00');
    const end = new Date(req.endDate + 'T12:00:00');
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const attIndex = attendanceLogs.findIndex(a => a.employeeId === req.employeeId && a.date === dateStr && a.status === 'ON_LEAVE');
      if (attIndex !== -1) {
        attendanceLogs.splice(attIndex, 1);
      }
    }
    saveStoredData(KEYS.ATTENDANCE, attendanceLogs);
  }

  req.status = 'CANCELLED';
  req.cancelledAt = new Date().toISOString();
  req.cancelledBy = callerId;
  req.cancellationReason = reason;

  requests[index] = req;
  saveStoredData(KEYS.LEAVE_REQUESTS, requests);

  // Write audit log
  mockWriteLeaveAudit(
    'CANCEL',
    callerId,
    callerName,
    req.employeeId,
    empName,
    `Cancelled ${req.type} request (${req.allocationDays} days, ${req.startDate} to ${req.endDate}). Reason: "${reason || 'User cancelled'}"`
  );

  // Send notification if cancelled by admin/HR
  if (callerId !== req.employeeId) {
    mockWriteNotification(
      req.employeeId,
      'Leave Request Cancelled',
      `Your ${req.type.replace(/_/g, ' ')} request from ${req.startDate} to ${req.endDate} has been cancelled by ${callerName}.`,
      'info'
    );
  }

  return req;
};

export const mockGetLeaveAuditLogs = (callerRole: UserRole): LeaveAuditLog[] => {
  if (callerRole === 'EMPLOYEE') {
    throw { errorCode: 'ERR-SEC-403', message: 'Access Denied.' };
  }
  return getStoredData<LeaveAuditLog>(KEYS.LEAVE_AUDIT);
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

export interface PayslipCalculationResult {
  month: number;
  year: number;
  baseWage: number;
  proratedWage: number;
  components: Array<{
    name: string;
    computationType: string;
    computationValue: number;
    computedAmount: number;
  }>;
  pfEmployee: number;
  pfEmployer: number;
  professionalTax: number;
  totalDeductions: number;
  netSalary: number;
  payableDays: number;
  workingDays: number;
}

export const mockCalculatePayslip = (
  salaryConfig: SalaryConfig,
  payableDays: number,
  totalWorkingDays: number
): PayslipCalculationResult => {
  if (totalWorkingDays === 0) {
    throw new Error('Total working days cannot be zero.');
  }

  const prorationRatio = payableDays / totalWorkingDays;
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
  const pt = payableDays > 0 ? salaryConfig.professionalTax : 0;

  const totalDeductions = pfEmployee + pt;
  const netSalary = proratedWage - totalDeductions;

  return {
    month: 0,
    year: 0,
    baseWage,
    proratedWage,
    components: proratedComponents,
    pfEmployee,
    pfEmployer,
    professionalTax: pt,
    totalDeductions,
    netSalary,
    payableDays,
    workingDays: totalWorkingDays
  };
};
