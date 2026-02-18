import React, { useEffect, useState } from 'react';
import { Linkedin, Mail, Phone, Filter } from 'lucide-react';
import { dashboardApi } from '../services/api';

const CHANNEL_OPTIONS = [
  { value: '',          label: 'All' },
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'email',     label: 'Email' },
  { value: 'call',      label: 'Call' },
];

const CHANNEL_ICONS = { linkedin: Linkedin, email: Mail, call: Phone };

const STATUS_COLOR = {
  success: 'var(--clr-green, #34d399)',
  failed:  'var(--clr-red, #f87171)',
  pending: 'var(--clr-yellow, #fbbf24)',
};

function fmt(ts) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

export default function ActivityTable() {
  const [entries, setEntries] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    dashboardApi.activity(filter || undefined)
      .then((r) => setEntries(r.data.entries))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div className="card">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3>Export Activity</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            className="field-input"
            style={{ padding: '0.2rem 0.5rem', fontSize: '0.78rem' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {CHANNEL_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="card-body">
        {loading
          ? <p className="muted">Loading…</p>
          : entries.length === 0
            ? <p className="muted">No export activity yet.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--clr-border, #334155)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Channel</th>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Destination</th>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Status</th>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => {
                    const Icon = CHANNEL_ICONS[e.channel] || Mail;
                    return (
                      <tr key={e.id} style={{ borderBottom: '1px solid var(--clr-border, #1e293b)' }}>
                        <td style={{ padding: '0.4rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <Icon className="w-3.5 h-3.5" /> {e.channel}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {e.destination || '—'}
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem' }}>
                          <span style={{ color: STATUS_COLOR[e.status] || 'inherit' }}>{e.status}</span>
                        </td>
                        <td style={{ padding: '0.4rem 0.6rem', color: 'var(--clr-muted, #94a3b8)' }}>
                          {fmt(e.timestamp)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )
        }
      </div>
    </div>
  );
}
