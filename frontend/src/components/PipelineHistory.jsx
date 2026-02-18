import React, { useEffect, useState } from 'react';
import { Gauge } from 'lucide-react';
import { dashboardApi } from '../services/api';

function fmt(ts) {
  return new Date(ts).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' });
}

export default function PipelineHistory() {
  const [runs, setRuns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.pipelines()
      .then((r) => setRuns(r.data.runs))
      .catch(() => setRuns([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="card">
      <div className="card-header"><h3>Agent Execution History</h3></div>
      <div className="card-body">
        {loading
          ? <p className="muted">Loading…</p>
          : runs.length === 0
            ? <p className="muted">No pipeline runs yet. Generate some content first.</p>
            : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--clr-border, #334155)', textAlign: 'left' }}>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Intent</th>
                    <th style={{ padding: '0.4rem 0.6rem' }}>ICP</th>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Channel</th>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Platform</th>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Score</th>
                    <th style={{ padding: '0.4rem 0.6rem' }}>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--clr-border, #1e293b)' }}>
                      <td style={{ padding: '0.4rem 0.6rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.intent || '—'}
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem' }}>{r.icp_id || '—'}</td>
                      <td style={{ padding: '0.4rem 0.6rem' }}>{r.channel}</td>
                      <td style={{ padding: '0.4rem 0.6rem' }}>{r.platform}</td>
                      <td style={{ padding: '0.4rem 0.6rem', color: 'var(--clr-muted, #94a3b8)' }}>
                        {r.priority_score.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.4rem 0.6rem', color: 'var(--clr-muted, #94a3b8)' }}>
                        {fmt(r.timestamp)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
        }
      </div>
    </div>
  );
}
