import React, { useRef, useState, useEffect } from 'react';
import { Linkedin, Mail, Phone, ChevronDown, Loader2 } from 'lucide-react';
import { exportApi } from '../services/api';

const CHANNELS = [
  { key: 'linkedin', label: 'Export to LinkedIn', Icon: Linkedin },
  { key: 'email', label: 'Send as Email', Icon: Mail },
  { key: 'call', label: 'Push to Call Queue', Icon: Phone },
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
  const [form, setForm] = useState({
    recipient: '',
    subject: '',
    lead_name: '',
    phone: '',
    priority: 5,
    linkedin_recipient: '',
    linkedin_type: 'message' // 'message' or 'post'
  });
  const menuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const Field = ({ label, name, type = 'text', min, max, placeholder }) => (
    <div className="field" style={{ marginBottom: '0.5rem' }}>
      <label className="field-label">{label}</label>
      <input
        className="field-input"
        type={type}
        min={min} max={max}
        placeholder={placeholder}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
      />
    </div>
  );

  const handleLinkedInFeedShare = () => {
    const text = [
      result.headline,
      '',
      result.body,
      '',
      result.cta,
    ].join('\n');
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    onToast('success', 'LinkedIn share dialog opened.');
  };

  const handleExport = async () => {
    setBusy(true);
    try {
      if (active === 'linkedin') {
        if (form.linkedin_type === 'post') {
          handleLinkedInFeedShare();
        } else if (form.linkedin_type === 'manual') {
          // Manual Messaging: Copy + Open
          const text = [result.headline, '', result.body, '', result.cta].join('\n');
          const success = await copySection(text);
          if (success) {
            window.open('https://www.linkedin.com/messaging/', '_blank');
            onToast('success', 'Message copied! Paste it into your LinkedIn chat.');
          }
        } else {
          // Send via Webhook (Automated)
          const r = await exportApi.toLinkedIn({
            headline: result.headline,
            body: result.body,
            cta: result.cta,
            recipient_name: form.linkedin_recipient,
            export_type: 'message',
            campaign_id: result.campaign_id
          });
          onToast('success', r.data.message);
        }
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

  const copySection = async (text) => {
    if (!text) return false;

    // Primary method: navigator.clipboard
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (err) {
        console.warn('Navigator clipboard failed, falling back...', err);
      }
    }

    // Fallback method: textarea + execCommand
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "0";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Final fallback copy failed!', err);
      if (onToast) onToast('error', 'Failed to copy to clipboard.');
      return false;
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
              onClick={() => {
                setOpen(false);
                setActive(key);
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* LinkedIn */}
      {active === 'linkedin' && (
        <ExportModal
          title="Export to LinkedIn"
          onConfirm={handleExport}
          onCancel={() => setActive(null)}
          busy={busy}
        >
          <div className="field" style={{ marginBottom: '1rem' }}>
            <label className="field-label">Export Type</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="radio"
                  name="linkedin_type"
                  checked={form.linkedin_type === 'manual'}
                  onChange={() => setForm(f => ({ ...f, linkedin_type: 'manual' }))}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>Direct Message (Manual)</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Copy text & open LinkedIn Messaging</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="radio"
                  name="linkedin_type"
                  checked={form.linkedin_type === 'post'}
                  onChange={() => setForm(f => ({ ...f, linkedin_type: 'post' }))}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>Share to Feed (Manual)</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Open LinkedIn post dialog</span>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="radio"
                  name="linkedin_type"
                  checked={form.linkedin_type === 'message'}
                  onChange={() => setForm(f => ({ ...f, linkedin_type: 'message' }))}
                />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <strong>Direct Message (Automated)</strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Send immediately via Webhook</span>
                </div>
              </label>
            </div>
          </div>

          {form.linkedin_type === 'message' && (
            <Field
              label="Recipient Name (For Webhook)"
              name="linkedin_recipient"
              placeholder="e.g. John Doe"
            />
          )}

          {form.linkedin_type === 'manual' && (
            <p style={{ fontSize: '12px', color: 'var(--accent)', background: 'rgba(34, 211, 238, 0.1)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem' }}>
              <strong>Tip:</strong> We'll copy the text to your clipboard and open LinkedIn. Just choose your contact and paste!
            </p>
          )}
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
          <Field label="Recipient email" name="recipient" type="email" placeholder="hello@example.com" />
          <Field label="Subject (optional)" name="subject" placeholder={result.headline} />
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
          <Field label="Lead name" name="lead_name" placeholder="John Doe" />
          <Field label="Phone number" name="phone" placeholder="+1..." />
          <Field label="Priority (1-10)" name="priority" type="number" min={1} max={10} />
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
