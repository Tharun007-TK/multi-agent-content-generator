import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

/**
 * Toast
 * Props:
 *  toasts   [{ id, type, message }]
 *  remove   (id) => void
 */
export default function Toast({ toasts, remove }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      zIndex: 9999,
      pointerEvents: 'none',
    }}>
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} remove={remove} />
      ))}
    </div>
  );
}

function ToastItem({ toast, remove }) {
  useEffect(() => {
    const timer = setTimeout(() => remove(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, remove]);

  const isSuccess = toast.type === 'success';
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.65rem 1rem',
      borderRadius: '0.5rem',
      background: isSuccess ? '#0f3324' : '#3b1111',
      border: `1px solid ${isSuccess ? '#34d399' : '#f87171'}`,
      color: isSuccess ? '#34d399' : '#f87171',
      fontSize: '0.82rem',
      maxWidth: '22rem',
      pointerEvents: 'all',
      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
    }}>
      {isSuccess
        ? <CheckCircle2 style={{ width: 16, height: 16, flexShrink: 0 }} />
        : <XCircle style={{ width: 16, height: 16, flexShrink: 0 }} />}
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => remove(toast.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1 }}
        aria-label="Dismiss"
      >
        <X style={{ width: 14, height: 14 }} />
      </button>
    </div>
  );
}
