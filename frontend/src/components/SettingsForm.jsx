import React, { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { settingsApi } from '../services/api';

const LLM_MODELS = [
  'amazon/nova-micro-v1',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-haiku',
  'mistralai/mistral-7b-instruct',
];

export default function SettingsForm({ onToast }) {
  const [form, setForm] = useState({
    default_llm_model: 'amazon/nova-micro-v1',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    linkedin_webhook_url: '',
    openrouter_api_key: '',
    huggingface_api_key: '',
  });
  const [flags, setFlags] = useState({ openrouter_api_key_set: false, huggingface_api_key_set: false });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi.get()
      .then((r) => {
        const d = r.data;
        setForm((f) => ({
          ...f,
          default_llm_model: d.default_llm_model,
          smtp_host: d.smtp_host,
          smtp_port: d.smtp_port,
          smtp_username: d.smtp_username,
          linkedin_webhook_url: d.linkedin_webhook_url,
        }));
        setFlags({ openrouter_api_key_set: d.openrouter_api_key_set, huggingface_api_key_set: d.huggingface_api_key_set });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {};
    // Only send non-empty values
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v != null) payload[k] = v; });
    try {
      await settingsApi.update(payload);
      onToast('success', 'Settings saved successfully.');
    } catch (err) {
      onToast('error', 'Failed to save settings.');
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p className="muted">Loading settings…</p>;

  return (
    <div className="card">
      <div className="card-header"><h3>Settings</h3></div>
      <div className="card-body">
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

          {/* LLM Model */}
          <section>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-muted, #94a3b8)', marginBottom: '0.5rem' }}>LLM</p>
            <div className="field">
              <label className="field-label">Default Model</label>
              <select className="field-input" value={form.default_llm_model} onChange={set('default_llm_model')}>
                {LLM_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </section>

          {/* SMTP */}
          <section>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-muted, #94a3b8)', marginBottom: '0.5rem' }}>SMTP (Email Export)</p>
            <div className="grid-2" style={{ gap: '0.6rem' }}>
              <div className="field">
                <label className="field-label">Host</label>
                <input className="field-input" value={form.smtp_host} onChange={set('smtp_host')} placeholder="smtp.gmail.com" />
              </div>
              <div className="field">
                <label className="field-label">Port</label>
                <input className="field-input" type="number" value={form.smtp_port} onChange={set('smtp_port')} />
              </div>
              <div className="field">
                <label className="field-label">Username</label>
                <input className="field-input" value={form.smtp_username} onChange={set('smtp_username')} placeholder="you@example.com" />
              </div>
              <div className="field">
                <label className="field-label">Password</label>
                <input className="field-input" type="password" value={form.smtp_password} onChange={set('smtp_password')} placeholder="••••••••" />
              </div>
            </div>
          </section>

          {/* LinkedIn */}
          <section>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-muted, #94a3b8)', marginBottom: '0.5rem' }}>LinkedIn</p>
            <div className="field">
              <label className="field-label">Webhook URL</label>
              <input className="field-input" value={form.linkedin_webhook_url} onChange={set('linkedin_webhook_url')} placeholder="https://hooks.zapier.com/…" />
            </div>
          </section>

          {/* API Keys */}
          <section>
            <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--clr-muted, #94a3b8)', marginBottom: '0.5rem' }}>API Keys</p>
            <div className="grid-2" style={{ gap: '0.6rem' }}>
              <div className="field">
                <label className="field-label">
                  OpenRouter {flags.openrouter_api_key_set && <span style={{ color: '#34d399' }}>✓ set</span>}
                </label>
                <input className="field-input" type="password" value={form.openrouter_api_key} onChange={set('openrouter_api_key')} placeholder="sk-or-…" />
              </div>
              <div className="field">
                <label className="field-label">
                  HuggingFace {flags.huggingface_api_key_set && <span style={{ color: '#34d399' }}>✓ set</span>}
                </label>
                <input className="field-input" type="password" value={form.huggingface_api_key} onChange={set('huggingface_api_key')} placeholder="hf_…" />
              </div>
            </div>
          </section>

          <button type="submit" className="generate-btn" style={{ alignSelf: 'flex-start' }} disabled={busy}>
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> : <><Save className="w-4 h-4" /> Save Settings</>}
          </button>
        </form>
      </div>
    </div>
  );
}
