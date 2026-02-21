import React, { useEffect, useState } from 'react';
import { Phone, CheckCircle, XCircle, Clock } from 'lucide-react';
import { dashboardApi } from '../services/api';

export default function CallQueue() {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchQueue = async () => {
        try {
            setLoading(true);
            const response = await dashboardApi.getCallQueue();
            setCalls(response.data.calls);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch call queue:', err);
            setError('Failed to load call queue.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
    }, []);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await dashboardApi.updateCallStatus(id, newStatus);
            setCalls((prev) =>
                prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
            );
        } catch (err) {
            console.error('Failed to update call status:', err);
            alert('Failed to update status.');
        }
    };

    const handleDial = async (id, phone) => {
        try {
            // Sanitize: keep only digits and plus sign
            const cleanPhone = String(phone).replace(/[^\d+]/g, '');
            if (!cleanPhone) {
                alert('Invalid phone number');
                return;
            }

            // First update status to dialling in UI/Backend
            await handleStatusUpdate(id, 'dialling');

            // Trigger the OS dialer using an anchor tag for better compatibility
            const telLink = document.createElement('a');
            telLink.href = `tel:${cleanPhone}`;
            telLink.click();
        } catch (err) {
            console.error('Failed to initiate dialling:', err);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'done': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'dialling': return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
            default: return <Clock className="w-4 h-4 text-slate-400" />;
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div className="icon-box">
                        <Phone className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="hero-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Call Queue</h1>
                        <p className="muted" style={{ fontSize: '0.85rem' }}>Manage AI-generated outreach calls and scripts.</p>
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={fetchQueue} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-body" style={{ padding: 0 }}>
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center' }} className="muted">Loading calls...</div>
                    ) : error ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--clr-red)' }}>{error}</div>
                    ) : calls.length === 0 ? (
                        <div style={{ padding: '3rem', textAlign: 'center' }} className="muted">
                            <Phone className="w-12 h-12 m-auto mb-4 opacity-20" />
                            <p>Your call queue is empty.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Lead</th>
                                        <th>Phone</th>
                                        <th>Script / Context</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th style={{ textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {calls.map((call) => (
                                        <tr key={call.id}>
                                            <td>
                                                <div style={{ fontWeight: 500 }}>{call.lead_name}</div>
                                                <div className="muted" style={{ fontSize: '0.7rem' }}>
                                                    Added {new Date(call.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="font-mono" style={{ fontSize: '0.8rem' }}>{call.phone}</td>
                                            <td>
                                                <div className="script-preview" title={call.script}>
                                                    {call.script.length > 80 ? call.script.substring(0, 80) + '...' : call.script}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`priority-badge priority-${call.priority}`}>
                                                    P{call.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                                                    {getStatusIcon(call.status)}
                                                    <span style={{ textTransform: 'capitalize' }}>{call.status}</span>
                                                </div>
                                            </td>
                                            <td style={{ textAlign: 'right' }}>
                                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                    {call.status === 'queued' && (
                                                        <button
                                                            className="btn-icon-sm"
                                                            onClick={() => handleDial(call.id, call.phone)}
                                                            title="Dial Phone"
                                                            style={{ borderColor: 'var(--clr-indigo-400)', color: 'var(--clr-indigo-400)' }}
                                                        >
                                                            <Phone className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {['queued', 'dialling'].includes(call.status) && (
                                                        <button
                                                            className="btn-icon-sm"
                                                            onClick={() => handleStatusUpdate(call.id, 'done')}
                                                            title="Mark as Done"
                                                        >
                                                            <CheckCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {['queued', 'dialling'].includes(call.status) && (
                                                        <button
                                                            className="btn-icon-sm btn-icon-red"
                                                            onClick={() => handleStatusUpdate(call.id, 'failed')}
                                                            title="Mark as Failed"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {call.status !== 'queued' && (
                                                        <button
                                                            className="btn-text-sm"
                                                            onClick={() => handleStatusUpdate(call.id, 'queued')}
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .script-preview {
          max-width: 300px;
          color: var(--clr-slate-300);
          font-size: 0.8rem;
          line-height: 1.4;
        }
        .priority-badge {
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .priority-1 { background: rgba(239, 68, 68, 0.15); color: #f87171; }
        .priority-5 { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
        .priority-10 { background: rgba(148, 163, 184, 0.15); color: #94a3b8; }
        
        .btn-icon-sm {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--clr-border);
          padding: 0.4rem;
          border-radius: 6px;
          cursor: pointer;
          color: var(--clr-slate-300);
          transition: all 0.2s;
        }
        .btn-icon-sm:hover {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }
        .btn-icon-red:hover {
          color: #f87171;
          border-color: rgba(248, 113, 113, 0.5);
        }
        .btn-text-sm {
          background: none;
          border: none;
          color: var(--clr-indigo-400);
          font-size: 0.75rem;
          cursor: pointer;
        }
        .btn-text-sm:hover { text-decoration: underline; }
      `}</style>
        </div>
    );
}
