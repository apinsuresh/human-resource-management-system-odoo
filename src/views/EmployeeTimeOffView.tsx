import React, { useState, useEffect, useCallback } from 'react';
import {
  type TimeOffBalance,
  type TimeOffRequest,
  type LeaveTypeConfig,
  mockGetTimeOffBalances,
  mockGetLeaveRequests,
  mockGetLeaveTypes,
  mockSubmitTimeOffRequest,
  mockCancelLeaveRequest,
  mockCalculateWorkingDays,
  mockGetCompanyHolidays,
} from '../mockApi';
import { showToast } from '../components/Toast';

interface EmployeeTimeOffViewProps {
  employeeId: string;
  employeeName: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  APPROVED: { label: 'Approved', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  CANCELLED: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export default function EmployeeTimeOffView({ employeeId, employeeName }: EmployeeTimeOffViewProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'calendar'>('history');
  const [balances, setBalances] = useState<TimeOffBalance[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [leaveType, setLeaveType] = useState<string>('PAID_TIME_OFF');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'FIRST_HALF' | 'SECOND_HALF'>('FIRST_HALF');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calculatedDays, setCalculatedDays] = useState(1);
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter State
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Cancel Modal State
  const [cancelTarget, setCancelTarget] = useState<TimeOffRequest | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const bList = mockGetTimeOffBalances(employeeId);
      const rList = mockGetLeaveRequests(employeeId, 'EMPLOYEE');
      const tList = mockGetLeaveTypes().filter(t => t.isActive);
      setBalances(bList);
      setRequests(rList);
      setLeaveTypes(tList);
      if (tList.length > 0 && !leaveType) {
        setLeaveType(tList[0].code);
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load leave data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [employeeId, leaveType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Live calculation of days
  useEffect(() => {
    if (isHalfDay) {
      setCalculatedDays(0.5);
      if (startDate && !endDate) {
        setEndDate(startDate);
      }
    } else if (startDate && endDate) {
      const days = mockCalculateWorkingDays(startDate, endDate, false);
      setCalculatedDays(days);
    } else {
      setCalculatedDays(1);
    }
  }, [startDate, endDate, isHalfDay]);

  const selectedTypeConfig = leaveTypes.find(t => t.code === leaveType);
  const selectedBalance = balances.find(b => b.type === leaveType);

  const availableBalance = selectedBalance
    ? Math.max(0, selectedBalance.remainingDays - (selectedBalance.pendingDays || 0))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || (!endDate && !isHalfDay)) {
      showToast('Please select valid start and end dates.', 'error');
      return;
    }

    if (!reason.trim()) {
      showToast('Please provide a reason for your leave request.', 'error');
      return;
    }

    const docThreshold = selectedTypeConfig?.docRequiredThresholdDays ?? 2;
    if (docThreshold > 0 && calculatedDays > docThreshold && !attachmentUrl) {
      showToast(`A document attachment is required for requests exceeding ${docThreshold} days.`, 'error');
      return;
    }

    setSubmitting(true);
    try {
      await mockSubmitTimeOffRequest(employeeId, {
        type: leaveType,
        startDate,
        endDate: isHalfDay ? startDate : endDate,
        allocationDays: calculatedDays,
        isHalfDay,
        halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
        attachmentUrl: attachmentUrl || undefined,
        reason: reason.trim(),
      });

      showToast('Time off request submitted successfully!', 'success');
      setShowRequestModal(false);
      resetForm();
      loadData();
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err: any) {
      showToast(err.message || 'Failed to submit leave request.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setIsHalfDay(false);
    setHalfDayPeriod('FIRST_HALF');
    setReason('');
    setAttachmentUrl('');
    setCalculatedDays(1);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds maximum 5 MB limit.', 'error');
      return;
    }
    setAttachmentUrl(`mock-storage/${file.name}`);
    showToast(`Uploaded document: ${file.name}`, 'success');
  };

  const handleConfirmCancel = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await mockCancelLeaveRequest(employeeId, 'EMPLOYEE', cancelTarget.id, cancelReason);
      showToast('Leave request cancelled successfully.', 'success');
      setCancelTarget(null);
      setCancelReason('');
      loadData();
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel request.', 'error');
    } finally {
      setCancelling(false);
    }
  };

  // Filtering history
  const filteredRequests = requests.filter(r => {
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    return true;
  });

  // Calendar Helpers
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const holidays = mockGetCompanyHolidays();

  const prevMonth = () => setCalendarDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(year, month + 1, 1));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', textAlign: 'left' }}>

      {/* Header & Main Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Time Off
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Welcome back, {employeeName}. Manage your time off requests and view leave balances.
          </p>
        </div>

        <button
          type="button"
          className="btn-submit-request"
          onClick={() => setShowRequestModal(true)}
          style={{ height: '42px', padding: '0 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderRadius: '10px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Request Time Off
        </button>
      </div>

      {/* Leave Balance Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {balances.map(bal => {
          const cfg = leaveTypes.find(t => t.code === bal.type);
          const name = cfg?.name || bal.type.replace(/_/g, ' ');
          const allocated = bal.allocatedDays;
          const used = bal.usedDays;
          const pending = bal.pendingDays || 0;
          const available = Math.max(0, bal.remainingDays - pending);
          const percentUsed = allocated > 0 ? Math.min(100, Math.round((used / allocated) * 100)) : 0;

          return (
            <div key={bal.type} className="card glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem', border: '1px solid var(--border-glass)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {name}
                  </span>
                  {cfg?.isPaid ? (
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(22,163,74,0.1)', color: '#16a34a', fontWeight: 700 }}>
                      Paid
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: 'rgba(148,163,184,0.1)', color: '#64748b', fontWeight: 700 }}>
                      Unpaid
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginTop: '0.25rem' }}>
                  <strong style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-primary)', lineHeight: 1 }}>
                    {available}
                  </strong>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    Days Available
                  </span>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <span>Allocated: {allocated}d</span>
                  <span>Used: {used}d {pending > 0 ? `(${pending}d pending)` : ''}</span>
                </div>
                <div style={{ width: '100%', height: '6px', background: 'rgba(148,163,184,0.15)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${percentUsed}%`, height: '100%', background: percentUsed > 85 ? '#dc2626' : 'var(--accent-primary)', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Tabs Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.5)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '0.45rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem',
              background: activeTab === 'history' ? 'white' : 'transparent',
              color: activeTab === 'history' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'history' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            My Time Off History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('calendar')}
            style={{
              padding: '0.45rem 1.25rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.85rem',
              background: activeTab === 'calendar' ? 'white' : 'transparent',
              color: activeTab === 'calendar' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              boxShadow: activeTab === 'calendar' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            Leave Calendar
          </button>
        </div>

        {activeTab === 'history' && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ minHeight: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '130px' }}
              aria-label="Filter by Status"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <select
              className="form-control"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ minHeight: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '150px' }}
              aria-label="Filter by Type"
            >
              <option value="ALL">All Leave Types</option>
              {leaveTypes.map(t => (
                <option key={t.code} value={t.code}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tab 1: History Table */}
      {activeTab === 'history' && (
        <div className="card glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '48px', borderRadius: '8px', background: 'rgba(148,163,184,0.1)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '0.75rem', opacity: 0.4 }} aria-hidden="true">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>No time off requests found</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                {requests.length === 0 ? 'You have not submitted any leave requests yet.' : 'No records match your selected filters.'}
              </p>
              {requests.length === 0 && (
                <button
                  type="button"
                  className="btn-submit-request"
                  onClick={() => setShowRequestModal(true)}
                  style={{ marginTop: '1rem', height: '36px', padding: '0 1.25rem', fontSize: '0.8rem' }}
                >
                  Request Time Off
                </button>
              )}
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} aria-label="My time off history">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)', background: 'rgba(248,250,252,0.6)' }}>
                    {['Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status', 'Submitted On', 'Actions'].map(h => (
                      <th key={h} scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map(req => {
                    const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG['PENDING'];
                    const lt = leaveTypes.find(t => t.code === req.type);

                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{lt?.name || req.type.replace(/_/g, ' ')}</strong>
                          {req.isHalfDay && (
                            <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--accent-primary)', fontWeight: 600 }}>
                              Half Day ({req.halfDayPeriod === 'FIRST_HALF' ? '1st Half' : '2nd Half'})
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>{req.startDate}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{req.endDate}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{req.allocationDays} {req.allocationDays === 1 ? 'day' : 'days'}</strong>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', maxWidth: '200px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={req.reason}>
                            {req.reason || '—'}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33` }}>
                            ● {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            {req.attachmentUrl && (
                              <button
                                type="button"
                                onClick={() => showToast('Opening attachment document...', 'info')}
                                style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'transparent', cursor: 'pointer', fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: 600 }}
                              >
                                Doc
                              </button>
                            )}
                            {req.status === 'PENDING' && (
                              <button
                                type="button"
                                onClick={() => setCancelTarget(req)}
                                style={{ padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid rgba(220,38,38,0.2)', background: 'rgba(220,38,38,0.06)', cursor: 'pointer', fontSize: '0.72rem', color: '#dc2626', fontWeight: 600 }}
                              >
                                Cancel
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
          )}
        </div>
      )}

      {/* Tab 2: Leave Calendar */}
      {activeTab === 'calendar' && (
        <div className="card glass-card" style={{ padding: '1.5rem' }}>
          {/* Calendar Month Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
              {MONTH_NAMES[month]} {year}
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button type="button" onClick={prevMonth} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontWeight: 700 }} aria-label="Previous month">◀</button>
              <button type="button" onClick={() => setCalendarDate(new Date())} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>Today</button>
              <button type="button" onClick={nextMonth} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.35rem 0.75rem', cursor: 'pointer', fontWeight: 700 }} aria-label="Next month">▶</button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center' }}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} style={{ padding: '0.5rem', fontWeight: 700, fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                {d}
              </div>
            ))}

            {/* Empty offset cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} style={{ height: '70px', borderRadius: '8px', background: 'rgba(248,250,252,0.3)', border: '1px solid transparent' }} />
            ))}

            {/* Month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dObj = new Date(year, month, dayNum);
              const isWeekend = dObj.getDay() === 0 || dObj.getDay() === 6;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              const hol = holidays.find(h => h.date === dateStr);
              const dayReqs = requests.filter(r => r.status !== 'CANCELLED' && r.status !== 'REJECTED' && dateStr >= r.startDate && dateStr <= r.endDate);

              return (
                <div
                  key={dayNum}
                  style={{
                    height: '70px', borderRadius: '8px', padding: '0.35rem',
                    background: isToday ? 'rgba(37,99,235,0.06)' : isWeekend ? 'rgba(241,245,249,0.5)' : 'white',
                    border: isToday ? '2px solid var(--accent-primary)' : '1px solid var(--border-glass)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'left'
                  }}
                >
                  <span style={{ fontSize: '0.8rem', fontWeight: isToday ? 800 : 600, color: isWeekend ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                    {dayNum}
                  </span>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                    {hol && (
                      <span style={{ fontSize: '0.65rem', padding: '1px 3px', borderRadius: '4px', background: 'rgba(14,165,233,0.12)', color: '#0ea5e9', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={hol.name}>
                        {hol.name}
                      </span>
                    )}

                    {dayReqs.map(r => (
                      <span
                        key={r.id}
                        style={{
                          fontSize: '0.65rem', padding: '1px 4px', borderRadius: '4px',
                          background: r.status === 'APPROVED' ? 'rgba(22,163,74,0.15)' : 'rgba(217,119,6,0.15)',
                          color: r.status === 'APPROVED' ? '#16a34a' : '#d97706',
                          fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}
                        title={`${r.type.replace(/_/g, ' ')} (${r.status})`}
                      >
                        ● {r.status === 'APPROVED' ? 'On Leave' : 'Pending'}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.25rem', borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#16a34a' }} /> Approved Leave
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#d97706' }} /> Pending Leave
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#0ea5e9' }} /> Public Holiday
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#94a3b8' }} /> Weekend
            </span>
          </div>
        </div>
      )}

      {/* NEW REQUEST MODAL */}
      {showRequestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card glass-card" style={{ padding: '1.75rem', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.1rem' }}>Time Off Request</h3>
              <button type="button" onClick={() => { setShowRequestModal(false); resetForm(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-secondary)' }} aria-label="Close modal"></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              {/* Employee (Read-only for employee) */}
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Employee
                </label>
                <input
                  type="text"
                  className="form-control"
                  value={employeeName}
                  readOnly
                  style={{ background: 'rgba(241,245,249,0.7)', cursor: 'not-allowed', color: 'var(--text-primary)', fontWeight: 600 }}
                />
              </div>

              {/* Leave Type Select */}
              <div>
                <label htmlFor="leave-type-select" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Time Off Type <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <select
                  id="leave-type-select"
                  className="form-control"
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value)}
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                >
                  {leaveTypes.map(t => (
                    <option key={t.code} value={t.code}>{t.name} ({t.isPaid ? 'Paid' : 'Unpaid'})</option>
                  ))}
                </select>
                {selectedTypeConfig?.description && (
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    {selectedTypeConfig.description}
                  </p>
                )}
              </div>

              {/* Half-Day Toggle */}
              {selectedTypeConfig?.halfDayAllowed && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0.6rem 0.85rem', borderRadius: '8px', background: 'rgba(248,250,252,0.8)', border: '1px solid var(--border-glass)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={isHalfDay}
                      onChange={e => setIsHalfDay(e.target.checked)}
                    />
                    Half-Day Request
                  </label>

                  {isHalfDay && (
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="halfDayPeriod"
                          checked={halfDayPeriod === 'FIRST_HALF'}
                          onChange={() => setHalfDayPeriod('FIRST_HALF')}
                        />
                        First Half
                      </label>
                      <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="halfDayPeriod"
                          checked={halfDayPeriod === 'SECOND_HALF'}
                          onChange={() => setHalfDayPeriod('SECOND_HALF')}
                        />
                        Second Half
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* Date Pickers */}
              <div style={{ display: 'grid', gridTemplateColumns: isHalfDay ? '1fr' : '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label htmlFor="modal-start-date" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    {isHalfDay ? 'Date *' : 'Start Date *'}
                  </label>
                  <input
                    type="date"
                    id="modal-start-date"
                    className="form-control"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    required
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                  />
                </div>

                {!isHalfDay && (
                  <div>
                    <label htmlFor="modal-end-date" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                      End Date *
                    </label>
                    <input
                      type="date"
                      id="modal-end-date"
                      className="form-control"
                      value={endDate}
                      min={startDate}
                      onChange={e => setEndDate(e.target.value)}
                      required
                      style={{ minHeight: '38px', borderRadius: '8px' }}
                    />
                  </div>
                )}
              </div>

              {/* Allocation Preview */}
              <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', background: 'rgba(37,99,235,0.05)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CALCULATED DURATION</span>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '0.1rem 0 0 0' }}>Excludes weekends and public holidays</p>
                </div>
                <strong style={{ fontSize: '1.25rem', color: 'var(--accent-primary)' }}>
                  {calculatedDays} {calculatedDays === 1 ? 'Day' : 'Days'}
                </strong>
              </div>

              {/* Realtime Balance Status Banner */}
              <div style={{ fontSize: '0.78rem', color: availableBalance >= calculatedDays ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                Available Balance: {availableBalance} days | Requested: {calculatedDays} days
                {availableBalance < calculatedDays && selectedTypeConfig?.isPaid && (
                  <span style={{ display: 'block', fontSize: '0.72rem', color: '#dc2626', marginTop: '0.15rem' }}>
                    Warning: Requested days exceed available balance.
                  </span>
                )}
              </div>

              {/* Reason */}
              <div>
                <label htmlFor="modal-reason" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Reason <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <textarea
                  id="modal-reason"
                  className="form-control"
                  rows={2}
                  placeholder="Enter reason for leave request..."
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                  style={{ borderRadius: '8px', minHeight: '60px' }}
                />
              </div>

              {/* Attachment */}
              <div>
                <label htmlFor="modal-attachment" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Attachment {selectedTypeConfig?.docRequiredThresholdDays && selectedTypeConfig.docRequiredThresholdDays > 0 ? `(Required if > ${selectedTypeConfig.docRequiredThresholdDays} days)` : '(Optional)'}
                </label>
                <input
                  type="file"
                  id="modal-attachment"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  style={{ fontSize: '0.8rem' }}
                />
                {attachmentUrl && (
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: 600, display: 'block', marginTop: '0.2rem' }}>
                    File uploaded successfully
                  </span>
                )}
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: '0.2rem' }}>
                  Allowed types: PDF, JPG, PNG. Max file size: 5 MB.
                </span>
              </div>

              {/* Form Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowRequestModal(false); resetForm(); }}
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="btn-submit-request"
                  disabled={submitting}
                  style={{ minHeight: '38px', borderRadius: '8px', padding: '0 1.5rem' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL CONFIRMATION MODAL */}
      {cancelTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card glass-card" style={{ padding: '1.5rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 0.75rem 0', fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>
              Cancel Leave Request?
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Are you sure you want to cancel your <strong>{cancelTarget.type.replace(/_/g, ' ')}</strong> request for <strong>{cancelTarget.startDate} to {cancelTarget.endDate}</strong> ({cancelTarget.allocationDays} days)?
            </p>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="cancel-reason-input" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                Reason for Cancellation (Optional)
              </label>
              <textarea
                id="cancel-reason-input"
                className="form-control"
                rows={2}
                placeholder="Reason..."
                value={cancelReason}
                onChange={e => setCancelReason(e.target.value)}
                style={{ borderRadius: '8px', minHeight: '50px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setCancelTarget(null)}>No, Keep Request</button>
              <button type="button" className="btn-submit-request" onClick={handleConfirmCancel} disabled={cancelling} style={{ background: '#dc2626' }}>
                {cancelling ? 'Cancelling...' : 'Yes, Cancel Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
