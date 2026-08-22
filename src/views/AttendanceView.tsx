import { useState, useEffect } from 'react';
import { 
  type Attendance, 
  type Employee, 
  type UserRole, 
  getStoredData, 
  mockGetEmployeeById, 
  mockGetTimeOffBalances, 
  mockCheckIn, 
  mockCheckOut, 
  mockGetPayableDaysSummary,
  mockGetDailyAttendanceSummary
} from '../mockApi';
import { showToast } from '../components/Toast';

interface AttendanceViewProps {
  employeeId: string;
  userRole: UserRole;
}

export default function AttendanceView({ employeeId, userRole }: AttendanceViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'personal' | 'company'>('personal');
  const [monthOffset, setMonthOffset] = useState(0); // Offset from current month
  const [companyLogs, setCompanyLogs] = useState<any[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  
  // Dashboard states
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveBalances, setLeaveBalances] = useState<any[]>([]);
  const [activeCheckIn, setActiveCheckIn] = useState<Attendance | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');

  // Load Date variables
  const getOffsetDate = (offset: number) => {
    const d = new Date();
    d.setMonth(d.getMonth() + offset);
    return d;
  };

  const currentDate = getOffsetDate(monthOffset);
  const selectedMonth = currentDate.getMonth();
  const selectedYear = currentDate.getFullYear();

  // Load employee check-in details
  const syncCheckIn = () => {
    const logs = getStoredData<Attendance>('hrms_attendance');
    const today = new Date().toISOString().split('T')[0];
    const active = logs.find(a => a.employeeId === employeeId && a.date === today && !a.checkOutAt);
    setActiveCheckIn(active || null);
  };

  const loadDashboardData = () => {
    try {
      // 1. Get employee info
      const emp = mockGetEmployeeById(employeeId, userRole, employeeId) as Employee;
      setEmployee(emp || null);

      // 2. Get leave balances
      const bals = mockGetTimeOffBalances(employeeId);
      setLeaveBalances(bals);

      // 3. Load company log today
      if (userRole !== 'EMPLOYEE') {
        const todayStr = new Date().toISOString().split('T')[0];
        const companyToday = mockGetDailyAttendanceSummary(userRole, todayStr);
        setCompanyLogs(companyToday);
      }
    } catch (err) {
      console.error(err);
    }
  };

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

  // Clock Session Timer
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

  // Helper calculations for calendar grids
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

    return 'yellow'; // Absent for past missing days
  };

  const getMonthName = (monthIdx: number) => {
    return new Date(2026, monthIdx, 1).toLocaleString('default', { month: 'long' });
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Stats summaries
  const paySummary = mockGetPayableDaysSummary(employeeId, selectedMonth, selectedYear);
  
  // Calculate total weekends in month dynamically
  let weekendsCount = 0;
  const daysList = getDaysInMonth(selectedMonth, selectedYear);
  daysList.forEach((day) => {
    const d = new Date(selectedYear, selectedMonth, day);
    const dayOfWeek = d.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) weekendsCount++;
  });

  const attendancePercent = paySummary.totalWorkingDays > 0
    ? Math.round(((paySummary.presentDays + paySummary.paidLeaveDays) / paySummary.totalWorkingDays) * 100)
    : 85;

  const showCompanyTab = userRole !== 'EMPLOYEE';
  const todayDate = new Date();

  return (
    <div className="dashboard-wrapper">
      {/* Subtab navigation */}
      {showCompanyTab && (
        <div className="tab-navigation" style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', padding: '0.25rem', border: '1px solid var(--border-glass)', display: 'inline-flex' }}>
          <button 
            type="button" 
            className={`tab-btn ${activeSubTab === 'personal' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('personal')}
            style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
            Home Dashboard
          </button>
          <button 
            type="button" 
            className={`tab-btn ${activeSubTab === 'company' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('company')}
            style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Live Company Logs (Today)
          </button>
        </div>
      )}

      {activeSubTab === 'personal' ? (
        /* ==========================================================================
           ADVANCED WHITE GLASS DASHBOARD PERSONAL PORT
           ========================================================================== */
        <>
          {/* Top Row: Hero Greeting + Shift timings */}
          <div className="hero-weather-grid">
            {/* User welcome panel */}
            <div className="card glass-card hero-glass-greeting">
              <div className="user-badge-profile">
                <div className="hero-avatar-sy">
                  {employee?.firstName.substring(0, 2).toUpperCase() || 'SY'}
                </div>
                <div className="hero-welcome-info">
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

              {/* Weather widget */}
              <div className="weather-details-section" style={{ marginLeft: 'auto', borderLeft: '1px solid var(--border-glass)', paddingLeft: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="weather-details-left">
                  <span className="temp">22°C</span>
                  <span className="label">Rainy</span>
                  <span className="date">{getMonthName(todayDate.getMonth())} {todayDate.getFullYear()}</span>
                </div>
                <span className="weather-icon-cloud" style={{ color: 'var(--text-secondary)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25"></path><line x1="8" y1="16" x2="8" y2="22"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="16" y1="16" x2="16" y2="22"></line></svg>
                </span>
              </div>
            </div>

            {/* Shift timer card */}
            <div className="card glass-card shift-timing-container">
              <div className="shift-timing-details">
                <div className="shift-info-row">
                  <span className="shift-icon-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                  </span>
                  <div className="shift-text-stack">
                    <span>Shift Timing</span>
                    <strong>09:00 AM - 06:00 PM</strong>
                  </div>
                </div>
                <div className="shift-info-row">
                  <span className="shift-icon-wrapper">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 15 15"></polyline></svg>
                  </span>
                  <div className="shift-text-stack">
                    <span>Hours Worked</span>
                    <div className={`shift-timer-row ${activeCheckIn ? '' : 'offline'}`}>
                      <span className="indicator-dot-pulse"></span>
                      <strong>{activeCheckIn ? elapsedTime : '00:00:00'}</strong>
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
            
            {/* Left: Attendance Summary */}
            <div className="card glass-card">
              <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
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
                  <select className="form-control" style={{ minHeight: '28px', fontSize: '0.8rem', padding: '0 0.5rem', width: 'auto' }} aria-label="View format">
                    <option>Monthly</option>
                  </select>
                </div>

                {/* CC Points Badge */}
                <div className="sidebar-stats-pill" style={{ background: 'rgba(37, 99, 235, 0.05)', borderColor: 'rgba(37, 99, 235, 0.1)', cursor: 'default' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }} aria-hidden="true"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M12 2a6 6 0 0 1 6 6v3.5c0 1.66-1.34 3-3 3H9a3 3 0 0 1-3-3V8a6 6 0 0 1 6-6z"></path></svg>
                  <span>CC Points: </span>
                  <span className="sidebar-stats-val" style={{ marginLeft: '4px' }}>300</span>
                </div>
              </div>

              {/* Attendance metrics */}
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

              {/* Grid Calendar with centered dots */}
              <div className="calendar-glass-grid">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
                
                {/* Dynamically render days */}
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

            {/* Right: Leaves Card */}
            <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                  <h3>Leaves</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Active Quota</span>
              </div>

              {/* Leaves quota bars */}
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
                      <div className="quota-info-stack">
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

              {/* Recent leaves requests empty state */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Recent Requests
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                  View All
                </span>
              </div>

              <div className="empty-state-card" style={{ flexGrow: 1 }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.75rem' }} aria-hidden="true"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path></svg>
                <strong>No leave logs recorded.</strong>
                <span>All good! No leave requests yet.</span>
              </div>
            </div>
          </div>

          {/* Bottom Card Grids */}
          <div className="bottom-summary-grid">
            
            {/* Card 1: Monthly Overview */}
            <div className="card glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Monthly Overview
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Working Days</div>
              
              <div className="summary-flex-row">
                <span className="summary-big-stat">
                  {paySummary.presentDays} / {paySummary.totalWorkingDays}
                </span>
                <span className="summary-percent-lbl">
                  {paySummary.totalWorkingDays > 0 ? Math.round((paySummary.presentDays / paySummary.totalWorkingDays) * 100) : 14}%
                </span>
              </div>
              <div className="progress-container-bar">
                <div 
                  className="progress-filler-bar" 
                  style={{ 
                    width: `${paySummary.totalWorkingDays > 0 ? (paySummary.presentDays / paySummary.totalWorkingDays) * 100 : 14}%` 
                  }}
                ></div>
              </div>
            </div>

            {/* Card 2: Attendance Trend */}
            <div className="card glass-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Attendance Trend
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>This Month</div>

              <div className="summary-flex-row">
                <span className="summary-big-stat">{attendancePercent}%</span>
                <span className="trend-arrow-badge">▲ 5%</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
                Attendance Rate
              </div>
            </div>

            {/* Card 3: Upcoming Holidays */}
            <div className="card glass-card upcoming-holiday-card">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Upcoming Holidays
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Next Holiday</div>
                
                <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-primary)', marginTop: '0.5rem' }}>
                  15 Aug 2026
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Independence Day
                </span>
              </div>

              {/* Indian flag illustration in pure CSS */}
              <div className="indian-flag-css-illustration" title="Indian Flag">
                <div className="flag-stripe orange"></div>
                <div className="flag-stripe white">
                  <div className="ashok-chakra-icon">✹</div>
                </div>
                <div className="flag-stripe green"></div>
              </div>
            </div>

            {/* Card 4: Profile Completion */}
            <div className="card glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>
                    Profile Completion
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Keep Going!</div>
                
                <span className="summary-big-stat" style={{ display: 'block', marginTop: '0.5rem' }}>85%</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed</span>
              </div>

              {/* Dotted progress arc completed */}
              <div className="dotted-arc-progress">
                <svg className="dotted-circle-svg" width="70" height="70">
                  <circle className="circle-dotted-bg" cx="35" cy="35" r="28"></circle>
                  <circle 
                    className="circle-dotted-progress" 
                    cx="35" 
                    cy="35" 
                    r="28"
                    strokeDasharray="176"
                    strokeDashoffset={176 - (176 * 85) / 100}
                  ></circle>
                </svg>
                <div style={{ position: 'absolute', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--accent-secondary)' }}>
                  85%
                </div>
              </div>
            </div>

          </div>
        </>
      ) : (
        /* ==========================================================================
           COMPANY LOG VIEW (MONITORING STATS)
           ========================================================================== */
        <div className="company-monitoring">
          <div className="grid-3 stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="card glass-card stat-card present" style={{ borderLeft: '4px solid var(--status-present)' }}>
              <div className="stat-num" style={{ fontSize: '2rem', fontWeight: '800' }}>
                {companyLogs.filter(c => c.status === 'PRESENT').length}
              </div>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                🟢 Present Today
              </div>
            </div>
            <div className="card glass-card stat-card leave" style={{ borderLeft: '4px solid var(--accent-purple)' }}>
              <div className="stat-num" style={{ fontSize: '2rem', fontWeight: '800' }}>
                {companyLogs.filter(c => c.status === 'ON_LEAVE').length}
              </div>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                ✈️ On Leave Today
              </div>
            </div>
            <div className="card glass-card stat-card absent" style={{ borderLeft: '4px solid var(--status-absent)' }}>
              <div className="stat-num" style={{ fontSize: '2rem', fontWeight: '800' }}>
                {companyLogs.filter(c => c.status === 'ABSENT').length}
              </div>
              <div className="stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                🟡 Absent Today
              </div>
            </div>
          </div>

          <div className="card glass-card list-card">
            <div className="monitoring-header">
              <h3>Employee Attendance Log</h3>
              <div className="header-search-bar" style={{ maxWidth: '320px', width: '100%' }}>
                <span className="search-icon-glass">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </span>
                <input 
                  type="search" 
                  className="form-control" 
                  placeholder="Search by name, department..."
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Name</th>
                    <th>Department</th>
                    <th>Position</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Hours Worked</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {companyLogs
                    .filter(log =>
                      log.name.toLowerCase().includes(companySearch.toLowerCase()) ||
                      log.loginId.toLowerCase().includes(companySearch.toLowerCase()) ||
                      log.department.toLowerCase().includes(companySearch.toLowerCase())
                    )
                    .map((log) => (
                      <tr key={log.employeeId}>
                        <td><code>{log.loginId}</code></td>
                        <td><strong>{log.name}</strong></td>
                        <td>{log.department}</td>
                        <td>{log.jobPosition}</td>
                        <td>{formatTime(log.checkIn)}</td>
                        <td>{formatTime(log.checkOut)}</td>
                        <td>{log.workHours ? `${log.workHours} hrs` : '--'}</td>
                        <td>
                          {log.status === 'PRESENT' && <span className="badge badge-present">Present</span>}
                          {log.status === 'ON_LEAVE' && <span className="badge badge-leave">On Leave</span>}
                          {log.status === 'ABSENT' && <span className="badge badge-absent">Absent</span>}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
