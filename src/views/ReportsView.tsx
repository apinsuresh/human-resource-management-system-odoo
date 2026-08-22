import { useState } from 'react';
import { showToast } from '../components/Toast';

// ─── Mini Sparkline SVG ───────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80, h = 28;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} />
    </svg>
  );
}

// ─── Donut Chart SVG ──────────────────────────────────────────────────────────
function DonutChart({ segments, total }: { segments: { value: number; color: string }[]; total: number }) {
  const r = 54, cx = 70, cy = 70, strokeW = 18;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-color)" strokeWidth={strokeW} />
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const gap = circ - dash;
        const el = (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={strokeW}
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-offset}
            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
        );
        offset += dash;
        return el;
      })}
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text-primary)">{total}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fill="var(--text-secondary)">Total</text>
    </svg>
  );
}

// ─── Attendance Radial ────────────────────────────────────────────────────────
function AttendanceRadial({ pct }: { pct: number }) {
  const r = 52, cx = 70, cy = 70, strokeW = 12;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" aria-hidden="true">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border-color)" strokeWidth={strokeW} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#6366f1" strokeWidth={strokeW}
        strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--text-primary)">{pct}%</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="var(--text-secondary)">Attendance Rate</text>
    </svg>
  );
}

// ─── Stacked Bar Chart ────────────────────────────────────────────────────────
function StackedBarChart() {
  const days = ['01 May','08 May','15 May','22 May','31 May'];
  const data = [
    { present: 68, absent: 10, leave: 14, half: 8 },
    { present: 72, absent: 8,  leave: 12, half: 8 },
    { present: 64, absent: 18, leave: 15, half: 6 },
    { present: 75, absent: 9,  leave: 10, half: 6 },
    { present: 70, absent: 11, leave: 13, half: 6 },
  ];
  const colors = { present: '#22c55e', absent: '#ef4444', leave: '#3b82f6', half: '#f59e0b' };
  const maxVal = 110;
  const w = 440, h = 160, barW = 36, gap = (w - days.length * barW) / (days.length + 1);
  return (
    <svg width="100%" height={h + 30} viewBox={`0 0 ${w} ${h + 30}`} aria-hidden="true">
      {[0,25,50,75,100].map(g => (
        <g key={g}>
          <line x1="30" y1={h - (g / maxVal) * h} x2={w} y2={h - (g / maxVal) * h} stroke="var(--border-color)" strokeWidth="1" />
          <text x="24" y={h - (g / maxVal) * h + 4} textAnchor="end" fontSize="9" fill="var(--text-muted)">{g}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = gap + i * (barW + gap);
        const sections = [
          { val: d.present, color: colors.present },
          { val: d.absent,  color: colors.absent },
          { val: d.leave,   color: colors.leave },
          { val: d.half,    color: colors.half },
        ];
        let stackY = h;
        return (
          <g key={i}>
            {sections.map((s, j) => {
              const sh = (s.val / maxVal) * h;
              stackY -= sh;
              return <rect key={j} x={x} y={stackY} width={barW} height={sh} fill={s.color} rx="2" />;
            })}
            <text x={x + barW / 2} y={h + 16} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{days[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Payroll Line Chart ───────────────────────────────────────────────────────
function PayrollLineChart() {
  const labels = ['01 May','08 May','15 May','22 May','31 May'];
  const total = [120000,150000,170000,210000,240000];
  const net   = [95000, 120000,140000,168450,200000];
  const maxV = 250000;
  const w = 420, h = 150;
  const pts = (arr: number[]) => arr.map((v, i) => {
    const x = 30 + (i / (arr.length - 1)) * (w - 40);
    const y = h - (v / maxV) * h;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width="100%" height={h + 30} viewBox={`0 0 ${w} ${h + 30}`} aria-hidden="true">
      {[0,50000,100000,150000,200000,250000].map(g => (
        <g key={g}>
          <line x1="30" y1={h - (g / maxV) * h} x2={w} y2={h - (g / maxV) * h} stroke="var(--border-color)" strokeWidth="1" />
          <text x="28" y={h - (g / maxV) * h + 4} textAnchor="end" fontSize="8" fill="var(--text-muted)">{g >= 1000 ? `${g/1000}K` : g}</text>
        </g>
      ))}
      <polyline fill="none" stroke="#8b5cf6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts(total)} />
      <polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={pts(net)} />
      {labels.map((l, i) => {
        const x = 30 + (i / (labels.length - 1)) * (w - 40);
        return <text key={i} x={x} y={h + 16} textAnchor="middle" fontSize="9" fill="var(--text-secondary)">{l}</text>;
      })}
    </svg>
  );
}

// ─── Horizontal Bar (Department) ──────────────────────────────────────────────
function DeptBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
      <span style={{ width: '80px', fontSize: '0.78rem', color: 'var(--text-secondary)', textAlign: 'right', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: '4px', height: '10px', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, background: color, height: '100%', borderRadius: '4px', transition: 'width 0.6s ease' }} />
      </div>
      <span style={{ width: '24px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportsView() {
  const [dateRange, setDateRange] = useState('01 May 2025 – 31 May 2025');
  const [department, setDepartment] = useState('All Departments');
  const [reportType, setReportType] = useState('All Report Types');

  const handleApplyFilters = () => showToast('Filters applied successfully.', 'success');
  const handleClearFilters = () => {
    setDateRange('01 May 2025 – 31 May 2025');
    setDepartment('All Departments');
    setReportType('All Report Types');
    showToast('Filters cleared.', 'info');
  };

  const kpiCards = [
    { label: 'Total Reports',       value: 24, trend: '+18% vs Apr 2025', color: '#6366f1', trendUp: true,  spark: [8,10,9,12,11,14,13,15,16,14,18,20,18,22,24], icon: 'M9 17H7A5 5 0 0 1 7 7H9M15 7h2a5 5 0 0 1 0 10h-2M8 12h8' },
    { label: 'Data Exports',        value: 12, trend: '+20% vs Apr 2025', color: '#22c55e', trendUp: true,  spark: [4,5,4,6,5,7,6,8,7,9,8,10,9,11,12], icon: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3' },
    { label: 'Scheduled Reports',   value: 8,  trend: '+14% vs Apr 2025', color: '#f59e0b', trendUp: true,  spark: [3,4,3,5,4,5,4,6,5,6,5,7,6,7,8], icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { label: 'Insights Available',  value: 16, trend: '+23% vs Apr 2025', color: '#3b82f6', trendUp: true,  spark: [5,7,6,8,7,9,8,10,9,11,10,12,11,14,16], icon: 'M18 20V10M12 20V4M6 20v-6' },
  ];

  const reportTypes = [
    { label: 'Attendance Reports', value: 8,  pct: 33, color: '#22c55e' },
    { label: 'Payroll Reports',    value: 6,  pct: 25, color: '#6366f1' },
    { label: 'Leave Reports',      value: 4,  pct: 17, color: '#3b82f6' },
    { label: 'Statutory Reports',  value: 3,  pct: 13, color: '#f59e0b' },
    { label: 'Others',             value: 3,  pct: 12, color: '#ec4899' },
  ];

  const deptData = [
    { label: 'Engineering', value: 58, color: '#22c55e' },
    { label: 'Sales',       value: 42, color: '#6366f1' },
    { label: 'HR',          value: 26, color: '#8b5cf6' },
    { label: 'Finance',     value: 19, color: '#f59e0b' },
    { label: 'Operations',  value: 16, color: '#3b82f6' },
  ];

  const insights = [
    { icon: '📈', text: 'Attendance improved by 12% compared to April 2025.' },
    { icon: '💡', text: 'Payroll processing time reduced by 8% this month.' },
    { icon: '🔔', text: 'Leave requests increased by 15% compared to last month.' },
    { icon: '📅', text: '3 reports are scheduled to run tomorrow.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '1.25rem' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: '10px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          </div>
          <div>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>Reports &amp; Analytics Console</h2>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '2px 0 0' }}>Access and analyze employee activity, payroll data, and insights.</p>
          </div>
        </div>
        <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', fontSize: '0.82rem', whiteSpace: 'nowrap' }}
          onClick={() => showToast('Dashboard exported successfully.', 'success')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Export Dashboard
        </button>
      </div>

      {/* ── Filter Bar ── */}
      <div className="card glass-card" style={{ padding: '0.9rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Date Range */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '200px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.45rem 0.75rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          <select value={dateRange} onChange={e => setDateRange(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.82rem', color: 'var(--text-primary)', flex: 1, cursor: 'pointer' }} aria-label="Date range">
            <option>01 May 2025 – 31 May 2025</option>
            <option>This Month</option>
            <option>Last 30 Days</option>
            <option>Last Quarter</option>
          </select>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {/* Department */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '160px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.45rem 0.75rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          <select value={department} onChange={e => setDepartment(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.82rem', color: 'var(--text-primary)', flex: 1, cursor: 'pointer' }} aria-label="Department">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>HR</option>
            <option>Finance</option>
            <option>Sales</option>
            <option>Operations</option>
          </select>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {/* Report Type */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1', minWidth: '160px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.45rem 0.75rem' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <select value={reportType} onChange={e => setReportType(e.target.value)} style={{ background: 'transparent', border: 'none', outline: 'none', fontSize: '0.82rem', color: 'var(--text-primary)', flex: 1, cursor: 'pointer' }} aria-label="Report type">
            <option>All Report Types</option>
            <option>Attendance Reports</option>
            <option>Payroll Reports</option>
            <option>Leave Reports</option>
          </select>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"/></svg>
        </div>
        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
          <button className="btn btn-secondary" onClick={handleClearFilters} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Clear Filters
          </button>
          <button className="btn btn-primary" onClick={handleApplyFilters} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
            Apply Filters
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem' }}>
        {kpiCards.map((kpi, i) => (
          <div key={i} className="card glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: 0, fontWeight: 500 }}>{kpi.label}</p>
                <p style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0', lineHeight: 1 }}>{kpi.value}</p>
              </div>
              <div style={{ background: `${kpi.color}18`, borderRadius: '8px', padding: '0.4rem', display: 'flex' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={kpi.color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={kpi.icon}/></svg>
              </div>
            </div>
            <Sparkline data={kpi.spark} color={kpi.color} />
            <p style={{ fontSize: '0.72rem', color: kpi.trendUp ? '#22c55e' : '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <span>{kpi.trendUp ? '↑' : '↓'}</span>{kpi.trend}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Employee Activity */}
        <div className="card glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Employee Activity Overview</h3>
            <select style={{ fontSize: '0.78rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }} aria-label="Activity period">
              <option>Daily</option><option>Weekly</option><option>Monthly</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            {[['#22c55e','Present'],['#ef4444','Absent'],['#3b82f6','On Leave'],['#f59e0b','Half Day']].map(([c,l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: c, flexShrink: 0 }} />{l}
              </span>
            ))}
          </div>
          <StackedBarChart />
        </div>

        {/* Payroll Summary */}
        <div className="card glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Payroll Summary</h3>
            <select style={{ fontSize: '0.78rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }} aria-label="Payroll period">
              <option>Monthly</option><option>Quarterly</option><option>Yearly</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.5rem' }}>
            {[['#8b5cf6','Total Payroll'],['#3b82f6','Net Payroll']].map(([c,l]) => (
              <span key={l} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span style={{ width: '12px', height: '3px', background: c, borderRadius: '2px', flexShrink: 0 }} />{l}
              </span>
            ))}
          </div>
          <PayrollLineChart />
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
            <div><p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>Total Payroll</p><p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>₹2,10,000</p></div>
            <div><p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', margin: 0 }}>Net Payroll</p><p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#3b82f6', margin: 0 }}>₹1,68,450</p></div>
          </div>
        </div>
      </div>

      {/* ── Charts Row 2 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
        {/* Reports by Type */}
        <div className="card glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 1rem', color: 'var(--text-primary)' }}>Reports by Type</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <DonutChart segments={reportTypes.map(r => ({ value: r.value, color: r.color }))} total={24} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', flex: 1 }}>
              {reportTypes.map(r => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: r.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, color: 'var(--text-secondary)' }}>{r.label}</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.value}</span>
                  <span style={{ color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>({r.pct}%)</span>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-secondary" onClick={() => showToast('Viewing all report types.', 'info')} style={{ width: '100%', marginTop: '1rem', fontSize: '0.78rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
            View All Report Types
          </button>
        </div>

        {/* Department Overview */}
        <div className="card glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>Department Overview</h3>
            <select style={{ fontSize: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem 0.5rem', background: 'var(--bg-secondary)', color: 'var(--text-primary)', cursor: 'pointer' }} aria-label="Overview metric">
              <option>By Employees</option><option>By Salary</option><option>By Attendance</option>
            </select>
          </div>
          <div style={{ marginTop: '0.5rem' }}>
            {deptData.map(d => <DeptBar key={d.label} label={d.label} value={d.value} max={65} color={d.color} />)}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {[0,10,20,30,40,50,60].map(n => <span key={n}>{n}</span>)}
          </div>
        </div>

        {/* Attendance Summary */}
        <div className="card glass-card" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: '0 0 0.75rem', color: 'var(--text-primary)' }}>Attendance Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <AttendanceRadial pct={87} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {[
              { icon: '📅', label: 'Total Working Days', value: '23', color: '#6366f1' },
              { icon: '✅', label: 'Days Present',       value: '20', color: '#22c55e' },
              { icon: '❌', label: 'Days Absent',        value: '2',  color: '#ef4444' },
              { icon: '✈️', label: 'On Leave',           value: '1',  color: '#f59e0b' },
            ].map(row => (
              <div key={row.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.75rem' }}>{row.icon}</span>
                  <span style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                </div>
                <span style={{ fontWeight: 700, color: row.color }}>{row.value}</span>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary" onClick={() => showToast('Opening full attendance report.', 'info')} style={{ width: '100%', marginTop: '1rem', fontSize: '0.78rem', padding: '0.45rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            View Attendance Report
          </button>
        </div>
      </div>

      {/* ── Insights & Recommendations ── */}
      <div className="card glass-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-primary)' }}>
            <span style={{ fontSize: '1rem' }}>✨</span> Insights &amp; Recommendations
          </h3>
          <button className="btn btn-primary" onClick={() => showToast('Viewing all insights.', 'info')} style={{ fontSize: '0.78rem', padding: '0.4rem 0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            View All Insights
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0.75rem' }}>
          {insights.map((ins, i) => (
            <div key={i} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <span style={{ fontSize: '1.2rem' }}>{ins.icon}</span>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>{ins.text}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
