import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type UserRole,
  mockGetDailyAttendanceSummary,
  mockGetMonthlyAttendanceSummary,
  mockCorrectAttendance,
  mockGetAttendanceAuditLog,
  type AttendanceCorrectionAudit,
} from '../mockApi';
import { showToast } from '../components/Toast';

interface AdminAttendanceViewProps {
  userRole: UserRole;
  userId: string;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PRESENT:  { label: 'Present',   color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  ABSENT:   { label: 'Absent',    color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  ON_LEAVE: { label: 'On Leave',  color: '#7c3aed', bg: 'rgba(124,58,237,0.1)' },
  HALF_DAY: { label: 'Half Day',  color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  MISSING:  { label: 'Missing',   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  WEEKEND:  { label: 'Weekend',   color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  HOLIDAY:  { label: 'Holiday',   color: '#0ea5e9', bg: 'rgba(14,165,233,0.1)' },
};

function fmtTime(iso?: string) {
  if (!iso) return '--:--';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtHours(h?: number) {
  if (h === undefined || h === null) return '—';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs + 'h ' + mins + 'm';
}

function toDatetimeLocal(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + pad(d.getMonth()+1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
}

function toISO(dtLocal: string) {
  return new Date(dtLocal).toISOString();
}

export default function AdminAttendanceView({ userRole, userId }: AdminAttendanceViewProps) {
  const [viewMode, setViewMode] = useState<'day' | 'month'>('day');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  const [dayData, setDayData] = useState<any[]>([]);
  const [monthData, setMonthData] = useState<any[]>([]);

  // Correction modal state
  const [correctionTarget, setCorrectionTarget] = useState<any>(null);
  const [corrCheckIn, setCorrCheckIn] = useState('');
  const [corrCheckOut, setCorrCheckOut] = useState('');
  const [corrReason, setCorrReason] = useState('');
  const [corrSaving, setCorrSaving] = useState(false);

  // Audit log drawer
  const [auditTarget, setAuditTarget] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AttendanceCorrectionAudit[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  // Sync month from offset
  useEffect(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    setSelectedMonth(d.getMonth());
    setSelectedYear(d.getFullYear());
  }, [monthOffset]);

  const loadDayData = useCallback(() => {
    setLoading(true);
    try {
      const data = mockGetDailyAttendanceSummary(userRole, selectedDate, debouncedQuery);
      setDayData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load attendance.', 'error');
    }
    setLoading(false);
  }, [userRole, selectedDate, debouncedQuery]);

  const loadMonthData = useCallback(() => {
    setLoading(true);
    try {
      const data = mockGetMonthlyAttendanceSummary(userRole, selectedMonth, selectedYear, debouncedQuery);
      setMonthData(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load attendance.', 'error');
    }
    setLoading(false);
  }, [userRole, selectedMonth, selectedYear, debouncedQuery]);

  useEffect(() => {
    if (viewMode === 'day') loadDayData();
    else loadMonthData();
  }, [viewMode, loadDayData, loadMonthData]);

  useEffect(() => {
    const handler = () => { if (viewMode === 'day') loadDayData(); else loadMonthData(); };
    window.addEventListener('hrms-attendance-update', handler);
    return () => window.removeEventListener('hrms-attendance-update', handler);
  }, [viewMode, loadDayData, loadMonthData]);

  // KPI aggregations for day view
  const totalEmp = dayData.length;
  const presentCount = dayData.filter(d => d.status === 'PRESENT').length;
  const onLeaveCount = dayData.filter(d => d.status === 'ON_LEAVE').length;
  const absentCount = dayData.filter(d => d.status === 'ABSENT').length;
  const missingCount = dayData.filter(d => d.status === 'MISSING').length;

  const openCorrectionModal = (row: any) => {
    setCorrectionTarget(row);
    setCorrCheckIn(toDatetimeLocal(row.checkIn) || '');
    setCorrCheckOut(toDatetimeLocal(row.checkOut) || '');
    setCorrReason('');
  };

  const closeCorrectionModal = () => {
    setCorrectionTarget(null);
    setCorrCheckIn('');
    setCorrCheckOut('');
    setCorrReason('');
  };

  const handleSaveCorrection = async () => {
    if (!correctionTarget?.attendanceId) {
      showToast('No attendance record found for this employee on this date. Cannot correct.', 'error');
      return;
    }
    if (!corrReason.trim() || corrReason.trim().length < 5) {
      showToast('Please enter a reason (minimum 5 characters).', 'error');
      return;
    }
    setCorrSaving(true);
    try {
      await mockCorrectAttendance(userId, userRole, correctionTarget.attendanceId, {
        checkInAt: corrCheckIn ? toISO(corrCheckIn) : undefined,
        checkOutAt: corrCheckOut ? toISO(corrCheckOut) : undefined,
        reason: corrReason.trim(),
      });
      showToast('Attendance corrected and audit log created.', 'success');
      window.dispatchEvent(new Event('hrms-attendance-update'));
      closeCorrectionModal();
    } catch (err: any) {
      showToast(err.message || 'Correction failed.', 'error');
    }
    setCorrSaving(false);
  };

  const openAuditDrawer = (attendanceId: string) => {
    try {
      const logs = mockGetAttendanceAuditLog(userRole, attendanceId);
      setAuditLogs(logs);
      setAuditTarget(attendanceId);
    } catch (err: any) {
      showToast(err.message || 'Failed to load audit log.', 'error');
    }
  };

  const canCorrect = userRole === 'ADMIN' || userRole === 'HR_OFFICER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>

      {/* Correction Modal */}
      {correctionTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card glass-card" style={{ padding: '1.75rem', maxWidth: '480px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem' }}>Correct Attendance</h3>
              <button type="button" onClick={closeCorrectionModal} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-secondary)' }} aria-label="Close"></button>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              <strong>{correctionTarget.name}</strong> · {correctionTarget.department} · {selectedDate}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Check In Time
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={corrCheckIn}
                  onChange={e => setCorrCheckIn(e.target.value)}
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Check Out Time
                </label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={corrCheckOut}
                  onChange={e => setCorrCheckOut(e.target.value)}
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                  Reason for Correction <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Describe why this correction is needed..."
                  value={corrReason}
                  onChange={e => setCorrReason(e.target.value)}
                  style={{ borderRadius: '8px', minHeight: '72px' }}
                />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Minimum 5 characters required. This creates an immutable audit log.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={closeCorrectionModal} style={{ minHeight: '38px' }}>Cancel</button>
                <button type="button" className="btn-submit-request" onClick={handleSaveCorrection} disabled={corrSaving} style={{ minHeight: '38px', padding: '0 1.5rem' }}>
                  {corrSaving ? 'Saving...' : 'Save Correction'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Drawer */}
      {auditTarget !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9998, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: '380px', background: 'white', height: '100%', overflowY: 'auto', padding: '1.5rem', boxShadow: '-8px 0 32px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontWeight: 800 }}>Audit Log</h3>
              <button type="button" onClick={() => { setAuditTarget(null); setAuditLogs([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }} aria-label="Close audit drawer"></button>
            </div>
            {auditLogs.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', textAlign: 'center', marginTop: '3rem' }}>No corrections recorded for this attendance entry.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {auditLogs.map(log => (
                  <div key={log.id} style={{ padding: '0.85rem', borderRadius: '10px', border: '1px solid var(--border-glass)', background: 'rgba(248,250,252,0.8)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase' }}>{log.field}</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', margin: '0 0 0.35rem 0' }}>
                      <span style={{ color: '#dc2626' }}>Before:</span> <strong>{log.oldValue}</strong>
                    </p>
                    <p style={{ fontSize: '0.8rem', margin: '0 0 0.35rem 0' }}>
                      <span style={{ color: '#16a34a' }}>After:</span> <strong>{log.newValue}</strong>
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>By: {log.changedByName}</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0.25rem 0 0 0', fontStyle: 'italic' }}>"{log.reason}"</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Attendance</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Manage and review employee attendance records.
        </p>
      </div>

      {/* Controls Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          {/* Search */}
          <div style={{ position: 'relative', minWidth: '240px', flexGrow: 1, maxWidth: '340px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              className="form-control"
              placeholder="Search employee, dept, ID..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '2.25rem', minHeight: '38px', borderRadius: '10px' }}
              aria-label="Search employees"
            />
          </div>

          {/* Date/Month Navigation */}
          {viewMode === 'day' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button type="button" onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer' }} aria-label="Previous day">◀</button>
              <input
                type="date"
                className="form-control"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                style={{ minHeight: '38px', borderRadius: '8px', cursor: 'pointer' }}
                aria-label="Select date"
              />
              <button type="button" onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer' }} aria-label="Next day">▶</button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button type="button" onClick={() => setMonthOffset(p => p - 1)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer' }} aria-label="Previous month">◀</button>
              <span style={{ fontWeight: 700, minWidth: '130px', textAlign: 'center', fontSize: '0.9rem' }}>{MONTH_NAMES[selectedMonth]} {selectedYear}</span>
              <button type="button" onClick={() => setMonthOffset(p => p + 1)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.35rem 0.6rem', cursor: 'pointer' }} aria-label="Next month">▶</button>
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.4)', borderRadius: '10px', padding: '0.2rem', border: '1px solid var(--border-glass)' }}>
          {(['day', 'month'] as const).map(mode => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              style={{
                padding: '0.4rem 1rem', borderRadius: '7px', border: 'none', cursor: 'pointer',
                fontWeight: 600, fontSize: '0.85rem',
                background: viewMode === mode ? 'white' : 'transparent',
                color: viewMode === mode ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: viewMode === mode ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              {mode === 'day' ? 'Day View' : 'Month View'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row (Day View only) */}
      {viewMode === 'day' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.85rem' }}>
          {[
            ['Total', totalEmp, 'var(--accent-primary)', 'rgba(37,99,235,0.08)'],
            ['Present', presentCount, '#16a34a', 'rgba(22,163,74,0.08)'],
            ['On Leave', onLeaveCount, '#7c3aed', 'rgba(124,58,237,0.08)'],
            ['Absent', absentCount, '#dc2626', 'rgba(220,38,38,0.08)'],
            ['Missing', missingCount, '#f59e0b', 'rgba(245,158,11,0.08)'],
          ].map(([label, value, color, bg]) => (
            <div key={label as string} className="card glass-card" style={{ padding: '1rem', textAlign: 'center', background: bg as string }}>
              <strong style={{ fontSize: '1.6rem', color: color as string, display: 'block' }}>{value}</strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{label as string}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Table */}
      <div className="card glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3,4].map(i => <div key={i} style={{ height: '44px', borderRadius: '8px', background: 'rgba(148,163,184,0.1)', animation: 'pulse 1.5s infinite' }} />)}
          </div>
        ) : viewMode === 'day' ? (
          dayData.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600 }}>No employee attendance records match your filters.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} aria-label="Daily attendance">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)', background: 'rgba(248,250,252,0.6)' }}>
                    {['Employee','Department','Status','Check In','Check Out','Work Hrs','Extra Hrs','Actions'].map(h => (
                      <th key={h} scope="col" style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dayData.map(row => {
                    const cfg = STATUS_CONFIG[row.status] ?? STATUS_CONFIG['ABSENT'];
                    return (
                      <tr key={row.employeeId} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '0.75rem' }}>
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>{row.name}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.loginId}</div>
                          </div>
                        </td>
                        <td style={{ padding: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{row.department}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: '1px solid ' + cfg.color + '33', whiteSpace: 'nowrap' }}>
                            ● {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: row.checkIn ? 'var(--text-primary)' : 'var(--text-muted)' }}>{fmtTime(row.checkIn)}</td>
                        <td style={{ padding: '0.75rem', color: row.checkOut ? 'var(--text-primary)' : 'var(--text-muted)' }}>{fmtTime(row.checkOut)}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600 }}>{row.workHours ? fmtHours(row.workHours) : '—'}</td>
                        <td style={{ padding: '0.75rem', color: (row.extraHours ?? 0) > 0 ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: (row.extraHours ?? 0) > 0 ? 600 : 400 }}>{row.extraHours ? fmtHours(row.extraHours) : '—'}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'nowrap' }}>
                            {row.attendanceId && (
                              <button type="button" onClick={() => openAuditDrawer(row.attendanceId)} style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }} aria-label={'View audit log for ' + row.name}>
                                Log
                              </button>
                            )}
                            {canCorrect && (
                              <button type="button" onClick={() => openCorrectionModal(row)} style={{ padding: '0.25rem 0.6rem', borderRadius: '6px', border: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.06)', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }} aria-label={'Correct attendance for ' + row.name}>
                                Correct
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // Month View
          monthData.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 600 }}>No records match your filters for {MONTH_NAMES[selectedMonth]} {selectedYear}.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} aria-label="Monthly attendance summary">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)', background: 'rgba(248,250,252,0.6)' }}>
                    {['Employee','Dept','Present','Half','Leave','Absent','Missing','Work Hrs','Extra Hrs','Payable Days'].map(h => (
                      <th key={h} scope="col" style={{ padding: '0.65rem 0.75rem', textAlign: h === 'Employee' || h === 'Dept' ? 'left' : 'center', color: 'var(--text-secondary)', fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthData.map(row => (
                    <tr key={row.employeeId} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{row.name}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{row.loginId}</div>
                        </div>
                      </td>
                      <td style={{ padding: '0.65rem 0.75rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{row.department}</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>{row.presentDays}</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#d97706', fontWeight: 700 }}>{row.halfDays}</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#7c3aed', fontWeight: 700 }}>{row.paidLeaveDays}</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#dc2626', fontWeight: 700 }}>{row.absentDays}</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: '#f59e0b', fontWeight: 700 }}>{row.missingDays}</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', fontWeight: 600 }}>{row.totalWorkHours}h</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center', color: row.totalExtraHours > 0 ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: row.totalExtraHours > 0 ? 600 : 400 }}>{row.totalExtraHours}h</td>
                      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>
                        <strong style={{ color: 'var(--accent-primary)', fontSize: '0.95rem' }}>{row.payableDays}</strong>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }`}</style>
    </div>
  );
}
