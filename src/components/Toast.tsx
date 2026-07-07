import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface ToastMessage {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastProps {
    toasts: ToastMessage[];
    removeToast: (id: number) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, removeToast }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            zIndex: 9999,
            pointerEvents: 'none'
        }}>
            {(toasts || []).map(toast => (
                <Toast key={toast.id} toast={toast} removeToast={removeToast} />
            ))}
        </div>
    );
};

const Toast: React.FC<{ toast: ToastMessage, removeToast: (id: number) => void }> = ({ toast, removeToast }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            removeToast(toast.id);
        }, 4000);
        return () => clearTimeout(timer);
    }, [toast.id, removeToast]);

    let Icon = Info;
    let color = 'var(--accent-blue)';

    if (toast.type === 'success') {
        Icon = CheckCircle;
        color = 'var(--accent-green)';
    } else if (toast.type === 'warning' || toast.type === 'error') {
        Icon = AlertTriangle;
        color = 'var(--danger)';
    }

    return (
        <div className="glass-panel" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'var(--bg-panel)',
            borderLeft: `4px solid ${color}`,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            pointerEvents: 'auto',
            animation: 'slideInRight 0.3s ease-out forwards',
            minWidth: '250px'
        }}>
            <div style={{ color, display: 'flex' }}>
                <Icon size={20} />
            </div>
            <div style={{ flex: 1, color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>
                {toast.message}
            </div>
            <button
                onClick={() => removeToast(toast.id)}
                style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', display: 'flex', padding: '4px', borderRadius: '4px'
                }}
            >
                <X size={16} />
            </button>

        </div>
    );
};
