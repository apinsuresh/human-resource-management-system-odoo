# Odoo — Human Resource Management System

A full-featured, role-based HR Management System built with React, TypeScript, and Vite. Designed for enterprise-grade workforce management with rich UI/UX and zero backend dependency (localStorage mock DB).

---

## Features

### Multi-Role Access
| Role | Access |
|------|--------|
| **Admin** | Full platform control — organizations, users, roles, system config, audit logs |
| **HR Officer** | Employee management, attendance, payroll, leave approvals, reports |
| **Employee** | Self-service — time off requests, attendance history, payslips, profile |

### Modules
- **Dashboard** — Role-specific KPI cards and activity summaries
- **Employee Directory** — Add, edit, view and manage employee profiles
- **Attendance Management** — Daily check-in/check-out tracking, admin overview
- **Time Off / Leave Management** — Leave requests, approvals, allocations, leave type config, audit trail
- **Payroll & Salary** — Salary structures, payslips, salary audit logs
- **Settings** — Platform config, organizations, users, roles, RBAC, backup & security
- **Profile** — Personal info, bank details, documents, credential management

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite |
| Styling | Vanilla CSS (custom design system, glassmorphism, dark tokens) |
| State | React useState / useEffect |
| Storage | localStorage mock DB (no backend required) |
| Auth | Role-based mock auth with session management |

---

## Demo Credentials

Select a workspace on the login page — credentials autofill automatically.

| Workspace | Login ID | Password |
|-----------|----------|----------|
| **HR** | OIHRMS20260002 | HRPassword123 |
| **Admin** | OIADMI20260001 | AdminPassword123 |
| **Employee** | OIANRA20260003 | EmpPassword123 |

> **Tip:** If you see stale data, open the login page, click the shield icon at the bottom to reveal the Dev Toolbar, then click **Reset Local Database**.

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/apinsuresh/human-resource-management-system-odoo.git
cd human-resource-management-system-odoo

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:5173 in your browser.

### Build for Production

```bash
npm run build
```

---

## Project Structure

```
src/
├── assets/              # Static assets (Odoo logo, images)
├── components/          # Reusable UI components (Toast, Sidebar)
├── views/               # Page-level view components
│   ├── Login.tsx        # Two-panel auth page
│   ├── App.tsx          # Root layout, routing, RBAC
│   ├── AdminAttendanceView.tsx
│   ├── EmployeeAttendanceView.tsx
│   ├── AdminTimeOffView.tsx
│   ├── EmployeeTimeOffView.tsx
│   ├── PayrollView.tsx
│   ├── SettingsView.tsx
│   └── ...
├── mockApi.ts           # Full mock DB: auth, employees, leave, payroll, audit
└── index.css            # Global design system & component styles
public/
├── logo.png             # Odoo logo
└── favicon.png          # Browser favicon
```

---

## License

This project is for demonstration and educational purposes.
