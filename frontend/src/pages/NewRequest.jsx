import React, { useMemo, useState } from 'react';
import { contentApi } from '../services/api';
import { Send, Loader2, CheckCircle2, Zap, Shield, Copy, Linkedin, Mail, Phone, MessageSquare } from 'lucide-react';

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

export default function NewRequest() {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await contentApi.generate(context);
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

  return (
    <div className="orchestration-grid">
      {/* Left: Input Panel */}
      <div className="input-panel">
        {/* Stepper */}
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

        {/* Form */}
        <div className="form-card">
          <div className="form-card-header">
            <h2 className="form-card-title">Orchestration Panel</h2>
            <p className="form-card-sub">Describe your audience and intent. The pipeline handles the rest.</p>
          </div>
          <form onSubmit={handleSubmit} className="form-body">
            <div className="field">
              <label className="field-label">User Context / Intent</label>
              <div className="samples-bar">
                {SAMPLES.map((s) => (
                  <button
                    key={s.label}
                    type="button"
                    className={`sample-chip ${context === s.text ? 'sample-chip-active' : ''}`}
                    onClick={() => setContext(s.text)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <textarea
                className="field-textarea"
                placeholder="e.g. Reach out to AI startup founders in London about our analytics copilot and book intro calls for next week."
                value={context}
                onChange={(e) => setContext(e.target.value)}
              />
              <p className="field-hint">Pick a sample above or write your own context. Include audience, intent, urgency, and any preferred channel.</p>
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
              disabled={loading || !context.trim()}
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

      {/* Right: Output Panel */}
      <div className="output-panel">
        <div className="output-card">
          <div className="output-header">
            <div className="output-header-left">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Output Preview</span>
            </div>
            {result && (
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(`${result.headline}\n\n${result.body}\n\n${result.cta}`)}
              >
                <Copy className="w-4 h-4" />
                Copy
              </button>
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
                <span className="result-label">Headline</span>
                <p className="result-headline">{result.headline}</p>
              </div>
              <div className="result-divider" />
              <div className="result-section">
                <span className="result-label">Body</span>
                <p className="result-body-text">{result.body}</p>
              </div>
              <div className="result-divider" />
              <div className="result-section">
                <span className="result-label">Call to Action</span>
                <p className="result-cta">{result.cta}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
