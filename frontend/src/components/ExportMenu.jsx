import React, { useRef, useState, useEffect } from 'react';
import { Linkedin, Mail, Phone, ChevronDown, Loader2 } from 'lucide-react';
import { exportApi } from '../services/api';

const CHANNELS = [
  { key: 'linkedin', label: 'Export to LinkedIn', Icon: Linkedin },
  { key: 'email',    label: 'Send as Email',       Icon: Mail },
  { key: 'call',     label: 'Push to Call Queue',  Icon: Phone },
];

/**
 * ExportMenu
 * Props:
 *  result       {headline, body, cta, platform}  – current generated content
 *  onToast      (type: 'success'|'error', msg: string) => void
 */
export default function ExportMenu({ result, onToast }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(null);  // 'linkedin' | 'email' | 'call' | null
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ recipient: '', subject: '', lead_name: '', phone: '', priority: 5 });
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const Field = ({ label, name, type = 'text', min, max }) => (
    <div className="field" style={{ marginBottom: '0.5rem' }}>
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        type={type}
        min={min} max={max}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
      />
    </div>
  );

  const handleExport = async () => {
    setBusy(true);
    try {
      if (active === 'linkedin') {
        const r = await exportApi.toLinkedIn({ headline: result.headline, body: result.body, cta: result.cta });
        onToast('success', r.data.message);
      } else if (active === 'email') {
        const r = await exportApi.toEmail({
          subject: form.subject || result.headline,
          body: `${result.body}\n\n${result.cta}`,
          recipient: form.recipient,
        });
        onToast(r.data.success ? 'success' : 'error', r.data.message);
      } else if (active === 'call') {
        const r = await exportApi.toCall({
          lead_name: form.lead_name,
          phone: form.phone,
          script: `${result.headline}\n\n${result.body}\n\nCTA: ${result.cta}`,
          priority: Number(form.priority),
        });
        onToast('success', r.data.message);
      }
    } catch (err) {
      onToast('error', err?.response?.data?.detail || 'Export failed. Please try again.');
    } finally {
      setBusy(false);
      setActive(null);
    }
  };

  if (!result) return null;

  return (
    <div className="export-wrapper" ref={menuRef}>
      {/* Dropdown trigger */}
      <button className="export-btn" onClick={() => setOpen((o) => !o)} disabled={busy}>
        {busy
          ? <><Loader2 className="w-4 h-4 animate-spin" /> Exporting…</>
          : <>Export <ChevronDown className="w-4 h-4" /></>}
      </button>

      {open && (
        <div className="export-dropdown">
          {CHANNELS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className="export-option"
              onClick={() => { setOpen(false); setActive(key); }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* LinkedIn: no extra fields needed */}
      {active === 'linkedin' && (
        <ExportModal
          title="Export to LinkedIn"
          onConfirm={handleExport}
          onCancel={() => setActive(null)}
          busy={busy}
        >
          <p className="field-hint">Will post the generated headline, body, and CTA via LinkedIn webhook.</p>
          <pre className="export-preview">{result.headline}</pre>
        </ExportModal>
      )}

      {/* Email */}
      {active === 'email' && (
        <ExportModal
          title="Send as Email"
          onConfirm={handleExport}
          onCancel={() => setActive(null)}
          busy={busy}
        >
          <Field label="Recipient email" name="recipient" type="email" />
          <Field label="Subject (optional – defaults to headline)" name="subject" />
        </ExportModal>
      )}

      {/* Call queue */}
      {active === 'call' && (
        <ExportModal
          title="Push to Call Queue"
          onConfirm={handleExport}
          onCancel={() => setActive(null)}
          busy={busy}
        >
          <Field label="Lead name" name="lead_name" />
          <Field label="Phone number" name="phone" />
          <Field label="Priority (1 = highest, 10 = lowest)" name="priority" type="number" min={1} max={10} />
        </ExportModal>
      )}
    </div>
  );
}

function ExportModal({ title, children, onConfirm, onCancel, busy }) {
  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h3 className="modal-title">{title}</h3>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          <button className="copy-btn ghost" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="generate-btn" style={{ padding: '0.4rem 1.2rem', fontSize: '0.85rem' }} onClick={onConfirm} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
