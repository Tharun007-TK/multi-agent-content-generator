import React, { useEffect, useState } from 'react';
import { BarChart2, Send, Linkedin, Mail, Phone, Activity } from 'lucide-react';
import { dashboardApi } from '../services/api';

const CHANNEL_ICONS = { linkedin: Linkedin, email: Mail, call: Phone };

export default function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    dashboardApi.stats()
      .then((r) => setStats(r.data))
      .catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) return <p className="muted" style={{ color: 'var(--clr-danger, #f87171)' }}>{error}</p>;
  if (!stats) return <p className="muted">Loading…</p>;

  return (
    <div className="grid-3">
      {/* Total campaigns */}
      <div className="card">
        <div className="card-header"><h3>Campaigns Generated</h3></div>
        <div className="card-body">
          <div className="metrics">
            <div>
              <p className="metric-label">Total</p>
              <p className="metric-value">{stats.total_campaigns}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exports by channel */}
      <div className="card">
        <div className="card-header"><h3>Exports by Channel</h3></div>
        <div className="card-body">
          {stats.exports_by_channel.length === 0
            ? <p className="muted">No exports yet.</p>
            : <div className="metrics">
                {stats.exports_by_channel.map(({ channel, count }) => {
                  const Icon = CHANNEL_ICONS[channel] || BarChart2;
                  return (
                    <div key={channel}>
                      <p className="metric-label" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Icon className="w-3.5 h-3.5" /> {channel}
                      </p>
                      <p className="metric-value">{count}</p>
                    </div>
                  );
                })}
              </div>
          }
        </div>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="card-header"><h3>Recent Activity</h3></div>
        <div className="card-body">
          {stats.recent_activity.length === 0
            ? <p className="muted">No activity yet.</p>
            : <ul className="activity-list">
                {stats.recent_activity.map((item) => (
                  <li key={item.id}>
                    <span className="dot" />
                    <span style={{ fontSize: '0.78rem' }}>
                      [{item.action}] {item.summary || item.channel}
                    </span>
                  </li>
                ))}
              </ul>
          }
        </div>
      </div>
    </div>
  );
}
