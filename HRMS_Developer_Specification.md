# Human Resource Management System (HRMS) — Developer Specification

**Version:** 1.0
**Source:** Wireframe/UX spec — `Human_Resource_Management_System_-_8_hours.svg`
**Status:** Ready for implementation

> **Stack assumption:** This spec is backend/frontend-stack agnostic. API examples use REST + JSON. Substitute your project's actual framework conventions (route prefixes, auth middleware, ORM) — the contracts and business rules below do not change.

---

## 1. Overview / Purpose

The HRMS is a role-based web application for managing employee records, payroll configuration, attendance, and time-off. Three roles: **Admin**, **HR Officer**, **Employee**.

Four modules:
1. **Auth & Identity** — sign up/in, system-generated employee IDs, forced password reset
2. **Employee Profile** — personal, employment, bank, and document data
3. **Payroll / Salary Info** — wage configuration and auto-calculated salary components (Admin-only)
4. **Attendance & Time Off** — check-in/out tracking, leave requests, and approvals

Attendance data feeds payroll (unpaid/missing days reduce payable days), so Attendance and Payroll are not independent — implement in that dependency order.

---

## 2. Functional Requirements

### 2.1 Authentication & Identity

| ID | Requirement |
|---|---|
| FR-1.1 | Only Admin/HR Officer can create new employee accounts. Self-service public sign-up is **not** permitted for employee accounts. |
| FR-1.2 | On employee creation, the system auto-generates a **Login ID** in the format `[Company Prefix][First 2 letters of first name][First 2 letters of last name][Year of Joining][4-digit serial number for that year]`. Example: `OIJODO20220001` for an employee "Jo Do" joining Odoo India ("OI") in 2022, 1st hire that year. |
| FR-1.3 | The system auto-generates a temporary password on account creation and must force a password change on the employee's first successful login. |
| FR-1.4 | Employees log in with **Login ID or Email** + Password. |
| FR-1.5 | Serial number in the Login ID must be unique per company-prefix + year combination; collisions must increment the serial, never overwrite. |
| FR-1.6 | Password reset (self-service, post-first-login) must be available via a "Forgot Password" flow, independent of the forced first-login reset. |

### 2.2 Employee Profile

| ID | Requirement |
|---|---|
| FR-2.1 | Every employee has a profile with: Name, Mobile, Email, Department, Job Position, Manager, Company, Location, Date of Birth, Residing Address, Personal Email, Gender, Nationality, Marital Status. |
| FR-2.2 | Bank Details section: Account Number, Bank Name, IFSC Code. |
| FR-2.3 | Statutory identifiers: PAN No, UAN No, Emp Code, Date of Joining. |
| FR-2.4 | Free-text sections: About, "What I love about my job," "My interests and hobbies," Skills (tag list, addable), Certification, Resume (file upload). |
| FR-2.5 | Clicking an employee's own avatar opens a dropdown: **My Profile**, **Log Out**. |
| FR-2.6 | Clicking an employee card elsewhere in the system (e.g. directory) opens that employee's profile in **view-only** mode — no inline edit permitted from that entry point. |
| FR-2.7 | Employee directory cards display: profile picture, name, and a status indicator (see FR-4.5). |

### 2.3 Payroll / Salary Info (Admin-only)

| ID | Requirement |
|---|---|
| FR-3.1 | The Salary Info tab is visible **only** to Admin. Any non-admin request (UI route or API) must be rejected — see §6, ERR-SEC-01. |
| FR-3.2 | Wage Type supported at launch: **Fixed wage** (monthly or yearly, mutually derived — see FR-3.4). |
| FR-3.3 | Salary Components: Basic, House Rent Allowance (HRA), Standard Allowance, Performance Bonus, Leave Travel Allowance (LTA), Fixed Allowance. Each has a **Computation Type**: `FIXED_AMOUNT` or `PERCENTAGE_OF_WAGE` (or percentage of another component, e.g. HRA is % of Basic). |
| FR-3.4 | Default component formulas (configurable per company, not hardcoded — see §3 Technical Requirements): <br>• `Basic = 50% of Wage` <br>• `HRA = 50% of Basic` <br>• `Standard Allowance = fixed amount` (e.g. 4167/month) <br>• `Performance Bonus = 8.33% of Basic` <br>• `LTA = 8.33% of Basic` <br>• `Fixed Allowance = Wage − sum(all other components)` (balancing figure, computed last) |
| FR-3.5 | Sum of all components must never exceed the defined Wage. `Fixed Allowance` is the balancing term that absorbs the remainder — it must never go negative (see ERR-CALC-01). |
| FR-3.6 | Component values must auto-recalculate whenever the Wage amount changes. |
| FR-3.7 | Deductions: Provident Fund (PF) — 12% employee contribution, 12% employer contribution, both computed on Basic Salary. Professional Tax — fixed ₹200/month (configurable, not hardcoded per FR-3.4 rationale). |
| FR-3.8 | Worked example the implementation must reproduce exactly: Wage = ₹50,000/month → Basic = ₹25,000 → HRA = ₹12,500 → PF (employee) = ₹3,000 (12% of Basic) → PF (employer) = ₹3,000 → Professional Tax = ₹200. |

### 2.4 Attendance

| ID | Requirement |
|---|---|
| FR-4.1 | Employees check in/check out via a persistent systray control. System records timestamp on each action. |
| FR-4.2 | Employees see their **own** day-wise attendance for the current month by default (Check In, Check Out, Work Hours, Extra Hours), navigable by month (`<-` / `->` controls). |
| FR-4.3 | Admin/HR Officer see attendance for **all** employees for the current day by default, with a searchable list view and a count of days present. |
| FR-4.4 | `Work Hours = Check Out − Check In` (minus recorded break time). `Extra Hours = max(0, Work Hours − Standard Work Hours)`. Standard work hours and break time are configurable per company (fields: "No. of working days in a week," "Break Time"). |
| FR-4.5 | Status indicator logic (drives FR-2.7 card display): <br>🟢 **Present** — checked in today, no active leave. <br>✈️ **On Leave** — an approved Time Off request covers today's date. <br>🟡 **Absent** — no check-in recorded and no approved leave for today. |
| FR-4.6 | Attendance records are the system of record for payroll payable-days calculation (see FR-4.7). Do not allow retroactive edits without an audit trail (see §7 Security). |
| FR-4.7 | Payslip generation must compute `Payable Days = Total Working Days in period − Unpaid Leave Days − Unrecorded/Missing Attendance Days`. This is a hard dependency: payroll must query Attendance + Time Off before generating a payslip, not duplicate the calculation. |

### 2.5 Time Off

| ID | Requirement |
|---|---|
| FR-5.1 | Time Off Types: `PAID_TIME_OFF`, `SICK_LEAVE`, `UNPAID_LEAVE`. |
| FR-5.2 | Each employee has an **Allocation balance** per leave type (e.g. "24 Days Available" Paid, "7 Days Available" Sick), decremented as approved requests consume days. |
| FR-5.3 | Request form fields: Employee, Time Off Type, Validity Period (From/To dates), Allocation (days consumed — supports fractional, e.g. 0.5 for half-day), and optional Attachment (required for `SICK_LEAVE` requests exceeding a configurable threshold, e.g. > 2 consecutive days). |
| FR-5.4 | Employees can view and submit only their own requests. Admin/HR Officer can view all employees' requests and **Approve** or **Reject** each. |
| FR-5.5 | Approving a request that would exceed the employee's remaining allocation must be blocked at submission time (see ERR-VAL-03), not just flagged after approval. |
| FR-5.6 | An approved request must be immediately reflected in the FR-4.5 status indicator for the covered date range. |

---

## 3. Technical Requirements

- **Architecture:** REST API backend + SPA or server-rendered frontend (framework-agnostic; examples below assume REST/JSON).
- **Configuration, not hardcoding:** Statutory rates (PF %, Professional Tax amount), salary component formulas, company ID prefix, and standard work hours **must** live in a config/settings table, not literals in code — these vary by Indian state and change periodically (referenced in prior risk analysis for this project).
- **Timezone:** All attendance timestamps stored in UTC, rendered in company-configured local timezone.
- **Currency:** All monetary values stored as integer paise (or smallest currency unit) to avoid floating-point rounding errors in payroll math — critical given FR-3.5's exact-reconciliation requirement.
- **File uploads:** Resume and leave-attachment uploads restricted to PDF/JPG/PNG, max 5 MB, virus-scanned before storage.
- **Database:** Relational database recommended given the strong referential relationships between Employee, Attendance, TimeOff, and Payroll entities (see §5 Data Models).

---

## 4. API Specifications

All endpoints prefixed `/api/v1`. All require `Authorization: Bearer <token>` unless noted. All error responses follow the shape in §6.

### 4.1 Auth

```
POST /api/v1/auth/login
Body: { "identifier": "OIJODO20220001", "password": "string" }
200 → { "token": "jwt...", "mustResetPassword": boolean, "role": "ADMIN|HR_OFFICER|EMPLOYEE" }
401 → invalid credentials
```

```
POST /api/v1/auth/reset-password
Body: { "currentPassword": "string", "newPassword": "string" }
200 → { "success": true }
422 → password fails complexity policy (see §7)
```

### 4.2 Employees

```
POST /api/v1/employees                [Admin, HR Officer only]
Body: { "firstName", "lastName", "email", "department", "jobPosition",
        "managerId", "companyId", "dateOfJoining", ... }
201 → { "employeeId": "uuid", "loginId": "OIJODO20220001",
        "tempPassword": "string" }   // returned once; never retrievable again
```

```
GET  /api/v1/employees/{id}            [Self, or Admin/HR Officer]
200 → Employee object (see §5.1). Non-owner, non-admin caller → 403.
```

```
GET  /api/v1/employees/{id}?view=readonly   [Any authenticated user]
200 → Employee object with edit-disallowed fields stripped/flagged for UI enforcement
```

### 4.3 Salary Info (Admin-only — every route below requires Admin role)

```
GET  /api/v1/employees/{id}/salary
403 → caller is not Admin (ERR-SEC-01)
200 → SalaryConfig object (see §5.2)
```

```
PUT  /api/v1/employees/{id}/salary
Body: { "wageType": "FIXED", "wageAmount": 5000000, "wagePeriod": "MONTHLY" } // paise
200 → recalculated SalaryConfig, all components populated per FR-3.4
422 → component sum would exceed wage (ERR-CALC-01)
```

### 4.4 Attendance

```
POST /api/v1/attendance/check-in
200 → { "timestamp": "ISO8601" }
409 → already checked in today, no matching check-out (ERR-STATE-01)
```

```
POST /api/v1/attendance/check-out
200 → { "timestamp": "ISO8601", "workHours": number, "extraHours": number }
409 → no open check-in to close (ERR-STATE-02)
```

```
GET /api/v1/attendance?employeeId=&month=&year=     [Self, or Admin/HR Officer for any employee]
200 → Attendance[] for the period
```

### 4.5 Time Off

```
POST /api/v1/timeoff/requests
Body: { "type": "PAID_TIME_OFF|SICK_LEAVE|UNPAID_LEAVE",
        "startDate", "endDate", "allocationDays": number, "attachmentUrl"? }
201 → TimeOffRequest (status: PENDING)
422 → insufficient balance (ERR-VAL-03), or missing required attachment (ERR-VAL-04)
```

```
PATCH /api/v1/timeoff/requests/{id}          [Admin, HR Officer only]
Body: { "status": "APPROVED|REJECTED", "reviewerNote"? }
200 → updated TimeOffRequest
403 → non-admin caller
409 → request already reviewed (ERR-STATE-03)
```

---

## 5. Data Models

### 5.1 Employee
```
Employee {
  id: UUID
  loginId: string            // system-generated, unique, immutable
  firstName, lastName: string
  email: string (unique)
  personalEmail: string?
  mobile: string
  department: string
  jobPosition: string
  managerId: UUID?           // self-referential FK → Employee.id
  companyId: UUID
  location: string
  dateOfBirth: date
  dateOfJoining: date
  residingAddress: string
  gender: enum
  nationality: string
  maritalStatus: enum
  panNo: string?
  uanNo: string?
  empCode: string
  bankAccountNumber: string  // encrypted at rest
  bankName: string
  ifscCode: string
  resumeUrl: string?
  skills: string[]
  certifications: string[]
  role: enum(ADMIN, HR_OFFICER, EMPLOYEE)
  createdAt, updatedAt: timestamp
}
```

### 5.2 SalaryConfig
```
SalaryConfig {
  employeeId: UUID            // FK, 1:1
  wageType: enum(FIXED)
  wagePeriod: enum(MONTHLY, YEARLY)
  wageAmount: integer          // paise
  components: SalaryComponent[]
  pfEmployeeRate: decimal      // configurable, default 0.12
  pfEmployerRate: decimal      // configurable, default 0.12
  professionalTax: integer     // paise, configurable, default 20000 (₹200)
}

SalaryComponent {
  name: enum(BASIC, HRA, STANDARD_ALLOWANCE, PERFORMANCE_BONUS, LTA, FIXED_ALLOWANCE)
  computationType: enum(FIXED_AMOUNT, PERCENTAGE_OF_WAGE, PERCENTAGE_OF_COMPONENT)
  computationValue: decimal    // e.g. 50.0 for 50%, or a paise amount if FIXED_AMOUNT
  referenceComponent: enum?    // set when PERCENTAGE_OF_COMPONENT, e.g. HRA references BASIC
  computedAmount: integer      // paise, derived — recalculated on wage change
}
```

### 5.3 Attendance
```
Attendance {
  id: UUID
  employeeId: UUID
  date: date
  checkInAt: timestamp?
  checkOutAt: timestamp?
  workHours: decimal?          // derived
  extraHours: decimal?         // derived
  status: enum(PRESENT, ABSENT, ON_LEAVE)   // derived per FR-4.5
}
```

### 5.4 TimeOffRequest
```
TimeOffRequest {
  id: UUID
  employeeId: UUID
  type: enum(PAID_TIME_OFF, SICK_LEAVE, UNPAID_LEAVE)
  startDate, endDate: date
  allocationDays: decimal
  attachmentUrl: string?
  status: enum(PENDING, APPROVED, REJECTED)
  reviewerId: UUID?
  reviewerNote: string?
  createdAt, reviewedAt: timestamp?
}

TimeOffBalance {
  employeeId: UUID
  type: enum(PAID_TIME_OFF, SICK_LEAVE)   // unpaid leave has no balance cap
  allocatedDays: decimal
  usedDays: decimal
  remainingDays: decimal   // derived
}
```

---

## 6. Error Scenarios & Handling

Standard error envelope for all endpoints:
```
{ "errorCode": "ERR-XXX-NN", "message": "human-readable string", "field": "optional field name" }
```

| Code | Scenario | HTTP Status | Handling |
|---|---|---|---|
| ERR-SEC-01 | Non-admin requests Salary Info | 403 | Reject before touching salary data; log access attempt |
| ERR-CALC-01 | Sum of salary components would exceed wage | 422 | Reject write; return the overage amount in the error message |
| ERR-VAL-01 | Missing required profile field on creation | 422 | Return list of missing fields |
| ERR-VAL-02 | Duplicate email on employee creation | 409 | Return conflicting field |
| ERR-VAL-03 | Time-off request exceeds remaining balance | 422 | Return `remainingDays` vs `requestedDays` in message |
| ERR-VAL-04 | Sick leave > threshold without attachment | 422 | Return required-attachment flag |
| ERR-STATE-01 | Check-in with no matching prior check-out | 409 | Instruct client to check out first |
| ERR-STATE-02 | Check-out with no open check-in | 409 | No-op guidance to client |
| ERR-STATE-03 | Approve/reject an already-reviewed request | 409 | Return current status |
| ERR-AUTH-01 | Invalid credentials | 401 | Generic message — do not reveal whether ID or password was wrong |
| ERR-AUTH-02 | Login attempted before mandatory password reset is bypassed | 403 | Force redirect to reset flow |

**Payroll-specific rule:** Any error during payslip generation (missing attendance data, unresolved time-off requests for the period) must **block** payslip generation entirely rather than generating a partial/best-guess payslip. Silent partial payroll is a higher-cost failure than a delayed payslip.

---

## 7. Security Requirements

- Bank account number, PAN, UAN encrypted at rest (field-level encryption, not just disk encryption).
- Salary Info endpoints: Admin-role check enforced server-side on every request — never trust a client-side role flag.
- Temp passwords: minimum 12 characters, cryptographically random, single-use (invalidated after first successful login), and never logged in plaintext anywhere (app logs, error logs, analytics).
- Password policy: minimum 10 characters, must include upper/lower/digit; enforced both on temp-password generation and on user-chosen resets.
- All Time Off attachments (e.g. sick certificates) are sensitive medical-adjacent documents — restrict access to the employee, their approver, and Admin only.
- Rate-limit login and password-reset endpoints to mitigate brute force.
- Audit log required for: salary config changes, attendance record edits (especially retroactive), and time-off approve/reject actions — each entry records actor, timestamp, before/after values.

---

## 8. Performance Considerations

- Employee directory (FR-2.7) status indicators should be computed from a materialized/cached daily attendance+leave view, not recalculated per-request from raw attendance history — this view is read-heavy (loaded on every directory page view).
- Salary component recalculation (FR-3.6) is O(number of components) — cheap; no special optimization needed, but must be atomic (all components recalculate together, never partially updated).
- Attendance list queries (FR-4.3, "all employees for current day") should be indexed on `(date, companyId)` given this is the Admin's default daily view.
- Payslip generation (FR-4.7) touches Attendance + TimeOff + SalaryConfig — batch this per pay-run rather than per-employee-on-demand if company size exceeds ~200 employees.

---

## 9. Acceptance Criteria

Given/When/Then format, one per major feature:

**AC-1 — Login ID generation**
> Given an Admin creates an employee "Jo Do" joining company "Odoo India" (prefix `OI`) in 2022, as the first hire that year,
> When the employee record is saved,
> Then the system generates Login ID `OIJODO20220001` and a single-use temporary password, and the employee cannot log in with the temp password a second time after first use.

**AC-2 — Salary component reconciliation**
> Given Wage = ₹50,000/month with default component formulas,
> When the Salary Info is saved,
> Then Basic = ₹25,000, HRA = ₹12,500, PF (employee) = ₹3,000, PF (employer) = ₹3,000, Professional Tax = ₹200, and the sum of all components equals exactly ₹50,000.

**AC-3 — Component sum guard**
> Given a Salary Info edit where manually-adjusted components would sum to more than the Wage,
> When the Admin attempts to save,
> Then the save is rejected with ERR-CALC-01 and no partial write occurs.

**AC-4 — Attendance-driven payroll**
> Given an employee has 2 unpaid leave days in a 22-working-day month,
> When the payslip is generated for that month,
> Then Payable Days = 20, and payroll amount is prorated accordingly.

**AC-5 — Salary Info access control**
> Given a logged-in user with role `EMPLOYEE`,
> When they call `GET /api/v1/employees/{id}/salary` for any employee including themselves,
> Then the API returns 403 ERR-SEC-01.

**AC-6 — Time off balance enforcement**
> Given an employee has 3 remaining Sick Leave days,
> When they submit a Sick Leave request for 5 days,
> Then the request is rejected at submission (422 ERR-VAL-03), not silently created and rejected later at approval.

**AC-7 — Status indicator accuracy**
> Given an employee has an approved Paid Time Off request covering today,
> When any user views the employee directory,
> Then that employee's card shows the ✈️ On Leave indicator, not 🟢 Present or 🟡 Absent — even if they also have a check-in recorded (leave takes precedence).

---

## 10. Example Use Cases

| # | Actor | Use Case | Expected Result |
|---|---|---|---|
| 1 | HR Officer | Creates a new employee "Anita Rao," joining 15-Mar-2026, 3rd hire that year at "OI" | Login ID `OIANRA20260003` generated; temp password issued; account flagged `mustResetPassword: true` |
| 2 | Employee | Logs in for the first time with temp password | Redirected to forced password-reset screen before reaching dashboard |
| 3 | Admin | Sets Anita's Wage to ₹60,000/month | All components recalculate: Basic ₹30,000, HRA ₹15,000, PF (each side) ₹3,600, etc., summing exactly to ₹60,000 |
| 4 | Employee | Checks in at 09:05, checks out at 18:10, with a 1-hour recorded break | Work Hours = 8h05m; Extra Hours = 0 (assuming 8h standard day, since 8h05m − 1h break = 7h05m... system should use the company's configured standard/break values — verify against FR-4.4) |
| 5 | Employee | Requests 2 days Sick Leave, no attachment (under the configurable threshold) | Request created as `PENDING`, no attachment required |
| 6 | Employee | Requests 5 days Sick Leave with no attachment | Rejected — ERR-VAL-04, attachment required above threshold |
| 7 | HR Officer | Approves a Paid Time Off request | Request status → `APPROVED`; employee's allocation balance decrements; directory status indicator updates for the covered dates |
| 8 | Employee (non-admin) | Attempts to view a colleague's Salary Info via direct API call | 403 ERR-SEC-01; attempt logged |

---

## 11. Open Items Requiring Product Decision Before Implementation

- Exact statutory rates/thresholds by Indian state (PF, PT, ESI) — needed to populate default config values correctly per deployment region.
- Whether Wage Type will expand beyond `FIXED` in a future version (e.g. hourly) — affects whether `wageType` should be built as an extensible enum now.
- Exact attachment-required threshold for Sick Leave (used 2+ consecutive days as a placeholder in FR-5.3/ERR-VAL-04 — confirm with HR policy).
- Retention policy for attendance/payroll audit logs (compliance-driven, not an engineering decision).
