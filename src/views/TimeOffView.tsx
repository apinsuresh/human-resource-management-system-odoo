import { useState, useEffect } from 'react';
import { 
  type TimeOffType, 
  mockSubmitTimeOffRequest, 
  mockGetLeaveRequests, 
  mockReviewLeaveRequest
} from '../mockApi';
import { showToast } from '../components/Toast';

interface TimeOffViewProps {
  employeeId: string;
  userRole: string;
}

export default function TimeOffView({ employeeId, userRole }: TimeOffViewProps) {
  const [activeSubTab, setActiveSubTab] = useState<'request' | 'approvals'>('request');
  const [requestsList, setRequestsList] = useState<any[]>([]);

  // Submit Form States
  const [leaveType, setLeaveType] = useState<TimeOffType>('PAID_TIME_OFF');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [allocationDays, setAllocationDays] = useState('1');
  const [reason, setReason] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Review states
  const [notesModalRequest, setNotesModalRequest] = useState<any | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');

  const loadLeaveData = () => {
    try {
      const reqs = mockGetLeaveRequests(employeeId, userRole as any);
      setRequestsList(reqs);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLeaveData();
  }, [employeeId, userRole]);

  // Auto calculate day count based on dates
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = diffTime >= 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1 : 0;
      setAllocationDays(diffDays > 0 ? String(diffDays) : '1');
    }
  }, [startDate, endDate]);

  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !allocationDays || !reason) {
      showToast('Please fill in all form details.', 'error');
      return;
    }

    const days = parseFloat(allocationDays);
    if (isNaN(days) || days <= 0) {
      showToast('Allocation days must be a positive number.', 'error');
      return;
    }

    setLoading(true);
    try {
      await mockSubmitTimeOffRequest(employeeId, {
        type: leaveType,
        startDate,
        endDate,
        allocationDays: days,
        attachmentUrl: attachmentUrl || undefined,
        reason: reason
      });

      showToast('Leave request submitted successfully!', 'success');
      setStartDate('');
      setEndDate('');
      setAllocationDays('1');
      setReason('');
      setAttachmentUrl('');
      loadLeaveData();
      
      // Notify attendance dashboards
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err: any) {
      showToast(err.message || 'Submission failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewAction = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      await mockReviewLeaveRequest(employeeId, userRole as any, requestId, status, reviewerNote);
      showToast(`Request marked as ${status.toLowerCase()}.`, 'success');
      setNotesModalRequest(null);
      setReviewerNote('');
      loadLeaveData();
      
      window.dispatchEvent(new Event('hrms-attendance-update'));
    } catch (err: any) {
      showToast(err.message || 'Review action failed.', 'error');
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 5 * 1024 * 1024) {
        showToast('File size exceeds the 5 MB limit.', 'error');
        return;
      }
      setAttachmentUrl(`mock-s3-upload-path/${file.name}`);
      showToast(`Document "${file.name}" uploaded.`, 'success');
    }
  };

  const showApprovalsTab = userRole === 'ADMIN' || userRole === 'HR_OFFICER';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Subtab navigation */}
      <div className="tab-navigation" style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.4)', borderRadius: '12px', padding: '0.25rem', border: '1px solid var(--border-glass)', display: 'inline-flex', alignSelf: 'flex-start' }}>
        <button 
          type="button" 
          className={`tab-btn ${activeSubTab === 'request' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('request')}
          style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
          Request Leave
        </button>
        {showApprovalsTab && (
          <button 
            type="button" 
            className={`tab-btn ${activeSubTab === 'approvals' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('approvals')}
            style={{ borderRadius: '8px', padding: '0.45rem 1rem', fontSize: '0.85rem' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', verticalAlign: 'middle' }} aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            Approval Queue ({requestsList.filter(r => r.status === 'PENDING').length})
          </button>
        )}
      </div>

      {activeSubTab === 'request' ? (
        <>
          {/* Submit Request Form */}
          <div className="card glass-card" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
            <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                <h3>Submit Leave Request</h3>
              </div>
            </div>

            <form onSubmit={handleSubmitLeave}>
              <div className="grid-3">
                <div className="form-group">
                  <label htmlFor="leave-type" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Leave Type *</label>
                  <select 
                    id="leave-type" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value as TimeOffType)}
                  >
                    <option value="PAID_TIME_OFF">Paid Time Off (PTO)</option>
                    <option value="SICK_LEAVE">Sick Leave</option>
                    <option value="UNPAID_LEAVE">Unpaid Leave</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="leave-start" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Start Date *</label>
                  <input 
                    type="date" 
                    id="leave-start" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="leave-end" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>End Date *</label>
                  <input 
                    type="date" 
                    id="leave-end" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid-3" style={{ marginTop: '1rem' }}>
                <div className="form-group">
                  <label htmlFor="leave-days-calc" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Days (Auto Calculated)</label>
                  <input 
                    type="text" 
                    id="leave-days-calc" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px', background: '#f1f5f9', color: '#64748b' }}
                    value={startDate && endDate ? allocationDays : '0.0'}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="leave-days" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Allocation (Days Count) *</label>
                  <input 
                    type="number" 
                    id="leave-days" 
                    className="form-control" 
                    style={{ minHeight: '38px', borderRadius: '8px' }}
                    step="0.5" 
                    min="0.5" 
                    value={allocationDays}
                    onChange={(e) => setAllocationDays(e.target.value)}
                    required
                  />
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'block' }}>
                    Supports half-days (e.g. 0.5 or 1.5)
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="leave-reason" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Reason *</label>
                  <textarea 
                    id="leave-reason" 
                    className="form-control" 
                    style={{ borderRadius: '8px', minHeight: '64px', padding: '0.5rem 0.75rem' }}
                    placeholder="Enter reason for leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              {leaveType === 'SICK_LEAVE' && (
                <div className="form-group" style={{ marginTop: '1rem' }}>
                  <label htmlFor="leave-attachment" style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.35rem' }}>Medical Certificate (Required for &gt; 2 days) *</label>
                  <input 
                    type="file" 
                    id="leave-attachment" 
                    className="form-control-file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleAttachmentUpload}
                  />
                  {attachmentUrl && (
                    <span className="attachment-uploaded-msg" style={{ fontSize: '0.75rem', color: 'var(--status-present)', display: 'block', marginTop: '0.25rem' }}>
                      ✓ Document uploaded successfully
                    </span>
                  )}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="pagination-btn" 
                  style={{ width: '100px', height: '38px', borderRadius: '8px' }}
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                    setAllocationDays('1');
                    setReason('');
                    setAttachmentUrl('');
                  }}
                >
                  Reset
                </button>
                <button 
                  type="submit" 
                  className="btn-submit-request" 
                  style={{ width: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '38px' }}
                  disabled={loading}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                  {loading ? 'Submitting...' : 'Submit Leave Request'}
                </button>
              </div>
            </form>
          </div>

          {/* Personal Request List */}
          <div className="card glass-card" style={{ textAlign: 'left' }}>
            <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
              <h3>My Leave History</h3>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select className="form-control" style={{ minHeight: '34px', fontSize: '0.8rem', padding: '0 0.5rem', width: '150px' }} aria-label="Filter types">
                  <option>All Leave Types</option>
                </select>
                <select className="form-control" style={{ minHeight: '34px', fontSize: '0.8rem', padding: '0 0.5rem', width: '120px' }} aria-label="Filter date range">
                  <option>This Year</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>LEAVE TYPE</th>
                    <th>START DATE</th>
                    <th>END DATE</th>
                    <th>DAYS</th>
                    <th>REASON</th>
                    <th>STATUS</th>
                    <th>SUBMITTED ON</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {requestsList.map((req) => (
                    <tr key={req.id}>
                      <td><strong>{req.type.replace(/_/g, ' ')}</strong></td>
                      <td>{req.startDate}</td>
                      <td>{req.endDate}</td>
                      <td>{req.allocationDays}</td>
                      <td>{req.reason || '--'}</td>
                      <td>
                        <span className={`status-badge-inline status-${req.status.toLowerCase()}`}>
                          {req.status}
                        </span>
                      </td>
                      <td>{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'Today'}</td>
                      <td>
                        {req.attachmentUrl ? (
                          <a href="#" onClick={(e) => { e.preventDefault(); showToast('Downloading certificate... (Mocked)', 'info'); }} style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                            📄 View Doc
                          </a>
                        ) : '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {requestsList.length === 0 && (
              <div className="empty-state-card" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }} aria-hidden="true">
                  <rect x="20" y="16" width="24" height="32" rx="3" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
                  <line x1="26" y1="26" x2="38" y2="26" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="26" y1="32" x2="34" y2="32" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  <line x1="26" y1="38" x2="38" y2="38" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                  <rect x="28" y="12" width="8" height="5" rx="1" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2" />
                  <path d="M12 40c2-5 6-7 10-5-2 5-6 7-10 5z" fill="#E2E8F0" opacity="0.6" />
                  <path d="M52 32c-2-5-6-7-10-5 2 5 6 7 10 5z" fill="#E2E8F0" opacity="0.6" />
                </svg>
                <strong style={{ fontSize: '0.95rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>No leave requests submitted yet.</strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>When you submit a leave request, it will appear here.</span>
              </div>
            )}

            {/* History pagination */}
            <div className="pagination-bar" style={{ marginTop: '1.25rem' }}>
              <span className="pagination-info">
                Showing 0 to {requestsList.length} of {requestsList.length} entries
              </span>
              <div className="pagination-controls">
                <button type="button" className="pagination-btn">&lt;</button>
                <button type="button" className="pagination-btn active">1</button>
                <button type="button" className="pagination-btn">&gt;</button>
                <select className="form-control" style={{ minHeight: '32px', fontSize: '0.8rem', padding: '0 0.5rem', width: '100px', marginLeft: '0.5rem' }} aria-label="Items per page">
                  <option>10 / page</option>
                </select>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Leave Approval Queue (Admin/HR Officer only) */
        <div className="card glass-card approvals-panel" style={{ textAlign: 'left' }}>
          <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3>Leave Approval Requests</h3>
          </div>
          
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Attachment</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {requestsList.filter(r => r.status === 'PENDING').map((req) => (
                  <tr key={req.id}>
                    <td><code>{req.loginId}</code></td>
                    <td><strong>{req.employeeName}</strong></td>
                    <td>{req.department}</td>
                    <td><strong>{req.type.replace(/_/g, ' ')}</strong></td>
                    <td>{req.startDate} to {req.endDate}</td>
                    <td><strong>{req.allocationDays}</strong></td>
                    <td>
                      {req.attachmentUrl ? (
                        <a href="#" onClick={(e) => (e.preventDefault(), showToast('Opening certificate document... (Mocked)', 'info'))} style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                          📄 View Document
                        </a>
                      ) : 'None'}
                    </td>
                    <td>
                      <div className="review-btn-row" style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          type="button" 
                          className="btn-shift-action"
                          style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', height: '28px', width: 'auto' }}
                          onClick={() => setNotesModalRequest({ ...req, action: 'APPROVED' })}
                        >
                          Approve
                        </button>
                        <button 
                          type="button" 
                          className="pagination-btn"
                          style={{ height: '28px', padding: '0 0.75rem' }}
                          onClick={() => setNotesModalRequest({ ...req, action: 'REJECTED' })}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {requestsList.filter(r => r.status === 'PENDING').length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
                      No pending leave requests in the queue.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <h3 style={{ marginTop: '2.5rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem' }}>Reviewed History</h3>
          <div className="table-responsive">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Review Status</th>
                  <th>Reviewer Note</th>
                </tr>
              </thead>
              <tbody>
                {requestsList.filter(r => r.status !== 'PENDING').map((req) => (
                  <tr key={req.id}>
                    <td><strong>{req.employeeName}</strong></td>
                    <td>{req.type.replace(/_/g, ' ')}</td>
                    <td>{req.startDate} to {req.endDate}</td>
                    <td>{req.allocationDays}</td>
                    <td>
                      <span className={`status-badge-inline status-${req.status.toLowerCase()}`}>
                        {req.status}
                      </span>
                    </td>
                    <td>{req.reviewerNote || '--'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Confirmation note modal */}
      {notesModalRequest && (
        <>
          <div className="profile-drawer" role="dialog" aria-modal="true" style={{ zIndex: 300, padding: '2rem', maxWidth: '400px', height: 'auto', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', borderRadius: '16px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Reviewer Leave Action</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Provide a confirmation note for marking <strong>{notesModalRequest.employeeName}</strong>'s request as <strong>{notesModalRequest.action}</strong>.
            </p>
            <div className="form-group" style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <label htmlFor="modal-reviewer-note" style={{ fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginBottom: '0.35rem' }}>Approver Note *</label>
              <textarea 
                id="modal-reviewer-note" 
                className="form-control" 
                style={{ borderRadius: '8px', minHeight: '80px', padding: '0.5rem 0.75rem' }}
                placeholder="Write confirmation remarks..."
                value={reviewerNote}
                onChange={(e) => setReviewerNote(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button 
                type="button" 
                className="pagination-btn"
                style={{ height: '36px', width: '100px' }}
                onClick={() => {
                  setNotesModalRequest(null);
                  setReviewerNote('');
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn-shift-action"
                style={{ height: '36px', width: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                onClick={() => handleReviewAction(notesModalRequest.id, notesModalRequest.action)}
              >
                Confirm {notesModalRequest.action}
              </button>
            </div>
          </div>
          <div className="drawer-backdrop" onClick={() => setNotesModalRequest(null)} style={{ zIndex: 250 }} />
        </>
      )}
    </div>
  );
}
