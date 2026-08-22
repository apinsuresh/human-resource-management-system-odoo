import { useState, useEffect, useCallback, useRef } from 'react';
import {
  type UserRole,
  type TimeOffRequest,
  type LeaveTypeConfig,
  type LeaveAuditLog,
  mockGetLeaveRequests,
  mockGetLeaveAllocations,
  mockGetLeaveTypes,
  mockReviewLeaveRequest,
  mockUpdateLeaveAllocation,
  mockCreateLeaveType,
  mockGetLeaveAuditLogs,
  mockSubmitTimeOffRequest,
  mockCalculateWorkingDays,
  getStoredData,
} from '../mockApi';
import { showToast } from '../components/Toast';

interface AdminTimeOffViewProps {
  userRole: UserRole;
  userId: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: 'Pending', color: '#d97706', bg: 'rgba(217,119,6,0.1)' },
  APPROVED: { label: 'Approved', color: '#16a34a', bg: 'rgba(22,163,74,0.1)' },
  REJECTED: { label: 'Rejected', color: '#dc2626', bg: 'rgba(220,38,38,0.1)' },
  CANCELLED: { label: 'Cancelled', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
};

export default function AdminTimeOffView({ userRole, userId }: AdminTimeOffViewProps) {
  const [activeTab, setActiveTab] = useState<'requests' | 'allocations' | 'policies' | 'audit'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Lists Data
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [allocations, setAllocations] = useState<any[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<LeaveAuditLog[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);

  // Action Modals
  const [reviewTarget, setReviewTarget] = useState<{ request: TimeOffRequest; action: 'APPROVED' | 'REJECTED' } | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Edit Allocation Modal
  const [editAllocTarget, setEditAllocTarget] = useState<any | null>(null);
  const [allocDaysInput, setAllocDaysInput] = useState('');
  const [allocCarryInput, setAllocCarryInput] = useState('0');
  const [savingAlloc, setSavingAlloc] = useState(false);

  // New Leave Type Modal
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [newLtCode, setNewLtCode] = useState('');
  const [newLtName, setNewLtName] = useState('');
  const [newLtDesc, setNewLtDesc] = useState('');
  const [newLtPaid, setNewLtPaid] = useState(true);
  const [newLtAlloc, setNewLtAlloc] = useState('12');
  const [newLtDocThreshold, setNewLtDocThreshold] = useState('0');
  const [newLtHalfDay, setNewLtHalfDay] = useState(true);
  const [creatingLt, setCreatingLt] = useState(false);

  // New Request On-Behalf Modal
  const [showOnBehalfModal, setShowOnBehalfModal] = useState(false);
  const [obEmployeeId, setObEmployeeId] = useState('');
  const [obType, setObType] = useState('PAID_TIME_OFF');
  const [obStartDate, setObStartDate] = useState('');
  const [obEndDate, setObEndDate] = useState('');
  const [obReason, setObReason] = useState('');
  const [obSubmitting, setObSubmitting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(searchQuery), 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery]);

  const loadData = useCallback(() => {
    setLoading(true);
    try {
      const reqs = mockGetLeaveRequests(userId, userRole, {
        searchQuery: debouncedQuery,
        deptFilter,
        statusFilter,
        typeFilter,
      });
      const allocs = mockGetLeaveAllocations(userId, userRole, debouncedQuery, deptFilter, typeFilter);
      const lTypes = mockGetLeaveTypes();
      const logs = mockGetLeaveAuditLogs(userRole);
      const emps = getStoredData<any>('hrms_employees').filter(e => e.role !== 'EMPLOYER');

      const depts = Array.from(new Set(emps.map((e: any) => e.department).filter(Boolean))) as string[];

      setRequests(reqs);
      setAllocations(allocs);
      setLeaveTypes(lTypes);
      setAuditLogs(logs);
      setEmployees(emps);
      setDepartments(depts);
      if (emps.length > 0 && !obEmployeeId) setObEmployeeId(emps[0].id);
    } catch (err: any) {
      showToast(err.message || 'Failed to load leave management data.', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, userRole, debouncedQuery, deptFilter, statusFilter, typeFilter, obEmployeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const handler = () => loadData();
    window.addEventListener('hrms-attendance-update', handler);
    return () => window.removeEventListener('hrms-attendance-update', handler);
  }, [loadData]);

  // KPI Calculations
  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedTodayCount = requests.filter(r => r.status === 'APPROVED' && r.reviewedAt?.split('T')[0] === new Date().toISOString().split('T')[0]).length;
  const todayStr = new Date().toISOString().split('T')[0];
  const employeesOnLeaveCount = requests.filter(r => r.status === 'APPROVED' && todayStr >= r.startDate && todayStr <= r.endDate).length;
  const totalAllocatedCount = allocations.reduce((sum, a) => sum + a.allocatedDays, 0);

  // Handle Review (Approve/Reject)
  const handleConfirmReview = async () => {
    if (!reviewTarget) return;
    setReviewing(true);
    try {
      await mockReviewLeaveRequest(
        userId,
        userRole,
        reviewTarget.request.id,
        reviewTarget.action,
        reviewerNote.trim()
      );
      showToast(`Request marked as ${reviewTarget.action.toLowerCase()}.`, 'success');
      setReviewTarget(null);
      setReviewerNote('');
      loadData();
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err: any) {
      showToast(err.message || 'Action failed.', 'error');
    } finally {
      setReviewing(false);
    }
  };

  // Handle Edit Allocation
  const handleSaveAllocation = async () => {
    if (!editAllocTarget) return;
    const days = parseFloat(allocDaysInput);
    const cfDays = parseFloat(allocCarryInput) || 0;
    if (isNaN(days) || days < 0) {
      showToast('Please enter a valid positive number for allocated days.', 'error');
      return;
    }

    setSavingAlloc(true);
    try {
      await mockUpdateLeaveAllocation(
        userId,
        userRole,
        editAllocTarget.employeeId,
        editAllocTarget.leaveType,
        days,
        cfDays
      );
      showToast(`Allocation updated for ${editAllocTarget.employeeName}.`, 'success');
      setEditAllocTarget(null);
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Allocation update failed.', 'error');
    } finally {
      setSavingAlloc(false);
    }
  };

  // Handle Create Leave Type
  const handleCreateLeaveType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLtCode || !newLtName) {
      showToast('Please enter code and name for the new leave type.', 'error');
      return;
    }
    setCreatingLt(true);
    try {
      await mockCreateLeaveType(userRole, {
        code: newLtCode.toUpperCase().replace(/\s+/g, '_'),
        name: newLtName.trim(),
        description: newLtDesc.trim(),
        isPaid: newLtPaid,
        annualAllocation: parseFloat(newLtAlloc) || 12,
        carryForward: false,
        maxCarryForward: 0,
        halfDayAllowed: newLtHalfDay,
        docRequiredThresholdDays: parseInt(newLtDocThreshold, 10) || 0,
        requireApproval: true,
        isActive: true,
      });

      showToast(`Created leave type "${newLtName}".`, 'success');
      setShowLeaveTypeModal(false);
      setNewLtCode('');
      setNewLtName('');
      setNewLtDesc('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to create leave type.', 'error');
    } finally {
      setCreatingLt(false);
    }
  };

  // Handle Submit On-Behalf
  const handleSubmitOnBehalf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!obEmployeeId || !obStartDate || !obEndDate || !obReason) {
      showToast('Please fill in all details for the leave request.', 'error');
      return;
    }

    const calcDays = mockCalculateWorkingDays(obStartDate, obEndDate);
    setObSubmitting(true);
    try {
      await mockSubmitTimeOffRequest(obEmployeeId, {
        type: obType,
        startDate: obStartDate,
        endDate: obEndDate,
        allocationDays: calcDays,
        reason: `[Submitted by HR/Admin] ${obReason.trim()}`,
      });

      showToast('Leave request created successfully on behalf of employee.', 'success');
      setShowOnBehalfModal(false);
      setObStartDate('');
      setObEndDate('');
      setObReason('');
      loadData();
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err: any) {
      showToast(err.message || 'Submission failed.', 'error');
    } finally {
      setObSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', textAlign: 'left' }}>

      {/* Header & Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
            Time Off Management
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Review employee leave requests, configure allocations, and manage leave policies.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn-submit-request"
            onClick={() => setShowOnBehalfModal(true)}
            style={{ height: '40px', padding: '0 1.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, borderRadius: '10px' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            + New Request
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        {[
          ['Pending Requests', pendingCount, '#d97706', 'rgba(217,119,6,0.08)'],
          ['Approved Today', approvedTodayCount, '#16a34a', 'rgba(22,163,74,0.08)'],
          ['Employees On Leave Today', employeesOnLeaveCount, '#7c3aed', 'rgba(124,58,237,0.08)'],
          ['Total Allocation Pool', `${totalAllocatedCount}d`, 'var(--accent-primary)', 'rgba(37,99,235,0.08)'],
        ].map(([label, val, color, bg]) => (
          <div key={label as string} className="card glass-card" style={{ padding: '1.25rem', textAlign: 'center', background: bg as string }}>
            <strong style={{ fontSize: '1.75rem', fontWeight: 800, color: color as string, display: 'block', lineHeight: 1.2 }}>
              {val}
            </strong>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {label as string}
            </span>
          </div>
        ))}
      </div>

      {/* Subtabs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>
        <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.5)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-glass)' }}>
          {[
            ['requests', 'Time Off Requests'],
            ['allocations', 'Leave Allocations'],
            ['policies', 'Policies & Leave Types'],
            ['audit', 'Audit Trail'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key as any)}
              style={{
                padding: '0.45rem 1.15rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: '0.85rem',
                background: activeTab === key ? 'white' : 'transparent',
                color: activeTab === key ? 'var(--accent-primary)' : 'var(--text-secondary)',
                boxShadow: activeTab === key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              {label} {key === 'requests' && pendingCount > 0 ? `(${pendingCount})` : ''}
            </button>
          ))}
        </div>

        {/* Filter Controls (Requests & Allocations) */}
        {(activeTab === 'requests' || activeTab === 'allocations') && (
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', width: '220px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                className="form-control"
                placeholder="Search employee, dept..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.25rem', minHeight: '36px', fontSize: '0.8rem', borderRadius: '8px' }}
                aria-label="Search employee or department"
              />
            </div>

            {/* Department */}
            <select
              className="form-control"
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              style={{ minHeight: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '140px' }}
              aria-label="Filter Department"
            >
              <option value="ALL">All Depts</option>
              {departments.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            {/* Leave Type */}
            <select
              className="form-control"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              style={{ minHeight: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '140px' }}
              aria-label="Filter Leave Type"
            >
              <option value="ALL">All Types</option>
              {leaveTypes.map(t => (
                <option key={t.code} value={t.code}>{t.name}</option>
              ))}
            </select>

            {/* Status (Requests tab only) */}
            {activeTab === 'requests' && (
              <select
                className="form-control"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                style={{ minHeight: '36px', fontSize: '0.8rem', borderRadius: '8px', width: '130px' }}
                aria-label="Filter Status"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            )}
          </div>
        )}
      </div>

      {/* SUBTAB 1: REQUESTS TABLE */}
      {activeTab === 'requests' && (
        <div className="card glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} style={{ height: '48px', borderRadius: '8px', background: 'rgba(148,163,184,0.1)', animation: 'pulse 1.5s infinite' }} />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>No time off requests match your criteria</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} aria-label="Leave requests queue">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)', background: 'rgba(248,250,252,0.6)' }}>
                    {['Employee', 'Dept', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Submitted On', 'Actions'].map(h => (
                      <th key={h} scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {requests.map(req => {
                    const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG['PENDING'];
                    const lt = leaveTypes.find(t => t.code === req.type);

                    return (
                      <tr key={req.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div>
                            <strong style={{ fontSize: '0.85rem' }}>{req.employeeName}</strong>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{req.loginId}</div>
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                          {req.department}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong style={{ fontSize: '0.85rem' }}>{lt?.name || req.type.replace(/_/g, ' ')}</strong>
                          {req.isHalfDay && (
                            <span style={{ fontSize: '0.7rem', display: 'block', color: 'var(--accent-primary)', fontWeight: 600 }}>
                              Half Day ({req.halfDayPeriod === 'FIRST_HALF' ? '1st' : '2nd'} Half)
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>{req.startDate}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>{req.endDate}</td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <strong style={{ color: 'var(--text-primary)' }}>{req.allocationDays}d</strong>
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0.2rem 0.65rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}33`, whiteSpace: 'nowrap' }}>
                            ● {cfg.label}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short' }) : '—'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                            {req.status === 'PENDING' ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => { setReviewTarget({ request: req, action: 'APPROVED' }); setReviewerNote(''); }}
                                  style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(22,163,74,0.3)', background: 'rgba(22,163,74,0.08)', color: '#16a34a', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setReviewTarget({ request: req, action: 'REJECTED' }); setReviewerNote(''); }}
                                  style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.08)', color: '#dc2626', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}
                                >
                                  Reject
                                </button>
                              </>
                            ) : (
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                {req.reviewerName ? `By ${req.reviewerName}` : 'Processed'}
                              </span>
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

      {/* SUBTAB 2: ALLOCATIONS TABLE */}
      {activeTab === 'allocations' && (
        <div className="card glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{ height: '48px', borderRadius: '8px', background: 'rgba(148,163,184,0.1)' }} />
              ))}
            </div>
          ) : allocations.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>No leave allocations found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} aria-label="Employee leave allocations">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)', background: 'rgba(248,250,252,0.6)' }}>
                    {['Employee', 'Department', 'Leave Type', 'Allocated', 'Used', 'Pending', 'Available', 'Actions'].map(h => (
                      <th key={h} scope="col" style={{ padding: '0.75rem 1rem', textAlign: h === 'Employee' || h === 'Department' || h === 'Leave Type' ? 'left' : 'center', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allocations.map(alloc => (
                    <tr key={alloc.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div>
                          <strong style={{ fontSize: '0.85rem' }}>{alloc.employeeName}</strong>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{alloc.loginId}</div>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>{alloc.department}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <strong>{alloc.leaveTypeName}</strong>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', fontWeight: 700 }}>{alloc.allocatedDays}d</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#dc2626' }}>{alloc.usedDays}d</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', color: '#d97706' }}>{alloc.pendingDays}d</td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <strong style={{ color: '#16a34a', fontSize: '0.95rem' }}>{alloc.availableDays}d</strong>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditAllocTarget(alloc);
                            setAllocDaysInput(String(alloc.allocatedDays));
                            setAllocCarryInput(String(alloc.carryForwardDays || 0));
                          }}
                          style={{ padding: '0.25rem 0.65rem', borderRadius: '6px', border: '1px solid var(--border-glass)', background: 'white', cursor: 'pointer', fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600 }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 3: POLICIES & LEAVE TYPES */}
      {activeTab === 'policies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Configured Leave Types</h3>
            <button
              type="button"
              className="btn-submit-request"
              onClick={() => setShowLeaveTypeModal(true)}
              style={{ height: '36px', padding: '0 1rem', fontSize: '0.8rem', fontWeight: 700 }}
            >
              + Add Leave Type
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {leaveTypes.map(lt => (
              <div key={lt.id} className="card glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{lt.name}</strong>
                    <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '12px', background: lt.isPaid ? 'rgba(22,163,74,0.1)' : 'rgba(148,163,184,0.1)', color: lt.isPaid ? '#16a34a' : '#64748b', fontWeight: 700 }}>
                      {lt.isPaid ? 'Paid' : 'Unpaid'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
                    {lt.description || 'No description provided.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Annual Allocation:</span>
                      <strong>{lt.annualAllocation} days / year</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Half-Day Allowed:</span>
                      <strong>{lt.halfDayAllowed ? 'Yes' : 'No'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Doc Required:</span>
                      <strong>{lt.docRequiredThresholdDays > 0 ? `If > ${lt.docRequiredThresholdDays} days` : 'No'}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border-glass)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <code style={{ fontSize: '0.75rem', color: 'var(--accent-primary)' }}>{lt.code}</code>
                  <span style={{ fontSize: '0.72rem', color: lt.isActive ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                    {lt.isActive ? '● Active' : '● Inactive'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 4: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="card glass-card" style={{ overflow: 'hidden', padding: 0 }}>
          {auditLogs.length === 0 ? (
            <div style={{ padding: '3.5rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              <p style={{ fontWeight: 700, margin: 0, fontSize: '0.95rem' }}>No audit records recorded yet</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }} aria-label="Leave audit trail">
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-glass)', background: 'rgba(248,250,252,0.6)' }}>
                    {['Action', 'Performed By', 'Employee', 'Details', 'Timestamp'].map(h => (
                      <th key={h} scope="col" style={{ padding: '0.75rem 1rem', textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-glass)' }}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          fontSize: '0.72rem', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '6px',
                          background: log.action === 'APPROVE' ? 'rgba(22,163,74,0.1)' : log.action === 'REJECT' ? 'rgba(220,38,38,0.1)' : 'rgba(37,99,235,0.1)',
                          color: log.action === 'APPROVE' ? '#16a34a' : log.action === 'REJECT' ? '#dc2626' : 'var(--accent-primary)'
                        }}>
                          {log.action}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{log.actorName}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{log.employeeName}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{log.details}</td>
                      <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* APPROVE / REJECT MODAL */}
      {reviewTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card glass-card" style={{ padding: '1.75rem', maxWidth: '460px', width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1rem', color: reviewTarget.action === 'APPROVED' ? '#16a34a' : '#dc2626' }}>
                {reviewTarget.action === 'APPROVED' ? 'Approve Time Off Request?' : 'Reject Time Off Request?'}
              </h3>
              <button type="button" onClick={() => setReviewTarget(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}></button>
            </div>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              <strong>{reviewTarget.request.employeeName}</strong> · {reviewTarget.request.type.replace(/_/g, ' ')} · {reviewTarget.request.startDate} to {reviewTarget.request.endDate} ({reviewTarget.request.allocationDays} days)
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="reviewer-note-input" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>
                {reviewTarget.action === 'REJECTED' ? 'Rejection Reason (Recommended)' : 'Approver Remarks / Notes (Optional)'}
              </label>
              <textarea
                id="reviewer-note-input"
                className="form-control"
                rows={3}
                placeholder="Enter remarks..."
                value={reviewerNote}
                onChange={e => setReviewerNote(e.target.value)}
                style={{ borderRadius: '8px', minHeight: '70px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setReviewTarget(null)}>Cancel</button>
              <button
                type="button"
                className="btn-submit-request"
                onClick={handleConfirmReview}
                disabled={reviewing}
                style={{ background: reviewTarget.action === 'APPROVED' ? 'linear-gradient(135deg,#16a34a,#15803d)' : '#dc2626' }}
              >
                {reviewing ? 'Processing...' : `Confirm ${reviewTarget.action === 'APPROVED' ? 'Approval' : 'Rejection'}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT ALLOCATION MODAL */}
      {editAllocTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card glass-card" style={{ padding: '1.5rem', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1rem' }}>Edit Leave Allocation</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              <strong>{editAllocTarget.employeeName}</strong> · {editAllocTarget.leaveTypeName}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Annual Allocated Days
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={allocDaysInput}
                  onChange={e => setAllocDaysInput(e.target.value)}
                  step="0.5"
                  min="0"
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Carry Forward Days
                </label>
                <input
                  type="number"
                  className="form-control"
                  value={allocCarryInput}
                  onChange={e => setAllocCarryInput(e.target.value)}
                  step="0.5"
                  min="0"
                  style={{ minHeight: '38px', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setEditAllocTarget(null)}>Cancel</button>
                <button type="button" className="btn-submit-request" onClick={handleSaveAllocation} disabled={savingAlloc}>
                  {savingAlloc ? 'Saving...' : 'Save Allocation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE LEAVE TYPE MODAL */}
      {showLeaveTypeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card glass-card" style={{ padding: '1.5rem', maxWidth: '480px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1rem' }}>Configure New Leave Type</h3>

            <form onSubmit={handleCreateLeaveType} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Leave Type Name *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Bereavement Leave"
                  value={newLtName}
                  onChange={e => { setNewLtName(e.target.value); if (!newLtCode) setNewLtCode(e.target.value.toUpperCase().replace(/\s+/g, '_')); }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Unique Code *
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. BEREAVEMENT_LEAVE"
                  value={newLtCode}
                  onChange={e => setNewLtCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Description
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Brief description..."
                  value={newLtDesc}
                  onChange={e => setNewLtDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Annual Allowance (Days)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={newLtAlloc}
                    onChange={e => setNewLtAlloc(e.target.value)}
                    step="1"
                    min="0"
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                    Doc Required Threshold (Days)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={newLtDocThreshold}
                    onChange={e => setNewLtDocThreshold(e.target.value)}
                    step="1"
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newLtPaid} onChange={e => setNewLtPaid(e.target.checked)} />
                  Paid Leave
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>
                  <input type="checkbox" checked={newLtHalfDay} onChange={e => setNewLtHalfDay(e.target.checked)} />
                  Allow Half-Day
                </label>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLeaveTypeModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit-request" disabled={creatingLt}>
                  {creatingLt ? 'Creating...' : 'Create Leave Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBMIT ON-BEHALF MODAL */}
      {showOnBehalfModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="card glass-card" style={{ padding: '1.5rem', maxWidth: '480px', width: '100%' }}>
            <h3 style={{ margin: '0 0 1rem 0', fontWeight: 800, fontSize: '1rem' }}>Create Leave Request On-Behalf</h3>

            <form onSubmit={handleSubmitOnBehalf} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Select Employee *
                </label>
                <select
                  className="form-control"
                  value={obEmployeeId}
                  onChange={e => setObEmployeeId(e.target.value)}
                  required
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName} ({e.loginId}) — {e.department}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>
                  Leave Type *
                </label>
                <select
                  className="form-control"
                  value={obType}
                  onChange={e => setObType(e.target.value)}
                >
                  {leaveTypes.map(t => (
                    <option key={t.code} value={t.code}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Start Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={obStartDate}
                    onChange={e => setObStartDate(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>End Date *</label>
                  <input
                    type="date"
                    className="form-control"
                    value={obEndDate}
                    min={obStartDate}
                    onChange={e => setObEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.3rem' }}>Reason *</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Reason..."
                  value={obReason}
                  onChange={e => setObReason(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowOnBehalfModal(false)}>Cancel</button>
                <button type="submit" className="btn-submit-request" disabled={obSubmitting}>
                  {obSubmitting ? 'Submitting...' : 'Submit On-Behalf'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }`}</style>
    </div>
  );
}
