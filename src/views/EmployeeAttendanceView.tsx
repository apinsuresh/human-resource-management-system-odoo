import { useState, useEffect, useCallback } from 'react';
import {
  type Attendance,
  mockCheckIn,
  mockCheckOut,
  mockGetPayableDaysSummary,
  mockGetAttendanceHistory,
  getStoredData,
} from '../mockApi';
import { showToast } from '../components/Toast';

interface EmployeeAttendanceViewProps {
  employeeId: string;
  employeeName: string;
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
  if (!h) return '0h 0m';
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return hrs + 'h ' + mins + 'm';
}

export default function EmployeeAttendanceView({ employeeId, employeeName: _employeeName }: EmployeeAttendanceViewProps) {
  const [activeCheckIn, setActiveCheckIn] = useState<Attendance | null>(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [historyLogs, setHistoryLogs] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('hrms_attendance_settings');
      if (raw) setSettings(JSON.parse(raw));
    } catch { }
  }, []);

  useEffect(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + monthOffset);
    setSelectedMonth(d.getMonth());
    setSelectedYear(d.getFullYear());
  }, [monthOffset]);

  const loadLogs = useCallback(() => {
    setLoading(true);
    try {
      const logs = mockGetAttendanceHistory(employeeId, selectedMonth, selectedYear);
      setHistoryLogs(logs.sort((a, b) => b.date.localeCompare(a.date)));
    } catch { }
    setLoading(false);
  }, [employeeId, selectedMonth, selectedYear]);

  const syncCheckIn = useCallback(() => {
    const all = getStoredData<Attendance>('hrms_attendance');
    const today = new Date().toISOString().split('T')[0];
    const rec = all.find((a: Attendance) => a.employeeId === employeeId && a.date === today && !a.checkOutAt);
    setActiveCheckIn(rec || null);
  }, [employeeId]);

  useEffect(() => {
    loadLogs();
    syncCheckIn();
    const handler = () => { loadLogs(); syncCheckIn(); };
    window.addEventListener('hrms-attendance-update', handler);
    return () => window.removeEventListener('hrms-attendance-update', handler);
  }, [loadLogs, syncCheckIn]);

  useEffect(() => {
    if (!activeCheckIn?.checkInAt) { setElapsedTime('00:00:00'); return; }
    const tick = setInterval(() => {
      const diff = Date.now() - new Date(activeCheckIn.checkInAt!).getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const p = (n: number) => String(n).padStart(2, '0');
      setElapsedTime(p(h) + ':' + p(m) + ':' + p(s));
    }, 1000);
    return () => clearInterval(tick);
  }, [activeCheckIn]);

  const handleCheckInOut = async () => {
    setCheckingIn(true);
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
      showToast(err.message || 'Action failed.', 'error');
    }
    setCheckingIn(false);
  };

  const summary = mockGetPayableDaysSummary(employeeId, selectedMonth, selectedYear);
  const isCurrentMonth = monthOffset === 0;
  // employeeName is available for parent-level aria-labels if needed

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>Attendance</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Your personal attendance records and shift timings.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem', textAlign: 'center', gap: '1rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: activeCheckIn ? 'rgba(22,163,74,0.1)' : 'rgba(37,99,235,0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid ' + (activeCheckIn ? '#16a34a' : 'var(--accent-primary)'),
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke={activeCheckIn ? '#16a34a' : 'var(--accent-primary)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div>
            <span style={{
              display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: '20px',
              fontSize: '0.75rem', fontWeight: 700,
              background: activeCheckIn ? 'rgba(22,163,74,0.1)' : 'rgba(148,163,184,0.1)',
              color: activeCheckIn ? '#16a34a' : 'var(--text-secondary)',
              marginBottom: '0.5rem'
            }}>
              {activeCheckIn ? '● ON DUTY' : '● CHECKED OUT'}
            </span>
            {activeCheckIn && (
              <>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Checked in at: <strong>{fmtTime(activeCheckIn.checkInAt)}</strong>
                </p>
                <p style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'monospace', color: 'var(--text-primary)', margin: '0.5rem 0' }}>
                  {elapsedTime}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Working time</p>
              </>
            )}
            {!activeCheckIn && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {historyLogs[0]?.checkOutAt ? 'Last checkout: ' + fmtTime(historyLogs[0].checkOutAt) : 'Ready to check in'}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleCheckInOut}
            disabled={checkingIn}
            aria-label={activeCheckIn ? 'Check out' : 'Check in'}
            style={{
              padding: '0.75rem 2rem', borderRadius: '10px', border: 'none',
              fontWeight: 700, fontSize: '0.9rem', cursor: checkingIn ? 'not-allowed' : 'pointer',
              background: activeCheckIn ? 'linear-gradient(135deg,#dc2626,#b91c1c)' : 'linear-gradient(135deg,var(--accent-primary),var(--accent-secondary))',
              color: 'white', minWidth: '140px',
            }}
          >
            {checkingIn ? 'Loading...' : activeCheckIn ? 'Check Out' : 'Check In'}
          </button>
        </div>

        <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
          <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Shift Information</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          {[
            ['Shift Hours', (settings?.checkInTime ?? '09:00 AM') + ' – ' + (settings?.checkOutTime ?? '06:00 PM')],
            ['Working Hours', '8 hours / day'],
            ['Break Duration', (settings?.breakDurationMins ?? 60) + ' minutes'],
            ['Grace Period', (settings?.gracePeriodMins ?? 15) + ' minutes'],
            ['Working Days', (settings?.workingDays ?? ['Mon','Tue','Wed','Thu','Fri']).join(', ')],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
              <strong style={{ color: 'var(--text-primary)', textAlign: 'right', maxWidth: '60%' }}>{value}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="card glass-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Monthly Summary</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button type="button" onClick={() => setMonthOffset(p => p - 1)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: 'pointer' }} aria-label="Previous month">◀</button>
            <span style={{ fontWeight: 700, minWidth: '130px', textAlign: 'center', fontSize: '0.9rem' }}>{MONTH_NAMES[selectedMonth]} {selectedYear}</span>
            <button type="button" onClick={() => setMonthOffset(p => p + 1)} disabled={isCurrentMonth} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.3rem 0.6rem', cursor: isCurrentMonth ? 'not-allowed' : 'pointer', opacity: isCurrentMonth ? 0.4 : 1 }} aria-label="Next month">▶</button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.85rem' }}>
          {([
            ['Present', summary.presentDays, '#16a34a', 'rgba(22,163,74,0.08)'],
            ['Half Days', summary.halfDays, '#d97706', 'rgba(217,119,6,0.08)'],
            ['Paid Leave', summary.paidLeaveDays, '#7c3aed', 'rgba(124,58,237,0.08)'],
            ['Absent', summary.absentDays, '#dc2626', 'rgba(220,38,38,0.08)'],
            ['Missing', summary.missingDays, '#f59e0b', 'rgba(245,158,11,0.08)'],
            ['Weekends', summary.weekendDays, '#94a3b8', 'rgba(148,163,184,0.08)'],
            ['Work Hours', summary.totalWorkHours + 'h', 'var(--accent-primary)', 'rgba(37,99,235,0.08)'],
            ['Extra Hours', summary.totalExtraHours + 'h', '#0ea5e9', 'rgba(14,165,233,0.08)'],
          ] as [string, string|number, string, string][]).map(([label, value, color, bg]) => (
            <div key={label} style={{ background: bg, borderRadius: '10px', padding: '0.85rem 0.75rem', textAlign: 'center', border: '1px solid ' + color + '22' }}>
              <strong style={{ fontSize: '1.35rem', color, display: 'block', lineHeight: 1.2 }}>{value}</strong>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.2rem', display: 'block', fontWeight: 600 }}>{label}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '1.25rem', padding: '0.85rem 1rem', borderRadius: '10px', background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700 }}>PAYABLE DAYS THIS MONTH</span>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>Present + Paid Leave (Half days count as 0.5)</p>
          </div>
          <strong style={{ fontSize: '2rem', color: 'var(--accent-primary)' }}>{summary.payableDays}</strong>
        </div>
      </div>

      <div className="card glass-card">
        <div style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Attendance History</h3>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{MONTH_NAMES[selectedMonth]} {selectedYear}</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[1,2,3].map(i => <div key={i} style={{ height: '44px', borderRadius: '8px', background: 'rgba(148,163,184,0.1)' }} />)}
          </div>
        ) : historyLogs.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: 600 }}>No attendance records for this period</p>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} aria-label="Attendance history">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)' }}>
                    {['Date','Status','Check In','Check Out','Work Hours','Extra Hours'].map(h => (
                      <th key={h} scope="col" style={{ padding: '0.65rem 0.75rem', textAlign: h.includes('Hours') ? 'right' : 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {historyLogs.map(log => {
                    const cfg = STATUS_CONFIG[log.status] ?? STATUS_CONFIG['PRESENT'];
                    return (
                      <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '0.75rem' }}>{new Date(log.date + 'T12:00:00').toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: '1px solid ' + cfg.color + '33' }}>
                            ● {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem' }}>{fmtTime(log.checkInAt)}</td>
                        <td style={{ padding: '0.75rem' }}>{fmtTime(log.checkOutAt)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 600 }}>{fmtHours(log.workHours)}</td>
                        <td style={{ padding: '0.75rem', textAlign: 'right', color: (log.extraHours ?? 0) > 0 ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: (log.extraHours ?? 0) > 0 ? 600 : 400 }}>{fmtHours(log.extraHours)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
