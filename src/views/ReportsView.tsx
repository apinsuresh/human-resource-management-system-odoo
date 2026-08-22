import { useState } from 'react';
import { showToast } from '../components/Toast';

export default function ReportsView() {
  const [loading, setLoading] = useState(false);

  const handleApplyFilters = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Filters applied. No reports generated yet.', 'info');
    }, 600);
  };

  const handleClearFilters = () => {
    showToast('Filters cleared.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.5rem' }}>
      
      {/* Title Header with Illustration */}
      <div className="leave-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
        <div style={{ textAlign: 'left' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reports & Analytics Console</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Access and analyze employee activity, payroll data, and insights.
          </p>
        </div>
        
        {/* Flat chart dashboard icon illustration */}
        <div className="calendar-illustration-widget" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.9 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ background: 'rgba(99, 102, 241, 0.05)', padding: '0.5rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.1)' }} aria-hidden="true">
            {/* Chart mockup */}
            <rect x="12" y="16" width="22" height="18" rx="2" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="16" y1="28" x2="16" y2="22" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="22" y1="28" x2="22" y2="24" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="28" y1="28" x2="28" y2="20" stroke="#6366F1" strokeWidth="2.5" strokeLinecap="round" />
            
            <circle cx="46" cy="25" r="8" fill="#F8FAFC" stroke="#CBD5E1" strokeWidth="1.5" />
            <path d="M46 17a8 8 0 0 1 8 8" stroke="#2563EB" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      {/* Filter Bar Card */}
      <div className="card glass-card" style={{ display: 'flex', gap: '1rem', padding: '1rem 1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '220px', margin: 0 }}>
          <div className="input-icon-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <select className="form-control" style={{ minHeight: '38px', borderRadius: '8px', paddingLeft: '2.5rem' }} aria-label="Date Range">
              <option>01 May 2025 - 31 May 2025</option>
              <option>This Month</option>
              <option>Last 30 Days</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '180px', margin: 0 }}>
          <div className="input-icon-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="22" width="20" height="2"></rect><path d="M20 20v-8H4v8M12 2L2 10h20L12 2z"></path></svg>
            <select className="form-control" style={{ minHeight: '38px', borderRadius: '8px', paddingLeft: '2.5rem' }} aria-label="Department">
              <option>All Departments</option>
            </select>
          </div>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '180px', margin: 0 }}>
          <div className="input-icon-wrapper">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
            <select className="form-control" style={{ minHeight: '38px', borderRadius: '8px', paddingLeft: '2.5rem' }} aria-label="Report Type">
              <option>All Report Types</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            type="button" 
            className="pagination-btn" 
            style={{ width: '120px', height: '38px', borderRadius: '8px', display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center', background: 'white' }}
            onClick={handleClearFilters}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path></svg>
            Clear Filters
          </button>
          
          <button 
            type="button" 
            className="btn-submit-request" 
            style={{ height: '38px', minWidth: '130px', display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center' }}
            onClick={handleApplyFilters}
            disabled={loading}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
            {loading ? 'Applying...' : 'Apply Filters'}
          </button>
        </div>
      </div>

      {/* Metrics Row Cards */}
      <div className="grid-4" style={{ gap: '1rem' }}>
        {/* Card 1: Total Reports */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', textAlign: 'left' }}>
          <div className="quota-icon-badge green" style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.08)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
          </div>
          <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0, textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Total Reports</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>0</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No reports generated</span>
          </div>
        </div>

        {/* Card 2: Data Exports */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', textAlign: 'left' }}>
          <div className="quota-icon-badge green" style={{ width: '40px', height: '40px', background: 'rgba(34, 197, 94, 0.08)', color: 'var(--status-present)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          </div>
          <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0, textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Data Exports</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>0</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No exports yet</span>
          </div>
        </div>

        {/* Card 3: Scheduled Reports */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', textAlign: 'left' }}>
          <div className="quota-icon-badge purple" style={{ width: '40px', height: '40px', background: 'rgba(124, 58, 237, 0.08)', color: 'var(--accent-purple)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
          </div>
          <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0, textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Scheduled Reports</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>0</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No schedules set</span>
          </div>
        </div>

        {/* Card 4: Insights Available */}
        <div className="card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', textAlign: 'left' }}>
          <div className="quota-icon-badge purple" style={{ width: '40px', height: '40px', background: 'rgba(245, 158, 11, 0.08)', color: '#f59e0b' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>
          </div>
          <div className="employee-list-checkin" style={{ alignItems: 'flex-start', minWidth: 0, textAlign: 'left' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Insights Available</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--text-primary)' }}>0</strong>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>No insights yet</span>
          </div>
        </div>
      </div>

      {/* Main split grid */}
      <div className="grid-2" style={{ gap: '1.5rem' }}>
        
        {/* Left Card: Quick Access */}
        <div className="card glass-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
          <div className="card-title-row" style={{ borderBottom: '1px solid var(--border-glass)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Quick Access</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Commonly used reports</p>
            </div>
          </div>

          {/* Grid list of reports */}
          <div className="grid-2" style={{ gap: '0.75rem', flexGrow: 1 }}>
            
            {/* Report 1 */}
            <button 
              type="button" 
              className="employee-list-row" 
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', width: '100%', cursor: 'pointer' }}
              onClick={() => showToast('Opening Employee Directory Report...', 'info')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <div className="quota-icon-badge green" style={{ width: '32px', height: '32px', background: 'rgba(34, 197, 94, 0.06)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Employee Directory</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>View and export employee information</span>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&gt;</span>
            </button>

            {/* Report 2 */}
            <button 
              type="button" 
              className="employee-list-row" 
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', width: '100%', cursor: 'pointer' }}
              onClick={() => showToast('Opening Attendance Summary Report...', 'info')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <div className="quota-icon-badge green" style={{ width: '32px', height: '32px', background: 'rgba(34, 197, 94, 0.06)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Attendance Summary</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Attendance overview and analytics</span>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&gt;</span>
            </button>

            {/* Report 3 */}
            <button 
              type="button" 
              className="employee-list-row" 
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', width: '100%', cursor: 'pointer' }}
              onClick={() => showToast('Opening Payroll Summary Report...', 'info')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <div className="quota-icon-badge purple" style={{ width: '32px', height: '32px', background: 'rgba(99, 102, 241, 0.06)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Payroll Summary</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Payroll run summary and breakdown</span>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&gt;</span>
            </button>

            {/* Report 4 */}
            <button 
              type="button" 
              className="employee-list-row" 
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', width: '100%', cursor: 'pointer' }}
              onClick={() => showToast('Opening Department Analysis Report...', 'info')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <div className="quota-icon-badge purple" style={{ width: '32px', height: '32px', background: 'rgba(99, 102, 241, 0.06)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M12 2v10l8 5"></path></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Department Analysis</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Department wise performance insights</span>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&gt;</span>
            </button>

            {/* Report 5 */}
            <button 
              type="button" 
              className="employee-list-row" 
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', width: '100%', cursor: 'pointer' }}
              onClick={() => showToast('Opening Leave Summary Report...', 'info')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <div className="quota-icon-badge green" style={{ width: '32px', height: '32px', background: 'rgba(34, 197, 94, 0.06)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Leave Summary</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Leave usage and balance report</span>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&gt;</span>
            </button>

            {/* Report 6 */}
            <button 
              type="button" 
              className="employee-list-row" 
              style={{ padding: '0.75rem 1rem', borderRadius: '10px', width: '100%', cursor: 'pointer' }}
              onClick={() => showToast('Opening Statutory Reports...', 'info')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                <div className="quota-icon-badge green" style={{ width: '32px', height: '32px', background: 'rgba(34, 197, 94, 0.06)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>Statutory Reports</strong>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PF, ESI, PT and other statutory reports</span>
                </div>
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>&gt;</span>
            </button>

          </div>

          {/* View all button */}
          <div style={{ marginTop: '1.25rem' }}>
            <button 
              type="button" 
              className="pagination-btn" 
              style={{ width: '100%', height: '36px', borderRadius: '8px', display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center', background: 'white' }}
              onClick={() => showToast('Loading additional report templates...', 'info')}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>
              View All Report Types
            </button>
          </div>
        </div>

        {/* Right Card: Coming Soon mock block */}
        <div className="card glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
          
          {/* Main graphic dashboard mockup */}
          <div className="illustration-dashboard-coming-soon" style={{ marginBottom: '1.5rem', position: 'relative' }}>
            <svg width="180" height="120" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.95 }} aria-hidden="true">
              <rect x="20" y="10" width="160" height="100" rx="6" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
              <line x1="30" y1="22" x2="170" y2="22" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="30" y="34" width="40" height="60" rx="3" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5" />
              
              <rect x="80" y="34" width="90" height="24" rx="3" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5" />
              <path d="M85 46c5-4 15-4 20 0s15 4 20 0" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
              
              <rect x="80" y="66" width="90" height="28" rx="3" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1.5" />
              <line x1="90" y1="80" x2="160" y2="80" stroke="#94A3B8" strokeWidth="1.5" />
              <circle cx="160" cy="88" r="10" fill="#2563EB" />
              <circle cx="160" cy="88" r="5" fill="#FFFFFF" />
            </svg>
          </div>

          <strong style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'block', marginBottom: '0.5rem' }}>
            Coming soon! Advanced Reports & Analytics
          </strong>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '340px', display: 'block', marginBottom: '1.5rem', lineHeight: '1.4' }}>
            We're building a powerful reporting engine with interactive dashboards, trend analysis, and customizable reports.
          </span>

          <button 
            type="button" 
            className="pagination-btn" 
            style={{ width: '140px', height: '36px', borderRadius: '8px', display: 'flex', gap: '0.4rem', alignItems: 'center', justifyContent: 'center', background: 'white' }}
            onClick={() => showToast('Subscription registered! You will be notified on release.', 'success')}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
            Notify Me
          </button>

          {/* Bottom alert block */}
          <div style={{ background: '#f8fafc', border: '1px solid var(--border-glass)', borderRadius: '8px', padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem', width: '100%', textAlign: 'left' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Comprehensive employee activity and payroll logs will be available here.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
