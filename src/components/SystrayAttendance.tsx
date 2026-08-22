import { useState, useEffect } from 'react';
import { mockCheckIn, mockCheckOut, type Attendance, getStoredData } from '../mockApi';
import { showToast } from './Toast';

interface SystrayAttendanceProps {
  employeeId: string;
  onAttendanceChange?: () => void;
}

export default function SystrayAttendance({ employeeId, onAttendanceChange }: SystrayAttendanceProps) {
  const [activeAttendance, setActiveAttendance] = useState<Attendance | null>(null);
  const [elapsedTime, setElapsedTime] = useState<string>('00:00:00');
  const [loading, setLoading] = useState(false);

  // Sync current check-in state
  const syncAttendanceState = () => {
    const logs = getStoredData<Attendance>('hrms_attendance');
    const today = new Date().toISOString().split('T')[0];
    
    // Find active (checked-in with no checkout) record for today
    const active = logs.find(
      (a) => a.employeeId === employeeId && a.date === today && !a.checkOutAt
    );

    setActiveAttendance(active || null);
  };

  useEffect(() => {
    syncAttendanceState();

    // Listen for global attendance changes to sync multiple tabs/views
    const handleSync = () => syncAttendanceState();
    window.addEventListener('hrms-attendance-update', handleSync);
    return () => window.removeEventListener('hrms-attendance-update', handleSync);
  }, [employeeId]);

  // running timer
  useEffect(() => {
    if (!activeAttendance || !activeAttendance.checkInAt) {
      setElapsedTime('00:00:00');
      return;
    }

    const timer = setInterval(() => {
      const checkInTime = new Date(activeAttendance.checkInAt!).getTime();
      const now = new Date().getTime();
      const diffMs = now - checkInTime;

      if (diffMs < 0) {
        setElapsedTime('00:00:00');
        return;
      }

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diffMs % (1000 * 60)) / 1000);

      const pad = (n: number) => String(n).padStart(2, '0');
      setElapsedTime(`${pad(hours)}:${pad(mins)}:${pad(secs)}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeAttendance]);

  const handleCheckIn = async () => {
    setLoading(true);
    try {
      const record = await mockCheckIn(employeeId);
      showToast('Checked in successfully!', 'success');
      
      // Update state
      setActiveAttendance(record);
      
      // Dispatch update events
      window.dispatchEvent(new Event('hrms-attendance-update'));
      if (onAttendanceChange) onAttendanceChange();
    } catch (err: any) {
      showToast(err.message || 'Check-in failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
    try {
      const record = await mockCheckOut(employeeId);
      showToast(`Checked out. Hours worked: ${record.workHours}h`, 'success');
      
      // Update state
      setActiveAttendance(null);
      
      // Dispatch update events
      window.dispatchEvent(new Event('hrms-attendance-update'));
      if (onAttendanceChange) onAttendanceChange();
    } catch (err: any) {
      showToast(err.message || 'Check-out failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="systray-widget" aria-label="Attendance status controls">
      {activeAttendance ? (
        <>
          <span className="systray-status active" aria-hidden="true"></span>
          <span className="timer-display" aria-label={`Active work time: ${elapsedTime}`}>
            {elapsedTime}
          </span>
          <button 
            type="button" 
            className="btn-checkout-systray" 
            onClick={handleCheckOut}
            disabled={loading}
          >
            Check Out
          </button>
        </>
      ) : (
        <>
          <span className="systray-status" aria-hidden="true"></span>
          <span className="timer-display inactive">Checked Out</span>
          <button 
            type="button" 
            className="btn-checkin-systray" 
            onClick={handleCheckIn}
            disabled={loading}
          >
            Check In
          </button>
        </>
      )}
      <style>{`
        .systray-widget {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background-color: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 0.35rem 0.85rem;
          border-radius: 50px;
          font-family: var(--font-body);
        }

        .timer-display {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          min-width: 70px;
          text-align: center;
        }

        .timer-display.inactive {
          color: var(--text-secondary);
          font-weight: 500;
        }

        .btn-checkin-systray, .btn-checkout-systray {
          font-family: var(--font-heading);
          font-size: 0.8rem;
          font-weight: 600;
          border: none;
          border-radius: 50px;
          cursor: pointer;
          padding: 0.35rem 0.9rem;
          transition: all var(--transition-speed);
        }

        .btn-checkin-systray {
          background-color: var(--status-present);
          color: white;
        }

        .btn-checkin-systray:hover {
          background-color: #059669;
          transform: translateY(-0.5px);
        }

        .btn-checkout-systray {
          background-color: var(--error);
          color: white;
        }

        .btn-checkout-systray:hover {
          background-color: #dc2626;
          transform: translateY(-0.5px);
        }

        .btn-checkin-systray:disabled, .btn-checkout-systray:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
      `}</style>
    </div>
  );
}
