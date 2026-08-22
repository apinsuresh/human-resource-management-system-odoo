import { useState, useEffect } from 'react';
import { 
  type Employee, 
  mockGetEmployees, 
  mockGetDailyAttendanceSummary, 
  getStoredData, 
  mockUpdateEmployeeStatus, 
  mockGetCurrentUser 
} from '../mockApi';
import { showToast } from '../components/Toast';

interface DirectoryProps {
  userRole: string;
  onNavigateToSalaryInfo?: (employeeId: string) => void;
}

export default function Directory({ userRole, onNavigateToSalaryInfo }: DirectoryProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [dailyStatusList, setDailyStatusList] = useState<any[]>([]);
  
  // Debounced search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Drawer state
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Current Logged-in Employee Duty states
  const [currentUserEmp, setCurrentUserEmp] = useState<Employee | null>(null);
  const [activeCheckIn, setActiveCheckIn] = useState<any>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  const loadDirectoryData = () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const emps = mockGetEmployees(userRole as any, true); // Get safe read-only views
      setEmployees(emps);

      // Load attendance summaries for daily badges
      const statusData = mockGetDailyAttendanceSummary('HR_OFFICER', todayStr);
      setDailyStatusList(statusData);
    } catch (err) {
      console.error(err);
    }
  };

  // Sync session and initial check-in records for current employee
  const syncDutyState = () => {
    const active = mockGetCurrentUser();
    if (active && active.role === 'EMPLOYEE') {
      const empsRaw = getStoredData<Employee>('hrms_employees') || [];
      const me = empsRaw.find(e => e.id === active.user.id);
      if (me) {
        setCurrentUserEmp(me);
        // Find active check-in with no checkout
        const logs = getStoredData<any>('hrms_attendance') || [];
        const today = new Date().toISOString().split('T')[0];
        const record = logs.find((a: any) => a.employeeId === me.id && a.date === today && !a.checkOutAt);
        if (record) {
          setActiveCheckIn(record);
        } else {
          setActiveCheckIn(null);
        }
      }
    }
  };

  useEffect(() => {
    loadDirectoryData();
    syncDutyState();
    window.addEventListener('hrms-attendance-update', loadDirectoryData);
    window.addEventListener('hrms-attendance-update', syncDutyState);
    return () => {
      window.removeEventListener('hrms-attendance-update', loadDirectoryData);
      window.removeEventListener('hrms-attendance-update', syncDutyState);
    };
  }, [userRole]);

  // Debounce search input changes (300ms delay)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInputValue);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInputValue]);

  // Running duty timer clock
  useEffect(() => {
    let timerId: any;
    if (activeCheckIn && activeCheckIn.checkInAt) {
      const updateTimer = () => {
        const start = new Date(activeCheckIn.checkInAt).getTime();
        const now = new Date().getTime();
        const diffMs = now - start;
        const diffHrs = Math.floor(diffMs / 3600000);
        const diffMins = Math.floor((diffMs % 3600000) / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        
        const hrsStr = String(diffHrs).padStart(2, '0');
        const minsStr = String(diffMins).padStart(2, '0');
        const secsStr = String(diffSecs).padStart(2, '0');
        
        setElapsedTime(`${hrsStr}:${minsStr}:${secsStr}`);
      };

      updateTimer();
      timerId = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('00:00:00');
    }
    return () => clearInterval(timerId);
  }, [activeCheckIn]);

  // Handle Shift Check-In / Check-Out Actions
  const handleCheckInToggle = async () => {
    if (!currentUserEmp) return;
    try {
      const logs = getStoredData<any>('hrms_attendance') || [];
      const today = new Date().toISOString().split('T')[0];

      if (activeCheckIn) {
        // CHECK OUT action
        const index = logs.findIndex((a: any) => a.employeeId === currentUserEmp.id && a.date === today && !a.checkOutAt);
        if (index !== -1) {
          const record = logs[index];
          record.checkOutAt = new Date().toISOString();
          // Calculate work hours
          const start = new Date(record.checkInAt).getTime();
          const end = new Date(record.checkOutAt).getTime();
          const workHours = (end - start) / 3600000;
          record.workHours = parseFloat(workHours.toFixed(2));
          record.extraHours = parseFloat(Math.max(0, workHours - 8).toFixed(2));
          record.status = 'PRESENT';
          
          logs[index] = record;
          localStorage.setItem('hrms_attendance', JSON.stringify(logs));
          
          // Dispatch synchronization events
          window.dispatchEvent(new Event('hrms-attendance-update'));
          showToast(`Checked out. Work duration: ${record.workHours} hrs.`, 'success');
        }
        setActiveCheckIn(null);
      } else {
        // CHECK IN action
        // Prevent duplicate check-in checks
        const existingActive = logs.find((a: any) => a.employeeId === currentUserEmp.id && a.date === today && !a.checkOutAt);
        if (existingActive) {
          showToast('An active check-in session already exists.', 'error');
          return;
        }

        const newRecord = {
          id: `att-${Math.random().toString(36).substr(2, 9)}`,
          employeeId: currentUserEmp.id,
          date: today,
          checkInAt: new Date().toISOString(),
          status: 'PRESENT' as const
        };
        
        logs.push(newRecord);
        localStorage.setItem('hrms_attendance', JSON.stringify(logs));
        setActiveCheckIn(newRecord);
        showToast('Checked in successfully. Timer started.', 'success');
        
        window.dispatchEvent(new Event('hrms-attendance-update'));
      }
      loadDirectoryData();
    } catch (err: any) {
      showToast(err.message || 'Action failed. Please try again.', 'error');
    }
  };

  // Manage account active/inactive statuses (System Admin & HR only)
  const handleUpdateAccountStatus = (empId: string, nextStatus: 'ACTIVE' | 'SUSPENDED' | 'UNLOCK' | 'DEACTIVATED') => {
    try {
      const activeUser = mockGetCurrentUser();
      const adminEmail = activeUser ? activeUser.user.email : 'admin@company.com';
      const updated = mockUpdateEmployeeStatus(userRole as any, empId, nextStatus, adminEmail);
      loadDirectoryData();
      
      // Sync selected Emp state
      const rawEmps = getStoredData<Employee>('hrms_employees') || [];
      const updatedFull = rawEmps.find(e => e.id === empId);
      if (updatedFull) {
        setSelectedEmp(updatedFull);
      }
      
      showToast(`Account status updated to ${updated.status}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Operation failed.', 'error');
    }
  };

  // Render Status Badge (Accessible text labels + icons)
  const getStatusBadge = (empId: string) => {
    const statusRecord = dailyStatusList.find(s => s.employeeId === empId);
    const status = statusRecord?.status || 'ABSENT';

    if (status === 'PRESENT') {
      return (
        <span className="badge" style={{ color: '#16a34a', background: '#f0fdf4', border: '1px solid #dcfce7', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a' }} />
          Present
        </span>
      );
    }
    if (status === 'ON_LEAVE') {
      return (
        <span className="badge" style={{ color: '#2563eb', background: '#eff6ff', border: '1px solid #dbeafe', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }} />
          On Leave
        </span>
      );
    }
    return (
      <span className="badge" style={{ color: '#ea580c', background: '#fff7ed', border: '1px solid #ffedd5', padding: '0.2rem 0.65rem', borderRadius: '12px', fontSize: '0.72rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c' }} />
        Absent
      </span>
    );
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      fullName.includes(query) || 
      emp.loginId.toLowerCase().includes(query) || 
      emp.jobPosition.toLowerCase().includes(query) ||
      emp.department.toLowerCase().includes(query);
    const matchesDept = deptFilter === '' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = Array.from(new Set(employees.map(e => e.department)));

  const handleCardClick = (empId: string) => {
    const employeesRaw = getStoredData<Employee>('hrms_employees') || [];
    const fullEmp = employeesRaw.find(e => e.id === empId);
    if (fullEmp) {
      setSelectedEmp(fullEmp);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, empId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick(empId);
    }
  };

  useEffect(() => {
    const mainShell = document.getElementById('hrms-main-content-layout');
    if (selectedEmp) {
      mainShell?.setAttribute('inert', '');
    } else {
      mainShell?.removeAttribute('inert');
    }
    return () => {
      mainShell?.removeAttribute('inert');
    };
  }, [selectedEmp]);

  // Check permissions to see sensitive payroll & confidential profile details
  const activeSession = mockGetCurrentUser();
  const canSeeSensitive = activeSession && selectedEmp && (
    activeSession.role === 'ADMIN' || 
    activeSession.role === 'HR_OFFICER' || 
    activeSession.user.id === selectedEmp.id
  );

  const canEdit = activeSession && (
    activeSession.role === 'ADMIN' || 
    activeSession.role === 'HR_OFFICER'
  );

  // Fetch salary amount in paise if permission holds
  const getSalaryAmount = (empId: string) => {
    const salaries = getStoredData<any>('sa_salaries') || [];
    const record = salaries.find((s: any) => s.employeeId === empId);
    if (record) {
      return `₹${(record.wageAmount / 100).toLocaleString('en-IN')}`;
    }
    return '₹0';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Employee Directory</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Browse team members, check working attendance status, and request details.
        </p>
      </div>

      {/* 1. EMPLOYEE CHECK-IN / CHECK-OUT SHIFT PANEL (Only for Employee role landing) */}
      {currentUserEmp && (
        <div className="card glass-card" style={{ padding: '1.5rem', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(37,99,235,0.15)', background: 'rgba(255,255,255,0.85)' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className={`badge-pill-outline ${activeCheckIn ? 'on-duty' : ''}`} style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                ● {activeCheckIn ? 'On Duty' : 'Checked Out'}
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                ({currentUserEmp.location || 'Bangalore'})
              </span>
            </div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
              {activeCheckIn 
                ? `Clocked in since ${new Date(activeCheckIn.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` 
                : 'You are currently off-shift. Please check in to record today\'s attendance.'}
            </h3>
            {activeCheckIn && (
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                Working duration: <strong style={{ fontFamily: 'monospace' }}>{elapsedTime}</strong>
              </span>
            )}
          </div>

          <button 
            type="button" 
            className={`btn-shift-action ${activeCheckIn ? 'checkout' : ''}`}
            style={{ minHeight: '44px', minWidth: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', borderRadius: '10px' }}
            onClick={handleCheckInToggle}
            aria-label={activeCheckIn ? 'Check Out of Duty' : 'Check In to Duty'}
          >
            {activeCheckIn ? 'Check Out →' : 'Check In →'}
          </button>
        </div>
      )}

      {/* Search Header Filter Bar */}
      <div className="directory-header-row card glass-card" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem 1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="header-search-bar" style={{ flex: 1, maxWidth: 'none' }}>
          <span className="search-icon-glass" style={{ left: '14px' }}></span>
          <input 
            type="search" 
            id="search-input" 
            className="form-control" 
            style={{ paddingLeft: '2.5rem', minHeight: '42px', borderRadius: '8px' }}
            placeholder="Search by name, position, department, or corporate ID..."
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            aria-label="Search employees"
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <label htmlFor="dept-filter" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold', cursor: 'pointer' }}>
            Department
          </label>
          <select 
            id="dept-filter" 
            className="form-control" 
            style={{ minHeight: '42px', borderRadius: '8px', width: '220px', padding: '0 0.75rem' }}
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            {uniqueDepartments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. RESPONSIVE CARD GRID LAYOUT */}
      <div 
        className="directory-grid-container" 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '1.5rem', 
          marginBottom: '1.5rem' 
        }}
      >
        {filteredEmployees.map((emp) => (
          <div 
            key={emp.id} 
            className="employee-card glass-card"
            style={{
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              cursor: 'pointer',
              transition: 'all var(--transition-speed) ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              position: 'relative',
              textAlign: 'left',
              background: 'var(--bg-card)'
            }}
            onClick={() => handleCardClick(emp.id)}
            onKeyDown={(e) => handleKeyDown(e, emp.id)}
            role="button"
            tabIndex={0}
            aria-label={`${emp.firstName} ${emp.lastName}, ${emp.jobPosition} in ${emp.department}. Click to view details.`}
          >
            {/* Top row with Purple Circle Avatar, Status Badge, and Top-Right 3-dot Menu */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginBottom: '0.85rem' }}>
              <div 
                style={{ 
                  width: '48px', 
                  height: '48px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #6366f1, #4f46e5)', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justify: 'center', 
                  fontSize: '1rem', 
                  fontWeight: 800,
                  flexShrink: 0
                }}
              >
                {emp.firstName.substring(0, 2).toUpperCase()}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {getStatusBadge(emp.id)}
                <button 
                  type="button"
                  title="Options"
                  style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '0.1rem 0.25rem', lineHeight: 1 }}
                  onClick={(e) => { e.stopPropagation(); showToast(`Actions for ${emp.firstName}`, 'info'); }}
                >
                  ⋮
                </button>
              </div>
            </div>

            {/* Name & Job Position */}
            <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {emp.firstName} {emp.lastName}
            </h4>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '0.4rem' }}>
              {emp.jobPosition}
            </span>

            {/* Department with building icon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
                <path d="M6 12H4a2 2 0 0 0-2 2v8"/>
                <path d="M18 9h2a2 2 0 0 1 2 2v11"/>
              </svg>
              <span>{emp.department}</span>
            </div>
            
            {/* Corporate ID Badge Pill */}
            <div 
              style={{ 
                background: 'var(--bg-secondary)', 
                padding: '0.2rem 0.65rem', 
                borderRadius: '12px', 
                fontSize: '0.73rem', 
                fontWeight: 600, 
                color: 'var(--text-secondary)', 
                letterSpacing: '0.02em', 
                display: 'inline-block', 
                marginBottom: '1rem',
                border: '1px solid var(--border-color)'
              }}
            >
              {emp.loginId}
            </div>

            {/* Bottom Action Bar (Email, Phone, Calendar + 3-Dot) */}
            <div 
              style={{ 
                display: 'flex', 
                justify: 'space-between', 
                alignItems: 'center', 
                width: '100%', 
                paddingTop: '0.65rem', 
                borderTop: '1px solid var(--border-color)',
                marginTop: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  type="button"
                  title={`Email ${emp.email}`}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onClick={() => showToast(`Opening email to ${emp.email}`, 'info')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </button>

                <button 
                  type="button"
                  title={`Call ${emp.mobile}`}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onClick={() => showToast(`Calling ${emp.mobile}`, 'info')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>

                <button 
                  type="button"
                  title="Schedule Meeting"
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  onClick={() => showToast(`Schedule meeting with ${emp.firstName}`, 'info')}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/>
                  </svg>
                </button>
              </div>

              <button 
                type="button"
                title="More Actions"
                style={{ border: 'none', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1rem', padding: '0.2rem 0.4rem' }}
                onClick={() => showToast(`More options for ${emp.firstName}`, 'info')}
              >
                ⋮
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="empty-state-card" style={{ padding: '3.5rem 2rem' }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}></span>
          <h3>No Employees Found</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Try refining your search terms or filters.</span>
        </div>
      )}

      {/* Pagination Row */}
      {filteredEmployees.length > 0 && (
        <div className="pagination-bar" style={{ marginTop: '1rem' }}>
          <span className="pagination-info">
            Showing 1 to {filteredEmployees.length} of {employees.length} employees
          </span>
          <div className="pagination-controls">
            <button type="button" className="pagination-btn" style={{ minWidth: '38px', minHeight: '38px' }} onClick={() => showToast('Previous Page', 'info')}>&lt;</button>
            <button type="button" className="pagination-btn active" style={{ minWidth: '38px', minHeight: '38px' }}>1</button>
            <button type="button" className="pagination-btn" style={{ minWidth: '38px', minHeight: '38px' }} onClick={() => showToast('Next Page', 'info')}>&gt;</button>
          </div>
        </div>
      )}

      {/* 3. CLICKABLE PROFILE DETAILS SIDE DRAWER */}
      {selectedEmp && (
        <>
          <aside className="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" style={{ zIndex: 300, background: '#ffffff', width: '100%', maxWidth: '460px' }}>
            <div className="drawer-header" style={{ borderBottom: '1px solid var(--border-glass)' }}>
              <h3 id="drawer-title" style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Employee Profile</h3>
              <button 
                type="button" 
                className="drawer-close-btn"
                style={{ width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}
                onClick={() => setSelectedEmp(null)}
                aria-label="Close details drawer"
              >
                
              </button>
            </div>
            
            <div className="drawer-body" style={{ padding: '1.5rem' }}>
              {/* VIEW ONLY vs EDIT indicators */}
              {!canEdit ? (
                <div style={{ background: '#f1f5f9', color: '#475569', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid rgba(71,85,105,0.1)' }}>
                   VIEW ONLY MODE
                </div>
              ) : (
                <div style={{ background: 'rgba(16,185,129,0.06)', color: 'var(--status-present)', padding: '0.6rem 1rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', border: '1px solid rgba(16,185,129,0.15)' }}>
                  ️ EDIT PREFERENCES ALLOWED (ADMIN)
                </div>
              )}

              <div className="drawer-profile-summary" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div className="drawer-avatar" style={{ width: '70px', height: '70px', margin: '0 auto 0.75rem auto', fontSize: '1.5rem', fontWeight: 'bold', background: 'rgba(37,99,235,0.06)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}>
                  {selectedEmp.firstName.substring(0, 2).toUpperCase()}
                </div>
                <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.3rem', fontWeight: 800 }}>{selectedEmp.firstName} {selectedEmp.lastName}</h4>
                <span className="drawer-position" style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{selectedEmp.jobPosition} • {selectedEmp.department}</span>
                <div style={{ marginTop: '0.5rem' }}>
                  {getStatusBadge(selectedEmp.id)}
                </div>
              </div>

              {/* General Employment Information */}
              <div className="drawer-section" style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.35rem' }}>
                  Employment Details
                </h5>
                <div className="drawer-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div><strong>Corporate ID:</strong> <code style={{ fontSize: '0.8rem' }}>{selectedEmp.loginId}</code></div>
                  <div><strong>Employee Code:</strong> {selectedEmp.empCode || 'N/A'}</div>
                  <div><strong>Joining Date:</strong> {selectedEmp.dateOfJoining}</div>
                  <div><strong>Office Location:</strong> {selectedEmp.location || 'N/A'}</div>
                  <div><strong>Corporate Email:</strong> {selectedEmp.email}</div>
                  {selectedEmp.employmentType && (
                    <div><strong>Employment Type:</strong> {selectedEmp.employmentType}</div>
                  )}
                </div>
              </div>

              {/* 4. SENSITIVE INFO PROTECTION MATRIX (Only visible to self or HR/Admin roles) */}
              {canSeeSensitive ? (
                <div className="drawer-section" style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(37,99,235,0.03)', borderRadius: '10px', border: '1px solid rgba(37,99,235,0.08)' }}>
                  <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--accent-primary)', letterSpacing: '0.5px', marginBottom: '0.75rem', fontWeight: 'bold', borderBottom: '1px dashed rgba(37,99,235,0.15)', paddingBottom: '0.35rem' }}>
                    Confidential Information 
                  </h5>
                  <div className="drawer-grid" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div><strong>Mobile Phone:</strong> {selectedEmp.mobile || 'N/A'}</div>
                    <div><strong>Personal Email:</strong> {selectedEmp.personalEmail || 'N/A'}</div>
                    <div><strong>Residential Address:</strong> {selectedEmp.residingAddress || 'N/A'}</div>
                    <div><strong>Nationality:</strong> {selectedEmp.nationality || 'N/A'}</div>
                    <div><strong>Marital Status:</strong> {selectedEmp.maritalStatus || 'SINGLE'}</div>
                    <div><strong>Gender:</strong> {selectedEmp.gender}</div>
                    <div><strong>Date of Birth:</strong> {selectedEmp.dateOfBirth}</div>
                    
                    <div style={{ borderTop: '1px dashed rgba(37,99,235,0.1)', margin: '0.5rem 0' }} />
                    
                    <div><strong>Income Tax PAN:</strong> {selectedEmp.panNo || 'N/A'}</div>
                    <div><strong>Provident Fund UAN:</strong> {selectedEmp.uanNo || 'N/A'}</div>
                    <div><strong>Bank Institution:</strong> {selectedEmp.bankName || 'N/A'}</div>
                    <div><strong>Bank A/C Number:</strong> {selectedEmp.bankAccountNumber || 'N/A'}</div>
                    <div><strong>IFSC Code:</strong> {selectedEmp.ifscCode || 'N/A'}</div>
                    
                    {activeSession && (activeSession.role === 'ADMIN' || activeSession.role === 'HR_OFFICER') && (
                      <div><strong>Current Monthly Wages:</strong> <strong>{getSalaryAmount(selectedEmp.id)}</strong></div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-glass)', fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem' }}>
                   Confidential identity details are masked for data privacy.
                </div>
              )}

              {/* Skills & Certifications */}
              <div className="drawer-section" style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.35rem' }}>
                  Skills
                </h5>
                <div className="drawer-skills-list" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {selectedEmp.skills && selectedEmp.skills.length > 0 ? (
                    selectedEmp.skills.map(s => <span key={s} className="drawer-skill-tag" style={{ background: 'rgba(37,99,235,0.06)', color: 'var(--accent-primary)', fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>{s}</span>)
                  ) : (
                    <span className="no-skills-msg" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No skills listed yet.</span>
                  )}
                </div>
              </div>

              <div className="drawer-section" style={{ marginBottom: '1.5rem' }}>
                <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '0.75rem', fontWeight: 'bold', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.35rem' }}>
                  Certifications
                </h5>
                <ul className="drawer-cert-list" style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem' }}>
                  {selectedEmp.certifications && selectedEmp.certifications.length > 0 ? (
                    selectedEmp.certifications.map(c => <li key={c} style={{ marginBottom: '0.25rem' }}> {c}</li>)
                  ) : (
                    <span className="no-skills-msg" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No certifications listed.</span>
                  )}
                </ul>
              </div>

              {/* Account actions for Administrative role */}
              {canEdit && onNavigateToSalaryInfo && (
                <button 
                  type="button"
                  className="btn btn-secondary"
                  style={{ marginTop: '1rem', width: '100%', minHeight: '40px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', fontWeight: 'bold', borderRadius: '8px' }}
                  onClick={() => {
                    setSelectedEmp(null);
                    onNavigateToSalaryInfo(selectedEmp.id);
                  }}
                >
                   Configure Salary Info 
                </button>
              )}

              {/* Status Action Modifiers */}
              {canEdit && (
                <div className="drawer-section" style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem', marginTop: '1.25rem' }}>
                  <h5 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '0.75rem', fontWeight: 'bold' }}>
                    Account Status & Actions
                  </h5>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.85rem' }}>System Status:</span>
                    <span className="badge" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                      {selectedEmp.status || 'ACTIVE'}
                    </span>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {selectedEmp.status !== 'ACTIVE' && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.75rem', minHeight: '36px', padding: 0 }}
                        onClick={() => handleUpdateAccountStatus(selectedEmp.id, 'ACTIVE')}
                      >
                        Activate
                      </button>
                    )}
                    {selectedEmp.status !== 'SUSPENDED' && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.75rem', minHeight: '36px', padding: 0, color: 'var(--status-leave)' }}
                        onClick={() => handleUpdateAccountStatus(selectedEmp.id, 'SUSPENDED')}
                      >
                        Suspend
                      </button>
                    )}
                    {selectedEmp.status === 'LOCKED' && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.75rem', minHeight: '36px', padding: 0, gridColumn: 'span 2' }}
                        onClick={() => handleUpdateAccountStatus(selectedEmp.id, 'UNLOCK')}
                      >
                        Unlock Account
                      </button>
                    )}
                    {selectedEmp.status !== 'DEACTIVATED' && (
                      <button 
                        type="button" 
                        className="btn btn-secondary" 
                        style={{ fontSize: '0.75rem', minHeight: '36px', padding: 0, gridColumn: selectedEmp.status === 'ACTIVE' ? 'span 1' : 'span 2' }}
                        onClick={() => handleUpdateAccountStatus(selectedEmp.id, 'DEACTIVATED')}
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </aside>
          
          <div 
            className="drawer-backdrop" 
            onClick={() => setSelectedEmp(null)}
            role="presentation"
            style={{ zIndex: 250 }}
          />
        </>
      )}

      {/* Accessible visual styles */}
      <style>{`
        .employee-card {
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03), 0 2px 4px -1px rgba(0,0,0,0.02);
        }
        .employee-card:hover {
          transform: translateY(-2px);
          border-color: var(--accent-primary) !important;
          box-shadow: var(--shadow-premium) !important;
        }
        .employee-card:focus-visible {
          outline: 2px solid var(--accent-primary) !important;
          outline-offset: 2px !important;
        }
        .btn-shift-action {
          background-color: var(--accent-primary);
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color var(--transition-speed);
        }
        .btn-shift-action:hover {
          background-color: #1d4ed8;
        }
        .btn-shift-action.checkout {
          background-color: #ef4444;
        }
        .btn-shift-action.checkout:hover {
          background-color: #dc2626;
        }
        .badge-pill-outline {
          border: 1px solid var(--border-glass);
          background: rgba(255,255,255,0.4);
          padding: 0.2rem 0.5rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        .badge-pill-outline.on-duty {
          color: var(--status-present);
          border-color: rgba(16,185,129,0.2);
          background: rgba(16,185,129,0.05);
        }
      `}</style>
    </div>
  );
}
