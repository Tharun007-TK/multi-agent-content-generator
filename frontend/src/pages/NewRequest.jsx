import React, { useMemo, useState } from 'react';
import { contentApi } from '../services/api';
import { useOrchestration } from '../context/OrchestrationContext';
import ExportMenu from '../components/ExportMenu';
import {
  Send,
  Loader2,
  CheckCircle2,
  Zap,
  Shield,
  Copy,
  Linkedin,
  Mail,
  Phone,
  MessageSquare,
  Radio,
} from 'lucide-react';

const SAMPLES = [
  {
    label: 'Outbound Sales',
    text: 'Reach out to early-stage AI startup founders in London about our new developer analytics copilot. Goal is to book a 15-minute intro call next week. Tone should be direct and confident.',
  },
  {
    label: 'Product Launch',
    text: 'Announce the launch of our AI-powered content generation tool to our existing B2B SaaS customer base. Highlight the time-saving benefits and invite them to a live demo webinar.',
  },
  {
    label: 'Follow-up Nudge',
    text: 'Follow up with a prospect in fintech who attended our last webinar but has not booked a demo yet. Keep it warm, reference their industry pain points around compliance automation.',
  },
  {
    label: 'Support Outreach',
    text: 'Check in with a customer who submitted a support ticket 3 days ago about an integration issue. The issue is now resolved. Re-engage them and offer a success call.',
  },
];

export default function NewRequest({ onToast }) {
  const {
    intent,
    audience,
    urgency,
    channel,
    context: contextValue,
    result,
    setField,
    setResult,
  } = useOrchestration();
  const [loading, setLoading] = useState(false);

  const payload = useMemo(
    () => `Intent: ${intent}\nTarget Audience: ${audience}\nUrgency: ${urgency}\nPreferred Channel: ${channel}\nContext: ${contextValue}`,
    [intent, audience, urgency, channel, contextValue]
  );

  const hasInput = intent.trim() || audience.trim() || contextValue.trim();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await contentApi.generate(payload);
      setResult(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const STEPS = useMemo(
    () => [
      { num: 1, label: 'Classify Intent', done: loading || !!result },
      { num: 2, label: 'ICP Match', done: !!result },
      { num: 3, label: 'Channel Decision', done: !!result },
      { num: 4, label: 'Generate Copy', done: !!result },
    ],
    [loading, result]
  );

  const CHANNEL_ICONS = {
    LinkedIn: Linkedin,
    Email: Mail,
    Call: Phone,
    SMS: MessageSquare,
  };

  const copySection = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="orchestration-grid">
      <div className="input-panel">
        <div className="stepper-card">
          <div className="stepper">
            {STEPS.map((step, i) => (
              <React.Fragment key={step.num}>
                <div className={`step ${step.done ? 'step-done' : ''} ${!step.done && i === 0 ? 'step-active' : ''}`}>
                  <div className="step-circle">
                    {step.done ? <CheckCircle2 className="w-4 h-4" /> : <span>{step.num}</span>}
                  </div>
                  <span className="step-label">{step.label}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`step-connector ${step.done ? 'step-connector-done' : ''}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="form-card">
          <div className="form-card-header">
            <h2 className="form-card-title">Content Orchestration</h2>
            <p className="form-card-sub">Describe the campaign. The agents classify intent, map ICP, pick channels, and generate copy.</p>
          </div>
          <form onSubmit={handleSubmit} className="form-body">
            <div className="grid-2">
              <div className="field">
                <label className="field-label">Intent</label>
                <input
                  className="field-input"
                  placeholder="Book intro calls for analytics copilot"
                  value={intent}
                  onChange={(e) => setField('intent', e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">Target Audience</label>
                <input
                  className="field-input"
                  placeholder="AI startup founders in London"
                  value={audience}
                  onChange={(e) => setField('audience', e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">Urgency</label>
                <select className="field-input" value={urgency} onChange={(e) => setField('urgency', e.target.value)}>
                  <option>Low</option>
                  <option>Normal</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
              <div className="field">
                <label className="field-label">Preferred Channel</label>
                <select className="field-input" value={channel} onChange={(e) => setField('channel', e.target.value)}>
                  <option>Auto</option>
                  <option>LinkedIn</option>
                  <option>Email</option>
                  <option>SMS</option>
                  <option>Call</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label className="field-label">Additional Context</label>
              <div className="samples-bar">
                {SAMPLES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className={`sample-chip ${contextValue === s.text ? 'sample-chip-active' : ''}`}
                    onClick={() => setField('context', s.text)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <textarea
                className="field-textarea"
                placeholder="Add nuance, tone, or references the agents should use."
                value={contextValue}
                onChange={(e) => setField('context', e.target.value)}
              />
              <p className="field-hint">Include persona, offer, timing, and any objections or constraints.</p>
            </div>

            <div className="form-meta">
              <div className="meta-badge">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                Keys stay client-side
              </div>
              <div className="meta-badge">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                ~2–6s latency
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !hasInput}
              className="generate-btn"
            >
              {loading
                ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating…</>
                : <><Send className="w-5 h-5" /> Generate Content</>
              }
            </button>
          </form>
        </div>
      </div>

      <div className="output-panel">
        <div className="output-card">
          <div className="output-header">
            <div className="output-header-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Output Preview</span>
            </div>
            {result && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button className="copy-btn" onClick={() => copySection(`${result.headline}\n\n${result.body}\n\n${result.cta}`)}>
                  <Copy className="w-4 h-4" />
                  Copy All
                </button>
                <ExportMenu result={result} onToast={onToast || (() => {})} />
              </div>
            )}
          </div>

          {!result && (
            <div className="output-empty">
              <div className="output-empty-icon">✦</div>
              <p className="output-empty-title">Waiting for input</p>
              <p className="output-empty-sub">Fill in your context and click Generate. Output will appear here as a structured result.</p>
            </div>
          )}

          {result && (
            <div className="output-result">
              {result.platform && (() => {
                const ChanIcon = CHANNEL_ICONS[result.platform] || Radio;
                return (
                  <div className="channel-badge">
                    <ChanIcon className="w-4 h-4" />
                    {result.platform}
                  </div>
                );
              })()}
              <div className="result-section">
                <div className="result-header">
                  <span className="result-label">Headline</span>
                  <button className="copy-btn ghost" onClick={() => copySection(result.headline)}>
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <p className="result-headline">{result.headline}</p>
              </div>
              <div className="result-divider" />
              <div className="result-section">
                <div className="result-header">
                  <span className="result-label">Body</span>
                  <button className="copy-btn ghost" onClick={() => copySection(result.body)}>
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <p className="result-body-text">{result.body}</p>
              </div>
              <div className="result-divider" />
              <div className="result-section">
                <div className="result-header">
                  <span className="result-label">Call to Action</span>
                  <button className="copy-btn ghost" onClick={() => copySection(result.cta)}>
                    <Copy className="w-3 h-3" />
                    Copy
                  </button>
                </div>
                <p className="result-cta">{result.cta}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
