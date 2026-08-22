import { useState, useEffect } from 'react';
import { 
  type Employee, 
  type Attendance, 
  mockGetEmployeeById, 
  mockGetTimeOffBalances, 
  mockGetDailyAttendanceSummary, 
  mockGetPayableDaysSummary, 
  mockCheckIn, 
  mockCheckOut, 
  getStoredData
} from '../mockApi';
import { showToast } from '../components/Toast';

interface AttendanceViewProps {
  employeeId: string;
  userRole: string;
}

export default function AttendanceView({ employeeId, userRole }: AttendanceViewProps) {
  const [activeTab, setActiveTab] = useState<'workspace' | 'personal'>('workspace');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  
  // Personal Clock check-in status states
  const [activeCheckIn, setActiveCheckIn] = useState<Attendance | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [monthOffset, setMonthOffset] = useState(0);

  // HR Workspace specific states
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  
  // Admin Workspace specific states
  const [backupLoading, setBackupLoading] = useState(false);

  // Sync dates based on offsets
  useEffect(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    setSelectedMonth(d.getMonth());
    setSelectedYear(d.getFullYear());
  }, [monthOffset]);

  const syncCheckIn = () => {
    try {
      const allAttendance = getStoredData<Attendance>('hrms_attendance');
      const todayStr = new Date().toISOString().split('T')[0];
      const todayRecord = allAttendance.find(
        (a) => a.employeeId === employeeId && a.date === todayStr
      );
      if (todayRecord && todayRecord.checkInAt && !todayRecord.checkOutAt) {
        setActiveCheckIn(todayRecord);
      } else {
        setActiveCheckIn(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadDashboardData = () => {
    try {
      const emp = mockGetEmployeeById(employeeId, userRole as any, employeeId) as Employee;
      setEmployee(emp || null);

      const bals = mockGetTimeOffBalances(employeeId);
      setLeaveBalances(bals);

      if (userRole !== 'EMPLOYEE') {
        const todayStr = new Date().toISOString().split('T')[0];
        mockGetDailyAttendanceSummary(userRole as any, todayStr);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sync leave approvals lists for HR role
  useEffect(() => {
    const updateHRData = () => {
      const list = getStoredData<any>('hrms_leave_requests').filter(r => r.status === 'PENDING');
      setPendingLeaves(list);
    };
    updateHRData();
    window.addEventListener('hrms-attendance-update', updateHRData);
    return () => window.removeEventListener('hrms-attendance-update', updateHRData);
  }, []);

  useEffect(() => {
    loadDashboardData();
    syncCheckIn();

    const handleSync = () => {
      loadDashboardData();
      syncCheckIn();
    };

    window.addEventListener('hrms-attendance-update', handleSync);
    return () => window.removeEventListener('hrms-attendance-update', handleSync);
  }, [employeeId, monthOffset, userRole]);

  // Clock Timer
  useEffect(() => {
    if (!activeCheckIn || !activeCheckIn.checkInAt) {
      setElapsedTime('00:00:00');
      return;
    }

    const timer = setInterval(() => {
      const start = new Date(activeCheckIn.checkInAt!).getTime();
      const diff = Date.now() - start;
      if (diff < 0) {
        setElapsedTime('00:00:00');
        return;
      }

      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const pad = (n: number) => String(n).padStart(2, '0');
      setElapsedTime(`${pad(h)}:${pad(m)}:${pad(s)}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeCheckIn]);

  const handleCheckInToggle = async () => {
    try {
      if (activeCheckIn) {
        await mockCheckOut(employeeId);
        showToast('Checked out successfully.', 'success');
      } else {
        await mockCheckIn(employeeId);
        showToast('Checked in successfully.', 'success');
      }
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err: any) {
      showToast(err.message || 'Check-in action failed.', 'error');
    }
  };

  // HR Approvals handlers
  const handleApproveLeave = (reqId: string) => {
    try {
      const requests = getStoredData<any>('hrms_leave_requests');
      const updated = requests.map(r => r.id === reqId ? { ...r, status: 'APPROVED' } : r);
      localStorage.setItem('hrms_leave_requests', JSON.stringify(updated));
      showToast('Leave request approved successfully!', 'success');
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  const handleRejectLeave = (reqId: string) => {
    try {
      const requests = getStoredData<any>('hrms_leave_requests');
      const updated = requests.map(r => r.id === reqId ? { ...r, status: 'REJECTED' } : r);
      localStorage.setItem('hrms_leave_requests', JSON.stringify(updated));
      showToast('Leave request rejected.', 'info');
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err) {
      showToast('Action failed.', 'error');
    }
  };

  // Admin Backup triggers
  const handleRunBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      setBackupLoading(false);
      showToast('Backup completed! Database snapshot saved (2.45 GB).', 'success');
    }, 1000);
  };

  // Helper date status mapping
  const getDaysInMonth = (monthIdx: number, yearVal: number) => {
    const days = [];
    const dateCount = new Date(yearVal, monthIdx + 1, 0).getDate();
    for (let d = 1; d <= dateCount; d++) {
      days.push(d);
    }
    return days;
  };

  const getDateStatus = (day: number, monthIdx: number, yearVal: number) => {
    const dateStr = `${yearVal}-${String(monthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const allAttendance = getStoredData<Attendance>('hrms_attendance');
    const record = allAttendance.find(a => a.employeeId === employeeId && a.date === dateStr);
    
    if (record) {
      if (record.status === 'PRESENT') return 'green';
      if (record.status === 'ON_LEAVE') return 'red';
      return 'yellow';
    }

    const d = new Date(yearVal, monthIdx, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return 'grey';

    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr > todayStr) return 'none';

    return 'yellow';
  };

  const getMonthName = (monthIdx: number) => {
    return new Date(2026, monthIdx, 1).toLocaleString('default', { month: 'long' });
  };



  const paySummary = mockGetPayableDaysSummary(employeeId, selectedMonth, selectedYear);
  
  let weekendsCount = 0;
  const daysList = getDaysInMonth(selectedMonth, selectedYear);
  daysList.forEach((day) => {
    const d = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) weekendsCount++;
  });

  const todayDate = new Date();

  const workspaceTabName = 
    userRole === 'ADMIN' ? 'Control Center' : 
    userRole === 'HR_OFFICER' ? 'Operations Workspace' : 
    'Executive Overview';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.5rem' }}>
      
      {/* Workspace Subtabs Navigator */}
      <div className="tab-navigation" style={{ alignSelf: 'flex-start', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', padding: '0.25rem', border: '1px solid var(--border-glass)', display: 'inline-flex' }}>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'workspace' ? 'active' : ''}`}
          onClick={() => setActiveTab('workspace')}
          style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
          {workspaceTabName}
        </button>
        <button 
          type="button" 
          className={`tab-btn ${activeTab === 'personal' ? 'active' : ''}`}
          onClick={() => setActiveTab('personal')}
          style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          My Personal Logs
        </button>
      </div>

      {activeTab === 'workspace' ? (
        <>
          {/* ========================================== */}
          {/* 1. HR Personnel UI - Operations Workspace */}
          {/* ========================================== */}
          {userRole === 'HR_OFFICER' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Good Morning, HR Team! 👥</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Here's what needs your attention today.</p>
              </div>

              {/* HR Metrics Grid */}
              <div className="grid-4" style={{ gap: '1rem' }}>
                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge green" style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.08)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Leave Pending</span>
                    <strong style={{ fontSize: '1.25rem' }}>{pendingLeaves.length}</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Require approvals</span>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge green" style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.08)', color: 'var(--status-present)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Onboard Today</span>
                    <strong style={{ fontSize: '1.25rem' }}>8</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Checklists active</span>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge purple" style={{ width: '40px', height: '40px', background: 'rgba(124, 58, 237, 0.08)', color: 'var(--accent-purple)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="7"></circle><polyline points="12 8 12 12 16 14"></polyline></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Reviews Due</span>
                    <strong style={{ fontSize: '1.25rem' }}>5</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Due within 3 days</span>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge purple" style={{ width: '40px', height: '40px', background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Interv. Today</span>
                    <strong style={{ fontSize: '1.25rem' }}>3</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Candidates scheduled</span>
                  </div>
                </div>
              </div>

              {/* Main split row layout */}
              <div className="grid-2" style={{ gap: '1.5rem' }}>
                
                {/* Pending approvals Card */}
                <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>Leave Approvals</h3>
                    <span className="badge badge-absent" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>Pending Queue</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1 }}>
                    {pendingLeaves.length > 0 ? (
                      pendingLeaves.map((req) => (
                        <div key={req.id} className="employee-list-row" style={{ padding: '0.75rem 1rem', borderRadius: '10px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <strong style={{ fontSize: '0.85rem' }}>Type: {req.type.replace(/_/g, ' ')}</strong>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              Requested: {req.startDate} to {req.endDate} ({req.allocationDays} days)
                            </span>
                            {req.reason && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Reason: "{req.reason}"</span>}
                          </div>
                          
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              type="button" 
                              className="btn btn-secondary btn-sm" 
                              style={{ minHeight: '28px', padding: '0 0.5rem' }} 
                              onClick={() => handleRejectLeave(req.id)}
                            >
                              Reject
                            </button>
                            <button 
                              type="button" 
                              className="btn-submit-request" 
                              style={{ height: '28px', padding: '0 0.75rem', fontSize: '0.75rem' }}
                              onClick={() => handleApproveLeave(req.id)}
                            >
                              Approve
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="empty-state-card" style={{ flexGrow: 1, padding: '2rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.5rem' }} aria-hidden="true"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        <strong>All caught up!</strong>
                        <span>No pending leave requests to process.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Onboarding checklist Card */}
                <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>Active Onboarding Checklists</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1 }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Anita Rao (Software Engineer)</strong>
                        <span style={{ color: 'var(--status-present)', fontWeight: 'bold' }}>80%</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '80%', background: 'var(--status-present)' }} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Rahul Kumar (Product Manager)</strong>
                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>55%</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '55%', background: 'var(--accent-secondary)' }} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Maria Lopez (Operations Associate)</strong>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>30%</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '30%', background: '#f59e0b' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Pipeline widget */}
              <div className="card glass-card">
                <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem' }}>Recruitment Pipeline</h3>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Applied</span>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: '0.25rem', display: 'block' }}>42</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Screening</span>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--text-primary)', marginTop: '0.25rem', display: 'block' }}>18</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Interview</span>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--accent-secondary)', marginTop: '0.25rem', display: 'block' }}>9</strong>
                  </div>
                  <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Offer Issued</span>
                    <strong style={{ fontSize: '1.5rem', color: 'var(--status-present)', marginTop: '0.25rem', display: 'block' }}>4</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 2. Administrator UI - Control Center */}
          {/* ========================================== */}
          {userRole === 'ADMIN' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>System Control Center ⚙️</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Uptime monitoring and system health logs.</p>
              </div>

              {/* Admin Metrics Grid */}
              <div className="grid-3" style={{ gap: '1rem' }}>
                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge purple" style={{ width: '40px', height: '40px', background: 'rgba(124, 58, 237, 0.08)', color: 'var(--accent-purple)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Active Users</span>
                    <strong style={{ fontSize: '1.25rem' }}>128</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Registered accounts</span>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge green" style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.08)', color: 'var(--status-present)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>System Uptime</span>
                    <strong style={{ fontSize: '1.25rem' }}>99.98%</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last 30 days active</span>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge purple" style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.08)', color: 'var(--accent-secondary)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Storage Utilized</span>
                    <strong style={{ fontSize: '1.25rem' }}>2.45 GB</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Database backups size</span>
                  </div>
                </div>
              </div>

              {/* System Health and Security Score grids */}
              <div className="grid-2" style={{ gap: '1.5rem' }}>
                
                {/* Health logs list */}
                <div className="card glass-card">
                  <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>System Health</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <strong>API Gateway Service</strong>
                      <span style={{ color: 'var(--status-present)', fontWeight: 'bold' }}>● Healthy</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <strong>Primary Postgres DB</strong>
                      <span style={{ color: 'var(--status-present)', fontWeight: 'bold' }}>● Healthy</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <strong>Cloud Storage Bucket</strong>
                      <span style={{ color: 'var(--status-present)', fontWeight: 'bold' }}>● Healthy</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <strong>Celery Background Queue</strong>
                      <span style={{ color: 'var(--status-present)', fontWeight: 'bold' }}>● Healthy</span>
                    </div>
                  </div>
                </div>

                {/* Security metrics */}
                <div className="card glass-card">
                  <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>Security Center</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <span>Risk Vulnerability Score</span>
                        <strong style={{ color: 'var(--status-present)' }}>92 / 100 (Safe)</strong>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '92%', background: 'var(--status-present)' }} />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      <span>Failed Login Attempts (Today)</span>
                      <strong style={{ color: 'var(--status-absent)' }}>3</strong>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                      <span>Critical Alerts</span>
                      <strong style={{ color: 'var(--status-leave)' }}>1 Alert</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent actions list */}
              <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem' }}>Recent Administrative Activity</h3>
                  
                  <button 
                    type="button" 
                    className="btn-submit-request" 
                    style={{ height: '28px', padding: '0 0.75rem', fontSize: '0.75rem' }} 
                    onClick={handleRunBackup}
                    disabled={backupLoading}
                  >
                    {backupLoading ? 'Backing up...' : 'Backup Now'}
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}><strong>Role modified</strong> — HR Manager permissions changed</span>
                    <span style={{ color: 'var(--text-muted)' }}>10:42 AM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.5rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}><strong>User onboarded</strong> — emp-uuid-88a2 created</span>
                    <span style={{ color: 'var(--text-muted)' }}>09:30 AM</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-primary)' }}><strong>System Backup</strong> — snapshot completed successfully</span>
                    <span style={{ color: 'var(--text-muted)' }}>08:00 AM</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================== */}
          {/* 3. Employer / Leadership - Executive Dashboard */}
          {/* ============================================== */}
          {userRole === 'EMPLOYEE' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Executive Overview 📊</h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Workforce and compensation visibility intelligence.</p>
              </div>

              {/* Executive Metrics grid */}
              <div className="grid-4" style={{ gap: '1rem' }}>
                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge purple" style={{ width: '40px', height: '40px', background: 'rgba(99, 102, 241, 0.08)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Headcount</span>
                    <strong style={{ fontSize: '1.25rem' }}>1,248</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Employees logged</span>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge green" style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.08)', color: 'var(--status-present)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Headcount Growth</span>
                    <strong style={{ fontSize: '1.25rem' }}>+8.4%</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Since last quarter</span>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge green" style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.08)', color: 'var(--status-present)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Engagement</span>
                    <strong style={{ fontSize: '1.25rem' }}>92%</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Survey indices</span>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
                  <div className="quota-icon-badge purple" style={{ width: '40px', height: '40px', background: 'rgba(239, 68, 68, 0.08)', color: 'var(--status-leave)' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                  </div>
                  <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0 }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Turnover</span>
                    <strong style={{ fontSize: '1.25rem' }}>4.2%</strong>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Annualized rate</span>
                  </div>
                </div>
              </div>

              {/* Workforce Growth SVG Chart and Payroll Costs */}
              <div className="grid-2" style={{ gap: '1.5rem' }}>
                <div className="card glass-card">
                  <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>Workforce Growth Trend (Actual vs Forecast)</h3>
                  </div>

                  <div style={{ padding: '0.5rem 0' }}>
                    <svg viewBox="0 0 500 200" style={{ width: '100%', height: 'auto', maxHeight: '180px' }}>
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity="0.15" />
                          <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(148, 163, 184, 0.08)" />
                      <line x1="40" y1="70" x2="480" y2="70" stroke="rgba(148, 163, 184, 0.08)" />
                      <line x1="40" y1="120" x2="480" y2="120" stroke="rgba(148, 163, 184, 0.08)" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="rgba(148, 163, 184, 0.08)" />
                      <path d="M40 170 C 100 130, 180 150, 260 90 C 340 70, 420 50, 480 30 L 480 170 Z" fill="url(#chartGrad)" />
                      <path d="M40 170 C 100 130, 180 150, 260 90 C 340 70, 420 50, 480 30" fill="none" stroke="var(--accent-primary)" strokeWidth="3" strokeLinecap="round" />
                      <circle cx="40" cy="170" r="4" fill="#ffffff" stroke="var(--accent-primary)" strokeWidth="2.5" />
                      <circle cx="260" cy="90" r="4" fill="#ffffff" stroke="var(--accent-primary)" strokeWidth="2.5" />
                      <circle cx="480" cy="30" r="4" fill="#ffffff" stroke="#34D399" strokeWidth="2.5" />
                    </svg>
                  </div>
                </div>

                <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>Payroll Cost Structure</h3>
                  </div>

                  <div style={{ textAlign: 'left', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>TOTAL RUNNING PAYROLL</span>
                    <strong style={{ fontSize: '2.5rem', color: 'var(--text-primary)', margin: '0.5rem 0', display: 'block', lineHeight: 1 }}>₹ 42.5 M</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span className="trend-arrow-badge" style={{ display: 'inline-flex', padding: '0.15rem 0.5rem', fontSize: '0.75rem' }}>
                        ▲ 6.2%
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>growth vs previous period</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Headcount by dept and Strategic goals progress */}
              <div className="grid-2" style={{ gap: '1.5rem' }}>
                
                {/* Dept headcount */}
                <div className="card glass-card">
                  <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>Headcount by Department</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Engineering</strong>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>420 (54%)</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '54%', background: 'var(--accent-primary)' }} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Sales & Marketing</strong>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>280 (36%)</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '36%', background: 'var(--accent-secondary)' }} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Human Resources</strong>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 'bold' }}>80 (10%)</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '10%', background: 'var(--status-present)' }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strategic goals */}
                <div className="card glass-card">
                  <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '1rem' }}>Strategic Corporate Goals</h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Revenue Growth Target</strong>
                        <span style={{ color: 'var(--status-present)', fontWeight: 'bold' }}>78% Completed</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '78%', background: 'var(--status-present)' }} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Annual Hiring Plan</strong>
                        <span style={{ color: 'var(--accent-secondary)', fontWeight: 'bold' }}>64% Completed</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '64%', background: 'var(--accent-secondary)' }} />
                      </div>
                    </div>

                    <div style={{ textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        <strong>Employee Retention index</strong>
                        <span style={{ color: 'var(--status-present)', fontWeight: 'bold' }}>91% Completed</span>
                      </div>
                      <div className="progress-container-bar" style={{ height: '6px' }}>
                        <div className="progress-filler-bar" style={{ width: '91%', background: 'var(--status-present)' }} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </>
      ) : (
        /* ==========================================================================
           EXISTING PERSONAL LOGS (Clock timings + Calendar details)
           ========================================================================== */
        <>
          {/* Top Row: Hero Greeting + Shift timings */}
          <div className="hero-weather-grid">
            <div className="card glass-card hero-glass-greeting">
              <div className="user-badge-profile">
                <div className="hero-avatar-sy">
                  {employee?.firstName.substring(0, 2).toUpperCase() || 'SY'}
                </div>
                <div className="hero-welcome-info" style={{ textAlign: 'left' }}>
                  <h2>Good Morning, {employee?.firstName || 'System'}! 👋</h2>
                  <p>Have a productive day ahead.</p>
                  <div className="hero-badge-row">
                    <span className={`badge-pill-outline ${activeCheckIn ? 'on-duty' : ''}`}>
                      ● {activeCheckIn ? 'On Duty' : 'Checked Out'}
                    </span>
                    <span className="badge-pill-outline">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }} aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      {employee?.location || 'Bangalore'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Weather details */}
              <div className="weather-details-section" style={{ marginLeft: 'auto', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="weather-details-left" style={{ textAlign: 'left' }}>
                  <span className="temp" style={{ display: 'block', fontSize: '1.5rem', fontWeight: 800 }}>22°C</span>
                  <span className="label" style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.15rem 0' }}>Rainy</span>
                  <span className="date" style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)' }}>{getMonthName(todayDate.getMonth())} {todayDate.getFullYear()}</span>
                </div>
                <span className="weather-icon-cloud" style={{ color: 'var(--text-secondary)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8" y2="22"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="16" y1="16" x2="16" y2="22"></line></svg>
                </span>
              </div>
            </div>

            {/* Shift timer */}
            <div className="card glass-card shift-timing-container">
              <div className="shift-timing-details" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', flexGrow: 1, textAlign: 'left' }}>
                <div className="shift-info-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="shift-icon-wrapper" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(37,99,235,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </span>
                  <div className="shift-text-stack">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Shift Timing</span>
                    <strong style={{ fontSize: '0.85rem', display: 'block', color: 'var(--text-primary)' }}>09:00 AM - 06:00 PM</strong>
                  </div>
                </div>
                
                <div className="shift-info-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span className="shift-icon-wrapper" style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(37,99,235,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg>
                  </span>
                  <div className="shift-text-stack">
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Hours Worked</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                      {activeCheckIn && <span className="indicator-dot-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--status-present)' }}></span>}
                      <strong style={{ fontSize: '0.85rem', color: activeCheckIn ? 'var(--text-primary)' : 'var(--text-muted)' }}>{activeCheckIn ? elapsedTime : '00:00:00'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <button 
                  type="button" 
                  className={`btn-shift-action ${activeCheckIn ? 'checkout' : ''}`}
                  onClick={handleCheckInToggle}
                >
                  {activeCheckIn ? 'Check Out' : 'Check In'}
                </button>
              </div>
            </div>
          </div>

          {/* Middle Row: Attendance Summary + Leaves */}
          <div className="middle-dashboard-grid">
            <div className="card glass-card">
              <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <h3 style={{ fontSize: '1rem' }}>Attendance Summary</h3>
                  
                  <div className="nav-btn-group" style={{ display: 'inline-flex', gap: '0.25rem', alignItems: 'center', marginLeft: '0.5rem' }}>
                    <button type="button" className="btn btn-secondary btn-nav" style={{ padding: '0.2rem 0.5rem', minHeight: '28px' }} onClick={() => setMonthOffset(prev => prev - 1)} aria-label="Previous Month">◀</button>
                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold', minWidth: '90px', textAlign: 'center' }}>
                      {getMonthName(selectedMonth)} {selectedYear}
                    </span>
                    <button type="button" className="btn btn-secondary btn-nav" style={{ padding: '0.2rem 0.5rem', minHeight: '28px' }} onClick={() => setMonthOffset(prev => prev + 1)} aria-label="Next Month">▶</button>
                  </div>
                </div>

                <div className="sidebar-stats-pill" style={{ background: 'rgba(37, 99, 235, 0.05)', borderColor: 'rgba(37, 99, 235, 0.1)', cursor: 'default' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }} aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v3.5c0 1.66-1.34 3-3 3H9a3 3 0 0 1-3-3V8a6 6 0 0 1 6-6z"></path></svg>
                  <span>CC Points: </span>
                  <span className="sidebar-stats-val" style={{ marginLeft: '4px' }}>300</span>
                </div>
              </div>

              {/* Attendance pills */}
              <div className="metrics-pill-grid">
                <div className="metric-pill-card">
                  <div className="metric-icon-circle present">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  </div>
                  <div className="metric-pill-info">
                    <strong>{paySummary.presentDays}</strong>
                    <span>Present</span>
                  </div>
                </div>
                <div className="metric-pill-card">
                  <div className="metric-icon-circle leave">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                  </div>
                  <div className="metric-pill-info">
                    <strong>{paySummary.paidLeaveDays + paySummary.unpaidLeaveDays}</strong>
                    <span>Leaves</span>
                  </div>
                </div>
                <div className="metric-pill-card">
                  <div className="metric-icon-circle half">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  </div>
                  <div className="metric-pill-info">
                    <strong>{paySummary.missingDays}</strong>
                    <span>Half/Missing</span>
                  </div>
                </div>
                <div className="metric-pill-card">
                  <div className="metric-icon-circle weekend">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
                  </div>
                  <div className="metric-pill-info">
                    <strong>{weekendsCount}</strong>
                    <span>Weekends</span>
                  </div>
                </div>
              </div>

              {/* Grid Calendar */}
              <div className="calendar-glass-grid">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                
                {daysList.map((day) => {
                  const statusDot = getDateStatus(day, selectedMonth, selectedYear);
                  const isToday = selectedMonth === todayDate.getMonth() && selectedYear === todayDate.getFullYear() && day === todayDate.getDate();
                  
                  return (
                    <div key={day} className={`calendar-date-cell ${isToday ? 'today' : ''}`}>
                      <span>{day}</span>
                      <span className={`calendar-dot-marker ${statusDot}`}></span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Leaves */}
            <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <h3>Leaves</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Active Quota</span>
              </div>

              <div className="leaves-quota-grid">
                {leaveBalances.map((b) => {
                  const isPTO = b.type === 'PAID_TIME_OFF';
                  const percent = Math.round((b.remainingDays / b.allocatedDays) * 100);
                  
                  return (
                    <div key={b.type} className={`quota-glass-tile ${isPTO ? 'green' : 'purple'}`}>
                      <div className={`quota-icon-badge ${isPTO ? 'green' : 'purple'}`}>
                        {isPTO ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        )}
                      </div>
                      <div className="quota-info-stack" style={{ textAlign: 'left' }}>
                        <strong>{b.remainingDays} / {b.allocatedDays}</strong>
                        <span>{isPTO ? 'Paid Leave Days' : 'Sick Leave Days'}</span>
                        <div className="progress-container-bar" style={{ height: '4px', marginTop: '0.4rem', minWidth: '80px' }}>
                          <div 
                            className={`progress-filler-bar ${isPTO ? 'green' : ''}`}
                            style={{ 
                              width: `${percent}%`, 
                              background: isPTO ? 'var(--status-present)' : 'var(--accent-purple)' 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Recent Requests
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                  View All
                </span>
              </div>

              <div className="empty-state-card" style={{ flexGrow: 1, padding: '2rem' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.75rem' }} aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                <strong>No leave logs recorded.</strong>
                <span>All good! No leave requests yet.</span>
              </div>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
