import { useState, useEffect } from 'react';
import { type Employee, mockGetEmployees, mockGetDailyAttendanceSummary, getStoredData } from '../mockApi';
import { showToast } from '../components/Toast';

interface DirectoryProps {
  userRole: string;
}

export default function Directory({ userRole }: DirectoryProps) {
  const [employees, setEmployees] = useState<any[]>([]);
  const [dailyStatusList, setDailyStatusList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  
  // Drawer state
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

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

  useEffect(() => {
    loadDirectoryData();
    window.addEventListener('hrms-attendance-update', loadDirectoryData);
    return () => window.removeEventListener('hrms-attendance-update', loadDirectoryData);
  }, [userRole]);

  const getStatusBadge = (empId: string) => {
    const statusRecord = dailyStatusList.find(s => s.employeeId === empId);
    const status = statusRecord?.status || 'ABSENT';

    if (status === 'PRESENT') {
      return <span className="badge badge-present">● Present</span>;
    }
    if (status === 'ON_LEAVE') {
      return <span className="badge badge-leave">● On Leave</span>;
    }
    return <span className="badge badge-absent">● Absent</span>;
  };

  const getLastCheckIn = (empId: string) => {
    const logs = getStoredData<any>('hrms_attendance');
    const today = new Date().toISOString().split('T')[0];
    const record = logs.find((a: any) => a.employeeId === empId && a.date === today);
    if (record && record.checkInAt) {
      return new Date(record.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return '--:--';
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || emp.loginId.toLowerCase().includes(query) || emp.jobPosition.toLowerCase().includes(query);
    const matchesDept = deptFilter === '' || emp.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  const uniqueDepartments = Array.from(new Set(employees.map(e => e.department)));

  const handleCardClick = (empId: string) => {
    const employeesRaw = getStoredData<Employee>('hrms_employees');
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Title Header */}
      <div style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Attendance Directory</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          View and manage employee attendance status
        </p>
      </div>

      {/* Search Header Filter Bar */}
      <div className="directory-header-row card glass-card" style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem 1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="header-search-bar" style={{ flex: 1, maxWidth: 'none' }}>
          <span className="search-icon-glass" style={{ left: '14px' }}>🔍</span>
          <input 
            type="search" 
            id="search-input" 
            className="form-control" 
            style={{ paddingLeft: '2.5rem', minHeight: '38px', borderRadius: '8px' }}
            placeholder="Search by name, position, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>
            Filter by Department
          </span>
          <select 
            id="dept-filter" 
            className="form-control" 
            style={{ minHeight: '38px', borderRadius: '8px', width: '220px', padding: '0 0.75rem' }}
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

      {/* Directory list container */}
      <div className="directory-list-container">
        {filteredEmployees.map((emp) => (
          <div 
            key={emp.id} 
            className="employee-list-row"
            onClick={() => handleCardClick(emp.id)}
            onKeyDown={(e) => handleKeyDown(e, emp.id)}
            role="button"
            tabIndex={0}
            aria-label={`${emp.firstName} ${emp.lastName}, ${emp.jobPosition}. Click to view details.`}
          >
            <div className="employee-list-left">
              <div className="list-avatar-circle">
                {emp.firstName.substring(0, 2).toUpperCase()}
              </div>
              <div className="employee-list-details">
                <h4>{emp.firstName} {emp.lastName}</h4>
                <span className="subinfo">{emp.jobPosition}</span>
                <span className="subinfo" style={{ color: 'var(--text-muted)' }}>{emp.department}</span>
                <code>{emp.loginId}</code>
              </div>
            </div>

            <div className="employee-list-right">
              {/* Present badge */}
              <div className="card-status-badge">
                {getStatusBadge(emp.id)}
              </div>

              {/* Dynamic check-in detail */}
              <div className="employee-list-checkin">
                <span>Last Check-in</span>
                <strong>{getLastCheckIn(emp.id)}</strong>
              </div>

              {/* Action menu trigger */}
              <button 
                type="button" 
                className="action-dots-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(emp.id);
                }}
                title="View details"
              >
                ⋮
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="empty-state-card" style={{ padding: '3rem 2rem' }}>
          <span style={{ fontSize: '3rem', marginBottom: '1rem', display: 'block' }}>👥</span>
          <h3>No Employees Found</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Try refining your search terms or filters.</span>
        </div>
      )}

      {/* Pagination row */}
      {filteredEmployees.length > 0 && (
        <div className="pagination-bar">
          <span className="pagination-info">
            Showing 1 to {filteredEmployees.length} of {employees.length} employees
          </span>
          <div className="pagination-controls">
            <button type="button" className="pagination-btn" onClick={() => showToast('Going to previous page...', 'info')}>&lt;</button>
            <button type="button" className="pagination-btn active">1</button>
            <button type="button" className="pagination-btn" onClick={() => showToast('Going to page 2...', 'info')}>2</button>
            <button type="button" className="pagination-btn" onClick={() => showToast('Going to page 3...', 'info')}>3</button>
            <span style={{ margin: '0 0.25rem', color: 'var(--text-muted)' }}>...</span>
            <button type="button" className="pagination-btn" onClick={() => showToast('Going to last page...', 'info')}>8</button>
            <button type="button" className="pagination-btn" onClick={() => showToast('Going to next page...', 'info')}>&gt;</button>
          </div>
        </div>
      )}

      {/* View-Only Profile Side Drawer */}
      {selectedEmp && (
        <>
          <aside className="profile-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-title" style={{ zIndex: 300 }}>
            <div className="drawer-header">
              <h3 id="drawer-title">Employee Details</h3>
              <button 
                type="button" 
                className="drawer-close-btn"
                onClick={() => setSelectedEmp(null)}
                aria-label="Close details drawer"
              >
                ✕
              </button>
            </div>
            
            <div className="drawer-body">
              <div className="drawer-profile-summary">
                <div className="drawer-avatar">
                  {selectedEmp.firstName.substring(0, 2).toUpperCase()}
                </div>
                <h4>{selectedEmp.firstName} {selectedEmp.lastName}</h4>
                <span className="drawer-position">{selectedEmp.jobPosition} • {selectedEmp.department}</span>
                <span className="badge badge-leave-light" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                  {selectedEmp.loginId}
                </span>
              </div>

              <div className="drawer-section">
                <h5>Employment Info</h5>
                <div className="drawer-grid">
                  <div><strong>Employee Code:</strong> {selectedEmp.empCode}</div>
                  <div><strong>Joining Date:</strong> {selectedEmp.dateOfJoining}</div>
                  <div><strong>Location:</strong> {selectedEmp.location}</div>
                  <div><strong>Nationality:</strong> {selectedEmp.nationality}</div>
                </div>
              </div>

              <div className="drawer-section">
                <h5>Skills</h5>
                <div className="drawer-skills-list">
                  {selectedEmp.skills && selectedEmp.skills.length > 0 ? (
                    selectedEmp.skills.map(s => <span key={s} className="drawer-skill-tag">{s}</span>)
                  ) : (
                    <span className="no-skills-msg">No skills listed yet.</span>
                  )}
                </div>
              </div>

              <div className="drawer-section">
                <h5>Certifications</h5>
                <ul className="drawer-cert-list">
                  {selectedEmp.certifications && selectedEmp.certifications.length > 0 ? (
                    selectedEmp.certifications.map(c => <li key={c}>🏆 {c}</li>)
                  ) : (
                    <span className="no-skills-msg">No certifications listed.</span>
                  )}
                </ul>
              </div>
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
    </div>
  );
}
