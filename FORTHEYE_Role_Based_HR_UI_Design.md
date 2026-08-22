---
author: FORTHEYE Product & Engineering Team
date: 2026-08-22
status: Production Design Specification
title: FORTHEYE Role-Based HR Management UI Design Specification
version: 1.0.0
---

# FORTHEYE Role-Based HR Management UI Design Specification

## Table of Contents

1.  [Introduction](#1-introduction)
2.  [Design Objectives](#2-design-objectives)
3.  [HR Personnel UI --- Operations
    Workspace](#3-hr-personnel-ui--operations-workspace)
4.  [System Administrator UI --- Control
    Center](#4-system-administrator-ui--control-center)
5.  [Employer and Leadership UI --- Executive
    Intelligence](#5-employer-and-leadership-ui--executive-intelligence)
6.  [Shared FORTHEYE Design System](#6-shared-fortheye-design-system)
7.  [Role Differentiation](#7-role-differentiation)
8.  [Responsive Design](#8-responsive-design)
9.  [Accessibility](#9-accessibility)
10. [Performance](#10-performance)
11. [Role-Based Mental Models](#11-role-based-mental-models)
12. [Implementation Guidelines](#12-implementation-guidelines)
13. [Final Design Direction](#13-final-design-direction)

------------------------------------------------------------------------

# 1. Introduction

This document defines three distinct but visually connected user
interface concepts for the FORTHEYE HR management platform. Each concept
is designed around a different user role and mental model: HR personnel
require an operational workspace focused on daily employee-management
tasks; system administrators require a secure control center focused on
configuration, permissions, monitoring, and maintenance; and employers
or company leadership require an executive intelligence workspace
focused on workforce KPIs, financial visibility, strategic planning,
trends, forecasting, and organizational performance.

The three experiences should not be treated as the same dashboard with
different menu items. Each role requires a fundamentally different
information architecture, content hierarchy, interaction model, and
level of information density. However, all three must remain
recognizable as part of the same FORTHEYE product through a shared
design system, typography, color language, spacing, iconography,
accessibility standards, and interaction patterns.

------------------------------------------------------------------------

# 2. Design Objectives

The FORTHEYE role-based UI system must:

-   Provide role-specific workflows without duplicating the overall
    product.
-   Prioritize the information users need most frequently.
-   Reduce unnecessary navigation and interaction steps.
-   Maintain a consistent FORTHEYE visual identity.
-   Support desktop, tablet, and mobile experiences.
-   Follow WCAG 2.1 Level AA accessibility requirements.
-   Use responsive, mobile-first layouts.
-   Favor reusable components and established design-system patterns.
-   Provide clear loading, empty, success, error, and disabled states.
-   Clearly distinguish actual data from forecasts and recommendations.
-   Maintain high performance as employee, transaction, and analytics
    data grows.

------------------------------------------------------------------------

# 3. HR Personnel UI --- Operations Workspace

## 3.1 Primary Goal

The HR workspace should help HR personnel complete daily operational
work quickly, including recruitment, employee onboarding, leave
approvals, performance reviews, employee search, and deadline
management.

## 3.2 Mental Model

> **What needs my attention today?**

The interface should prioritize tasks, approvals, deadlines, employees,
and high-frequency actions.

## 3.3 Primary Navigation

``` text
FORTHEYE

Dashboard
├── Overview
├── My Tasks
└── Calendar

People
├── Employees
├── Departments
├── Directory
└── Organizational Chart

Recruitment
├── Candidates
├── Pipeline
├── Interviews
└── Job Openings

Onboarding
├── New Joiners
├── Checklists
└── Documents

Leave & Attendance
├── Leave Requests
├── Attendance
└── Holidays

Performance
├── Reviews
├── Goals
└── Feedback

Reports
└── HR Reports
```

## 3.4 Dashboard Information Architecture

``` text
┌─────────────────────────────────────────────────────────────┐
│ FORTHEYE       Search employees...     Notifications  HR    │
├────────────┬────────────────────────────────────────────────┤
│            │ Good Morning, HR Team                          │
│ Dashboard  │ Here's what needs your attention today.        │
│            │                                                 │
│ People     │ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐   │
│            │ │12      │ │8       │ │5       │ │3       │   │
│ Recruitment│ │Leave   │ │Onboard │ │Reviews │ │Interv. │   │
│            │ │Pending │ │Today   │ │Due     │ │Today   │   │
│ Onboarding │ └────────┘ └────────┘ └────────┘ └────────┘   │
│            │                                                 │
│ Leave      │ ┌────────────────────┐ ┌─────────────────────┐ │
│            │ │ Leave Approvals    │ │ Onboarding          │ │
│ Performance│ │                    │ │                     │ │
│            │ │ Employee  Pending  │ │ Anita       80%     │ │
│ Reports    │ │ Employee  Pending  │ │ Rahul       55%     │ │
│            │ │ Employee  Pending  │ │ Maria       30%     │ │
│            │ │ [View All]         │ │ [View Checklist]    │ │
│            │ └────────────────────┘ └─────────────────────┘ │
│            │                                                 │
│            │ ┌────────────────────────────────────────────┐ │
│            │ │ Recruitment Pipeline                       │ │
│            │ │ Applied → Screening → Interview → Offer   │ │
│            │ │   42         18          9          4       │ │
│            │ └────────────────────────────────────────────┘ │
└────────────┴────────────────────────────────────────────────┘
```

## 3.5 Quick Actions

High-frequency actions should be available directly from the dashboard:

-   Add Employee
-   Create Job Opening
-   Start Onboarding
-   Approve Leave
-   Schedule Performance Review
-   Search Employee

Primary actions should use a strong FORTHEYE blue/indigo treatment while
secondary actions remain visually lighter.

## 3.6 Employee Search

Employee search should be a prominent global capability.

``` text
┌─────────────────────────────────────────────────────┐
│ Search employees, ID, department, email...           │
└─────────────────────────────────────────────────────┘

Results

SY  System Admin
    IT Administrator • Operations

AN  Anita Rao
    Software Engineer • Engineering

RK  Rahul Kumar
    Product Manager • Product
```

Search should support employee name, employee ID, department, email,
role, and other relevant indexed fields.

## 3.7 Notification Center

Notifications should emphasize actionability and urgency.

``` text
TODAY

Critical
4 Leave approvals pending
Due today

Warning
3 Performance reviews approaching
Due within 3 days

Information
2 Employees joining tomorrow

Calendar
Interview scheduled at 3:00 PM
```

Every actionable notification should provide an obvious route to the
relevant task.

## 3.8 HR Visual Design

Use a bright white-glass foundation with energetic blue accents.

``` text
Background:       #F7F9FC
Surface:           #FFFFFF / translucent white
Primary:           #2563EB
Success:           #16A34A
Warning:           #F59E0B
Critical:          #DC2626
Primary Text:      #172033
Secondary Text:    #64748B
```

### Rationale

HR personnel perform frequent actions and scan large amounts of employee
information. The interface should therefore emphasize:

-   Clear action hierarchy
-   Strong status indicators
-   Fast scanning
-   Compact but readable information density
-   Prominent primary actions

------------------------------------------------------------------------

# 4. System Administrator UI --- Control Center

## 4.1 Primary Goal

The administrator workspace provides control over system configuration,
security, permissions, integrations, backups, monitoring, and
maintenance.

## 4.2 Mental Model

> **Is the system secure, configured correctly, and operating
> normally?**

The design should feel more precise and technical than the HR workspace.

## 4.3 Primary Navigation

``` text
FORTHEYE ADMIN

Overview

Organization
├── Company Settings
├── Departments
├── Locations
└── Policies

Identity & Access
├── Users
├── Roles
├── Permissions
├── Sessions
└── Authentication

Security
├── Security Center
├── Audit Logs
├── Login Activity
└── Security Policies

System
├── System Health
├── Performance
├── Storage
└── Background Jobs

Integrations
├── Integrations
├── API Keys
├── Webhooks
└── Connected Services

Data
├── Backup
├── Restore
├── Export
└── Data Retention

Maintenance
├── System Updates
├── Logs
└── Maintenance Mode
```

## 4.4 Administrator Dashboard

``` text
┌──────────────────────────────────────────────────────────────┐
│ ADMIN CONTROL CENTER                    Search   Alerts Admin │
├────────────┬─────────────────────────────────────────────────┤
│            │ System Overview                                 │
│ Overview   │                                                 │
│            │ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│ Users      │ │ 128      │ │ 99.98%   │ │ 2.45 GB  │         │
│            │ │ Users    │ │ Uptime   │ │ Storage  │         │
│ Security   │ └──────────┘ └──────────┘ └──────────┘         │
│            │                                                 │
│ System     │ ┌──────────────────────┐ ┌────────────────────┐ │
│            │ │ System Health        │ │ Security            │ │
│ Integrations│ │ API       Healthy   │ │ Risk Score     92  │ │
│            │ │ Database  Healthy   │ │ Failed Login    3  │ │
│ Data       │ │ Storage   Healthy   │ │ Alerts          1  │ │
│            │ │ Queue     Healthy   │ │                    │ │
│ Maintenance│ └──────────────────────┘ └────────────────────┘ │
│            │                                                 │
│            │ ┌─────────────────────────────────────────────┐ │
│            │ │ Recent Administrative Activity              │ │
│            │ │ Role modified       Admin       10:42 AM   │ │
│            │ │ User created        Admin       09:30 AM   │ │
│            │ │ Backup completed    System      08:00 AM   │ │
│            │ └─────────────────────────────────────────────┘ │
└────────────┴─────────────────────────────────────────────────┘
```

## 4.5 User and Permission Management

The user management screen should support search, filtering, role
assignment, permission review, status management, and secure
confirmation for sensitive changes.

``` text
Users

┌───────────────────────────────────────────────────────────────┐
│ Search users...    Role ▼    Status ▼            + Add User   │
├───────────────────────────────────────────────────────────────┤
│ User          Role             Status          Last Login      │
│ Sarah         HR Manager       Active          10:32 AM       │
│ John          Employee         Active          09:45 AM       │
│ Alex          Administrator    Active          08:22 AM       │
└───────────────────────────────────────────────────────────────┘
```

Permission editor:

``` text
User Permissions

Role
[ HR Manager ▼ ]

People
☑ View employees
☑ Edit employees
☑ Create employees

Leave
☑ View requests
☑ Approve requests
☐ Delete requests

Payroll
☑ View payroll
☐ Edit payroll
☐ Approve payroll

[ Save Changes ]
```

High-risk permissions should display an explicit warning and require
confirmation.

## 4.6 Security Center

``` text
SECURITY SCORE

92 / 100

██████████████████░░

Authentication       Secure
Permissions          Secure
API Keys             Review Required
Backups              Healthy
Failed Logins        3
```

Security tools should include:

-   MFA status
-   Failed login attempts
-   Active sessions
-   Password policies
-   API key activity
-   Suspicious activity
-   Audit logs
-   Security configuration

## 4.7 Backup and Maintenance

``` text
DATA BACKUP

Last Backup
Today, 02:00 AM

Status
Successful

Next Backup
Tomorrow, 02:00 AM

[ Backup Now ]

[ Configure Schedule ]
```

Restore, delete, and maintenance operations should use explicit
confirmation flows and clear warnings.

## 4.8 Administrator Visual Design

Use a neutral, technical palette:

``` text
Primary:       #2563EB
Security:      #4F46E5
Healthy:       #16A34A
Warning:       #F59E0B
Critical:      #DC2626
Neutral:       #64748B
```

### Rationale

Administrators need precision and confidence. The interface should
emphasize:

-   System state
-   Security
-   Logs
-   Configuration
-   Permissions
-   Alerts
-   Technical metrics

Decorative visual effects should remain restrained.

------------------------------------------------------------------------

# 5. Employer and Leadership UI --- Executive Intelligence

## 5.1 Primary Goal

The executive workspace provides high-level insight into workforce
performance, growth, costs, headcount, organizational structure,
strategic goals, and future trends.

## 5.2 Mental Model

> **What is happening across the organization, and where are we
> heading?**

This interface should prioritize analysis and decisions rather than
operational tasks.

## 5.3 Primary Navigation

``` text
FORTHEYE EXECUTIVE

Executive Overview

Workforce
├── Headcount
├── Workforce Planning
├── Organization
└── Talent

Financial
├── Payroll Cost
├── Cost Centers
├── Compensation
└── Budget

Performance
├── Company Goals
├── Team Performance
└── Productivity

Analytics
├── Workforce Analytics
├── Trends
├── Forecasts
└── Reports

Strategy
├── Initiatives
├── Objectives
└── Progress

Reports
└── Executive Reports
```

## 5.4 Executive Dashboard

``` text
┌──────────────────────────────────────────────────────────────┐
│ EXECUTIVE OVERVIEW                     Q3 2026 ▼       CEO    │
├────────────┬─────────────────────────────────────────────────┤
│            │ Good Morning                                    │
│ Overview   │ Here's your workforce at a glance.             │
│            │                                                 │
│ Workforce  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌────────┐│
│            │ │ 1,248   │ │ +8.4%   │ │ 92%     │ │ 4.2%   ││
│ Financial  │ │Headcount│ │Growth   │ │Engagement│ │Turnover││
│            │ └─────────┘ └─────────┘ └─────────┘ └────────┘│
│ Performance│                                                 │
│            │ ┌──────────────────────────┐ ┌────────────────┐│
│ Analytics  │ │ Workforce Growth         │ │ Payroll Cost   ││
│            │ │                          │ │                ││
│ Strategy   │ │      Growth Trend        │ │ ₹42.5M         ││
│            │ │      Actual + Forecast   │ │ ↑ 6.2%         ││
│ Reports    │ └──────────────────────────┘ └────────────────┘│
│            │                                                 │
│            │ ┌─────────────────────┐ ┌─────────────────────┐│
│            │ │ Headcount by Dept   │ │ Strategic Goals     ││
│            │ │ Engineering  420    │ │ Revenue Growth 78% ││
│            │ │ Sales        280    │ │ Hiring Plan    64% ││
│            │ │ HR            80    │ │ Retention      91% ││
│            │ └─────────────────────┘ └─────────────────────┘│
└────────────┴─────────────────────────────────────────────────┘
```

## 5.5 Executive KPI System

Primary KPIs should immediately communicate organizational health.

``` text
Total Headcount
1,248
+8.4%

Employee Turnover
4.2%
-1.1%

Payroll Cost
₹42.5M
+6.2%

Employee Engagement
92%
+3.4%
```

Additional KPIs can include:

-   Hiring velocity
-   Open positions
-   Revenue per employee
-   Absence rate
-   Training completion
-   Goal completion
-   Workforce growth
-   Cost per employee
-   Budget variance

Only show metrics that are meaningful to the user's organization and
available from reliable data.

## 5.6 Workforce Planning

Provide interactive workforce planning.

``` text
WORKFORCE PLAN — 2026

Department       Current   Planned   Variance

Engineering       420       480       +60
Sales             280       320       +40
Operations        190       210       +20
HR                 80        90       +10
Finance            65        70        +5
```

Include:

-   Current headcount
-   Planned headcount
-   Hiring requirements
-   Budget impact
-   Hiring timeline
-   Department-level variance

## 5.7 Organizational Chart

Provide an interactive organization visualization.

``` text
                     CEO
                      │
        ┌─────────────┼─────────────┐
        │             │             │
       CTO           CFO           COO
        │             │             │
   Engineering     Finance       Operations
        │
   ┌────┼────┐
   │    │    │
  Web  AI   Data
```

The organizational chart should support:

-   Search
-   Zoom
-   Expand/collapse
-   Department filtering
-   Headcount visibility
-   Employee profile access

## 5.8 Strategic Analytics

Leadership should receive trends and insights rather than raw tables.

Example:

``` text
Workforce Growth

2024 ───── 890
2025 ───────── 1,120
2026 ───────────── 1,248
2027 ───────────────── 1,420 projected
```

Predictive insights:

``` text
Hiring Demand
Engineering demand expected to increase
18% over the next 6 months.

Retention
Employee retention is improving.

Budget Risk
Operations cost is projected to exceed
budget by 4.8% in Q4.
```

Actual values, forecasts, and recommendations must be visually and
textually distinguishable.

Predictions must never be presented as confirmed facts.

## 5.9 Strategic Goal Tracking

``` text
COMPANY INITIATIVES

Revenue Growth
████████████████░░░░ 78%

Global Expansion
███████████░░░░░░░░░ 56%

Hiring Plan
█████████████░░░░░░░ 64%

Employee Retention
██████████████████░░ 91%
```

Goal details should include:

-   Owner
-   Deadline
-   Progress
-   Departments involved
-   Milestones
-   Risks
-   Recent activity

## 5.10 Leadership Visual Design

Use a premium executive palette:

``` text
Primary Blue:      #2563EB
Executive Indigo:  #4F46E5
Growth Green:      #16A34A
Warning:           #F59E0B
Critical:          #DC2626
Background:        #F8FAFC
Text:              #111827
```

### Rationale

Leadership needs:

-   High information hierarchy
-   Large KPIs
-   Trend visualization
-   Forecasts
-   Strategic summaries
-   Financial visibility
-   Minimal operational noise

------------------------------------------------------------------------

# 6. Shared FORTHEYE Design System

The three experiences should feel like one product.

## 6.1 Shared Typography

Use the existing application font if one exists. Otherwise use a modern
interface font such as:

-   Inter
-   Geist
-   Manrope
-   Plus Jakarta Sans

Maintain a consistent type scale across all roles.

## 6.2 Shared Color Language

The core brand should remain:

-   White
-   Blue
-   Indigo
-   Soft gray
-   Semantic green
-   Semantic amber
-   Semantic red

Role-specific accents may vary in intensity, but they should remain
within the same design system.

## 6.3 Shared Components

Reuse common components for:

-   Buttons
-   Cards
-   Inputs
-   Selects
-   Tables
-   Tabs
-   Dialogs
-   Drawers
-   Toasts
-   Badges
-   Tooltips
-   Avatars
-   Navigation
-   KPI cards
-   Progress indicators

## 6.4 Shared Visual Language

All interfaces should use:

-   Light backgrounds
-   Subtle glass surfaces
-   12--20px card radius
-   Soft borders
-   Restrained shadows
-   Consistent 8px spacing units
-   Consistent iconography
-   Consistent button styles
-   Consistent form controls

Avoid making each role look like a completely different product.

------------------------------------------------------------------------

# 7. Role Differentiation

  -----------------------------------------------------------------------
  Area              HR Personnel      Administrator     Employer /
                                                        Leadership
  ----------------- ----------------- ----------------- -----------------
  Primary Goal      Execute tasks     Control system    Make decisions

  Main Question     What needs        Is everything     Where are we
                    attention?        secure?           going?

  Density           High              High              Medium

  Main UI           Task dashboard    Control center    Executive
                                                        dashboard

  Primary Data      Employees and     System and        KPIs and
                    tasks             security          analytics

  Navigation        Operational       Technical         Strategic

  Charts            Moderate          System metrics    Extensive

  Alerts            Approvals and     Security and      Strategic risks
                    deadlines         system            

  Main Action       Approve / manage  Configure /       Analyze / decide
                                      secure            

  Visual Tone       Energetic         Precise           Premium

  Information       Tasks first       System state      KPIs first
  Hierarchy                           first             
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 8. Responsive Design

All three experiences must be mobile-first and responsive.

## 8.1 HR Mobile

Prioritize:

``` text
Tasks
Approvals
Employee Search
Notifications
Calendar
```

Use a compact drawer or bottom navigation where appropriate.

## 8.2 Administrator Mobile

Prioritize:

``` text
Alerts
System Health
Security
Users
Emergency Controls
```

Technical tables should become cards or horizontally scrollable data
regions rather than forcing the entire page to overflow.

## 8.3 Leadership Mobile

Prioritize:

``` text
KPIs
Trends
Alerts
Goals
Executive Insights
```

Charts should simplify or become horizontally scrollable rather than
becoming unreadable.

------------------------------------------------------------------------

# 9. Accessibility

All three interfaces must target **WCAG 2.1 Level AA**.

Required considerations:

-   Semantic HTML
-   Keyboard navigation
-   Visible focus states
-   Minimum 44×44px touch targets
-   Accessible labels
-   Screen-reader-compatible components
-   Sufficient contrast
-   No color-only status indicators
-   Accessible charts with text summaries
-   Accessible tables
-   Accessible dialogs
-   Reduced-motion support
-   Logical heading hierarchy
-   Form error identification and recovery

Charts and analytics must provide accessible text summaries where visual
information is essential.

For example:

``` text
Engineering
42% of workforce

Sales
28% of workforce

Operations
19% of workforce
```

------------------------------------------------------------------------

# 10. Performance

The role-based interfaces should remain fast even as the dataset grows.

Use:

-   Lazy-loaded charts
-   Virtualized employee tables where appropriate
-   Pagination
-   Memoized expensive calculations
-   Optimized icons
-   Responsive images
-   Code splitting
-   Efficient API requests
-   Caching where appropriate

Do not load every analytics component during initial page rendering.

For example, forecasting and advanced analytics may load when the user
opens those sections.

Performance decisions should be based on actual bottlenecks rather than
premature optimization.

------------------------------------------------------------------------

# 11. Role-Based Mental Models

The most important distinction is how information is organized.

## 11.1 HR

> **TASK → ACTION → COMPLETION**

``` text
Pending Leave
      ↓
Review Employee
      ↓
Approve
      ↓
Completed
```

## 11.2 Administrator

> **MONITOR → CONFIGURE → SECURE**

``` text
System Health
      ↓
Identify Issue
      ↓
Configure / Fix
      ↓
Verify
```

## 11.3 Leadership

> **OBSERVE → ANALYZE → DECIDE**

``` text
KPI
 ↓
Trend
 ↓
Insight
 ↓
Strategic Decision
```

The UI architecture should reinforce these mental models.

------------------------------------------------------------------------

# 12. Implementation Guidelines

## 12.1 Codebase-First Approach

Before implementing the designs:

1.  Inspect the existing FORTHEYE repository.
2.  Identify the framework and language.
3.  Identify the current component library.
4.  Identify the styling system.
5.  Identify existing design tokens.
6.  Identify existing layouts and navigation.
7.  Identify authentication and authorization logic.
8.  Identify employee, attendance, leave, payroll, and reporting data
    sources.
9.  Identify reusable components.
10. Identify responsive breakpoints.
11. Identify existing accessibility patterns.
12. Identify current performance constraints.

The existing codebase must be treated as the source of truth.

## 12.2 Reuse Before Rebuilding

Prefer:

-   Existing components
-   Existing design tokens
-   Existing API services
-   Existing state management
-   Existing validation
-   Existing authentication
-   Existing icon libraries

Do not introduce duplicate systems without a strong reason.

## 12.3 Role-Based Access

UI visibility must follow actual authorization.

Do not rely only on hiding navigation items.

Sensitive routes and APIs must enforce permissions independently.

Examples:

-   HR users should not automatically gain system-administrator
    permissions.
-   Administrators should have controlled access to sensitive
    configuration.
-   Leadership dashboards should expose only authorized organizational
    and financial information.

## 12.4 Loading and Error States

Every major screen should support:

-   Loading
-   Empty
-   Error
-   Success
-   Disabled
-   Permission denied
-   No data

Do not leave large blank regions when data is loading.

Use skeleton states where they improve perceived performance.

## 12.5 Data Integrity

Executive analytics must distinguish:

``` text
Actual
Forecast
Target
Variance
Recommendation
```

Do not visually imply that a forecast is an actual result.

------------------------------------------------------------------------

# 13. Final Design Direction

FORTHEYE should be implemented as one unified HR platform with three
specialized workspaces.

### HR Personnel

Use a **clean operational workspace** focused on:

-   Tasks
-   Approvals
-   Employees
-   Recruitment
-   Onboarding
-   Performance
-   Deadlines

### System Administrator

Use a **precise control center** focused on:

-   Security
-   Users
-   Permissions
-   Configuration
-   System health
-   Integrations
-   Backups
-   Audit logs
-   Maintenance

### Employer / Leadership

Use a **premium executive intelligence workspace** focused on:

-   KPIs
-   Workforce analytics
-   Financial metrics
-   Headcount planning
-   Organizational structure
-   Trends
-   Forecasts
-   Strategic goals
-   Company initiatives

The most important principle is:

> **Do not simply change the sidebar for each role. Change the
> information architecture, content hierarchy, and workflow according to
> the user's responsibilities while keeping the FORTHEYE design system
> consistent.**

The final product should feel like three specialized workspaces inside
one coherent enterprise platform:

``` text
                 FORTHEYE
                    │
        ┌───────────┼───────────┐
        │           │           │
       HR          ADMIN     LEADERSHIP
        │           │           │
      TASKS       CONTROL     INSIGHT
        │           │           │
     ACTION      SECURITY     STRATEGY
        │           │           │
   COMPLETION    SYSTEM       DECISION
```

This approach provides role-appropriate experiences without fragmenting
the product's brand, component system, accessibility standards, or
engineering architecture.


---

# 3A. Role-Based Login and Authentication

FORTHEYE must provide **three distinct login options** so that each user enters the workspace appropriate to their authorized role.

## 3A.1 Login Options

The login screen should clearly present three role options:

```text
┌──────────────────────────────────────────────────────────────┐
│                         FORTHEYE                             │
│                  Sign in to your workspace                  │
│                                                              │
│  Choose your account type                                    │
│                                                              │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐  │
│  │    HR          │ │ Administrator  │ │   Employer     │  │
│  │                │ │                │ │  / Leadership  │  │
│  │ HR Operations  │ │ System Control │ │ Executive View  │  │
│  │                │ │                │ │                │  │
│  │ [ Continue ]   │ │ [ Continue ]   │ │ [ Continue ]   │  │
│  └────────────────┘ └────────────────┘ └────────────────┘  │
│                                                              │
│              Email / Employee ID                             │
│              Password                                        │
│              [ Sign In ]                                     │
└──────────────────────────────────────────────────────────────┘
```

The three options are:

1. **HR Personnel**
2. **System Administrator**
3. **Employer / Leadership**

Use clear icons and descriptions so users understand which workspace they are entering.

## 3A.2 Authentication Flow

The role selected at login must be validated against the user's actual authorization.

```text
                    LOGIN
                      │
                      ▼
             Select Account Type
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
       HR           ADMIN       EMPLOYER
        │             │             │
        ▼             ▼             ▼
   Authenticate   Authenticate   Authenticate
        │             │             │
        ▼             ▼             ▼
   Verify HR      Verify Admin   Verify Leadership
   Permission     Permission     Permission
        │             │             │
        ▼             ▼             ▼
   HR Workspace   Admin Center   Executive Workspace
```

### Critical Security Requirement

The role selector is **not** an authorization mechanism.

A user must never gain access simply by selecting another role on the login screen.

The backend/authentication layer must verify the user's actual role and permissions.

For example:

```text
User selects: Administrator
        ↓
Credentials validated
        ↓
Backend checks role
        ↓
User role = HR
        ↓
Administrator access denied
        ↓
Show:
"You do not have permission to access
the Administrator workspace."
```

## 3A.3 Role-Based Redirect

After successful authentication:

| Authenticated Role | Destination | Workspace |
|---|---|---|
| HR | `/hr` or existing HR route | HR Operations Workspace |
| Administrator | `/admin` or existing admin route | System Control Center |
| Employer / Leadership | `/executive` or existing leadership route | Executive Intelligence |

Use the project's existing routing conventions instead of introducing duplicate routing systems.

Example:

```text
Login
  ↓
Authenticate
  ↓
Fetch authenticated user
  ↓
Read authorized role
  ↓
┌──────────────────────────────────────┐
│ role = HR                            │ → HR Dashboard
│ role = ADMIN                         │ → Admin Control Center
│ role = EMPLOYER / LEADERSHIP         │ → Executive Dashboard
└──────────────────────────────────────┘
```

## 3A.4 Unauthorized Workspace Protection

Every protected workspace must enforce authorization.

Do not rely only on frontend route guards.

Required protection layers:

```text
Frontend Route Guard
        +
Backend Authorization
        +
API Permission Validation
```

Examples:

- HR users cannot access administrator configuration.
- HR users cannot access executive financial analytics unless explicitly authorized.
- Employers cannot modify system security settings.
- Regular employees cannot access HR, administrator, or executive workspaces.
- Administrators should receive only the permissions assigned to their administrator role.

## 3A.5 Login Screen Visual Design

Maintain the FORTHEYE white-glass design language.

Recommended layout:

```text
Background:
#F7F9FC

Main Card:
White glass surface

Primary:
#2563EB

Secondary:
#4F46E5

Text:
#172033

Muted:
#64748B
```

Use:

- FORTHEYE logo
- Clean role cards
- Subtle glass effect
- Professional typography
- Clear selected-role state
- Password visibility toggle
- Remember-me option where appropriate
- Forgot password
- Loading state
- Authentication error state
- Account locked state
- Session-expired state

Do not use decorative imagery that distracts from authentication.

## 3A.6 Role Selection States

Each role card should support:

### Default

```text
White surface
Subtle border
Neutral icon
```

### Hover

```text
Slight elevation
Blue border
Subtle background tint
```

### Selected

```text
Blue/indigo border
Soft blue background
Blue icon
Clear check indicator
```

### Disabled

```text
Reduced opacity
No pointer interaction
Accessible disabled state
```

## 3A.7 Role Descriptions

Use concise descriptions:

### HR Personnel

> Manage employees, recruitment, onboarding, leave, attendance, and performance workflows.

### System Administrator

> Manage users, permissions, security, integrations, configuration, backups, and system health.

### Employer / Leadership

> View workforce KPIs, financial insights, organizational analytics, strategic goals, and forecasts.

## 3A.8 Session and Logout Behavior

After login:

- Persist the authenticated session using the project's existing secure authentication mechanism.
- Do not store passwords in local storage.
- Keep authorization state synchronized with the backend.
- Provide a clear logout action.
- Clear sensitive client-side state on logout.
- Redirect logged-out users to the login page.
- Prevent browser back navigation from exposing protected pages after logout where the application architecture permits.

## 3A.9 Switching Workspaces

If a user has multiple authorized roles, provide a secure workspace switcher.

Example:

```text
SY
System Admin

Current Workspace
● Administrator

Switch Workspace

○ HR Operations
○ Executive
```

Only roles returned by the authenticated authorization service should appear.

Never allow users to manually type or select an unauthorized role.

## 3A.10 Authentication Accessibility

The login experience must meet WCAG 2.1 AA.

Ensure:

- Keyboard-accessible role selection
- Visible focus indicators
- Proper labels
- Screen-reader descriptions
- Sufficient color contrast
- Error messages associated with relevant fields
- No color-only role identification
- Minimum 44×44px interactive targets
- Accessible password visibility control
- Logical tab order

Role cards should function as accessible buttons or radio-style controls rather than non-semantic clickable containers.

## 3A.11 Antigravity Implementation Instruction

When implementing this feature in the existing FORTHEYE project:

1. Inspect the current authentication system first.
2. Identify how user roles are currently stored.
3. Identify the existing login route.
4. Identify the existing authorization middleware or route guards.
5. Reuse the existing authentication provider.
6. Do not create a second authentication system.
7. Add the three workspace choices to the existing login experience.
8. Validate the selected role against the authenticated user's actual permissions.
9. Redirect users to the correct workspace.
10. Protect all role-specific routes.
11. Protect role-specific APIs on the backend.
12. Test unauthorized access manually.
13. Test direct URL navigation to protected routes.
14. Test logout and session expiration.
15. Test users with multiple authorized roles.
16. Test mobile and keyboard navigation.
17. Preserve all existing authentication functionality.

### Required acceptance criteria

The implementation is complete only when:

```text
[✓] Three login options are visible
[✓] HR login opens only the HR workspace
[✓] Administrator login opens only the Admin workspace
[✓] Employer/Leadership login opens only the Executive workspace
[✓] Role selection cannot bypass authorization
[✓] Unauthorized direct URLs are blocked
[✓] Backend/API permissions are enforced
[✓] Logout works correctly
[✓] Session expiration is handled
[✓] Multiple-role users can switch authorized workspaces
[✓] WCAG 2.1 AA requirements are met
[✓] Mobile login works correctly
[✓] Existing authentication functionality remains intact
```
