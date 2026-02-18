import React, { useState } from 'react';
import NewRequest from './pages/NewRequest';
import './App.css';
import {
  LayoutDashboard,
  Activity,
  Settings,
  Layers,
  ChevronRight,
  Cpu,
  Database,
  Radio,
} from 'lucide-react';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Layers, label: 'Pipelines', active: false },
  { icon: Activity, label: 'Activity', active: false },
  { icon: Settings, label: 'Settings', active: false },
];

const STACK = [
  { icon: Cpu, label: 'LLM', value: 'OpenRouter', sub: 'amazon/nova-micro-v1' },
  { icon: Database, label: 'Embeddings', value: 'all-MiniLM-L6-v2', sub: 'FAISS vector retrieval' },
  { icon: Radio, label: 'Channels', value: 'LinkedIn · Email · SMS · Call', sub: 'Weighted decision engine' },
];

function App() {
  const [navActive, setNavActive] = useState('Dashboard');

  return (
    <div className="saas-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">AC</div>
          <div>
            <div className="brand-name">AgenticContent</div>
            <div className="brand-sub">Multi-agent copilot</div>
          </div>
        </div>

        <div className="sidebar-section-label">Navigation</div>
        <nav className="sidebar-nav">
          {NAV.map(({ icon: Icon, label }) => (
            <button
              key={label}
              onClick={() => setNavActive(label)}
              className={`nav-item ${navActive === label ? 'nav-item-active' : ''}`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-section-label" style={{ marginTop: 'auto', paddingTop: '24px' }}>Stack</div>
        <div className="sidebar-stack">
          {STACK.map(({ icon: Icon, label, value, sub }) => (
            <div key={label} className="stack-item">
              <Icon className="w-4 h-4 text-slate-400" />
              <div>
                <div className="stack-label">{label}</div>
                <div className="stack-value">{value}</div>
                <div className="stack-sub">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-slate-400">Pipeline Ready</span>
        </div>
      </aside>

      {/* Main */}
      <div className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-breadcrumb">
            <span className="text-slate-500">Dashboard</span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-slate-200 font-medium">Generate</span>
          </div>
          <div className="topbar-right">
            <div className="status-badge">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live
            </div>
          </div>
        </header>

        <main className="main-content">
          {/* Hero */}
          <section className="hero-section">
            <div className="hero-label">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              Multi-Agent Pipeline
            </div>
            <h1 className="hero-title">Generate Outreach Content</h1>
            <p className="hero-sub">Classify intent, match the best ICP, select the channel, and ship copy — in one agentic flow.</p>
            <div className="hero-pills">
              <span className="pill">LLM: OpenRouter</span>
              <span className="pill">FAISS Embeddings</span>
              <span className="pill">ICP Matching</span>
              <span className="pill">Auto Channel Selection</span>
            </div>
          </section>

          {/* Orchestration */}
          <NewRequest />
        </main>
      </div>
    </div>
  );
}

export default App;
