import { useState, useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  const event = new CustomEvent('hrms-toast', {
    detail: { message, type, id: Math.random().toString(36).substring(2, 9) }
  });
  window.dispatchEvent(event);
};

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<Omit<ToastMessage, 'id'> & { id: string }>;
      const { message, type, id } = customEvent.detail;
      
      setToasts((prev) => [...prev, { id, message, type }]);

      // Remove after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };

    window.addEventListener('hrms-toast', handleToastEvent);
    return () => window.removeEventListener('hrms-toast', handleToastEvent);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`} role="alert">
          <div className="toast-icon">
            {toast.type === 'success' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
            {toast.type === 'error' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>}
            {toast.type === 'info' && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button 
            type="button" 
            className="toast-close" 
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
      <style>{`
        .toast-container {
          position: fixed;
          bottom: 1.5rem;
          right: 1.5rem;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          max-width: 400px;
          width: calc(100vw - 3rem);
          pointer-events: none;
        }

        .toast {
          pointer-events: auto;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          color: var(--text-primary);
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          position: relative;
        }

        .toast-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-weight: bold;
          font-size: 0.8rem;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .toast-success .toast-icon {
          background-color: var(--status-present-light);
          color: var(--status-present);
        }

        .toast-error .toast-icon {
          background-color: var(--error-light);
          color: var(--error);
        }

        .toast-info .toast-icon {
          background-color: var(--accent-light);
          color: var(--accent-primary);
        }

        .toast-message {
          font-family: var(--font-body);
          font-size: 0.9rem;
          line-height: 1.4;
          flex: 1;
          word-break: break-word;
        }

        .toast-close {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 1.2rem;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          margin-left: 0.5rem;
          flex-shrink: 0;
        }

        .toast-close:hover {
          color: var(--text-primary);
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(16px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
