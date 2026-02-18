import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, Routes, Route, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Activity,
  Settings,
  Layers,
  ChevronRight,
  Cpu,
  Database,
  Radio,
  Sparkles,
  Sun,
  Moon,
  Gauge,
  Menu,
  X,
} from 'lucide-react';
import NewRequest from './pages/NewRequest';
import Logo from './components/Logo';
import { OrchestrationProvider } from './context/OrchestrationContext';
import './App.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: Layers, label: 'Pipelines', to: '/pipelines' },
  { icon: Activity, label: 'Activity', to: '/activity' },
  { icon: Sparkles, label: 'Generate Content', to: '/generate' },
  { icon: Settings, label: 'Settings', to: '/settings' },
];

const STACK = [
  { icon: Cpu, label: 'LLM', value: 'OpenRouter', sub: 'amazon/nova-micro-v1' },
  { icon: Database, label: 'Embeddings', value: 'all-MiniLM-L6-v2', sub: 'FAISS vector retrieval' },
  { icon: Radio, label: 'Channels', value: 'LinkedIn · Email · SMS · Call', sub: 'Weighted decision engine' },
];

const THEME_KEY = 'outboundly-theme';

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return { theme, toggle };
}

function Header({ onToggleSidebar, theme, onToggleTheme }) {
  const location = useLocation();
  const parts = location.pathname.split('/').filter(Boolean);
  const current = parts[0] ? parts[0] : 'dashboard';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn mobile-toggle" onClick={onToggleSidebar} aria-label="Toggle navigation">
          <Menu className="w-5 h-5" />
        </button>
        <div className="topbar-breadcrumb">
          <span className="crumb">Workspace</span>
          <ChevronRight className="w-4 h-4" />
          <span className="crumb-active">Outboundly / {current}</span>
        </div>
      </div>
      <div className="topbar-right">
        <div className="status-badge">
          <span className="dot" />
          Model: nova-micro-v1
        </div>
        <button className="icon-btn" onClick={onToggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}

function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
      <div className="sidebar-header">
        <Logo size={34} />
        <button className="icon-btn sidebar-close" onClick={onClose} aria-label="Close navigation">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="sidebar-section-label">Navigation</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
            onClick={onClose}
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-section-label stack-label-row">Stack</div>
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
        <span className="dot" />
        <span className="foot-text">Pipeline Ready</span>
      </div>
    </aside>
  );
}

function CardShell({ title, children }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

function DashboardPage() {
  return (
    <div className="grid-3">
      <CardShell title="Pipeline Health">
        <div className="metrics">
          <div>
            <p className="metric-label">Avg latency</p>
            <p className="metric-value">2.8s</p>
          </div>
          <div>
            <p className="metric-label">Success rate</p>
            <p className="metric-value">99.2%</p>
          </div>
          <div>
            <p className="metric-label">Throughput</p>
            <p className="metric-value">148/hr</p>
          </div>
        </div>
      </CardShell>
      <CardShell title="Active Models">
        <div className="badge-list">
          <div className="pill">LLM: nova-micro-v1</div>
          <div className="pill">Embeddings: all-MiniLM-L6-v2</div>
          <div className="pill">Channels: LinkedIn · Email · SMS</div>
        </div>
      </CardShell>
      <CardShell title="Recent Activity">
        <ul className="activity-list">
          <li><span className="dot" /> Generated outreach for fintech ICP</li>
          <li><span className="dot" /> Pipeline routed to LinkedIn + Email</li>
          <li><span className="dot" /> CTA performance tracking updated</li>
        </ul>
      </CardShell>
    </div>
  );
}

function PipelinesPage() {
  return (
    <CardShell title="Pipelines">
      <p className="muted">Design stages and routing rules for intents, ICPs, and channels.</p>
      <div className="pipeline-grid">
        <div className="pipeline-tile">
          <Gauge className="w-5 h-5" />
          <div>
            <p className="tile-title">Sales Outreach</p>
            <p className="tile-sub">Intent → ICP match → Channel pick → Copy</p>
          </div>
        </div>
        <div className="pipeline-tile">
          <Gauge className="w-5 h-5" />
          <div>
            <p className="tile-title">Product Announcements</p>
            <p className="tile-sub">Segments users, adjusts tone, picks CTA</p>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

function ActivityPage() {
  return (
    <CardShell title="Activity">
      <p className="muted">Stream of recent generations and decisions.</p>
      <ul className="activity-feed">
        <li>
          <span className="dot" />
          <div>
            <p className="tile-title">Outboundly generated a LinkedIn sequence</p>
            <p className="tile-sub">Intent: follow-up · Latency: 3.1s</p>
          </div>
        </li>
        <li>
          <span className="dot" />
          <div>
            <p className="tile-title">Channel decision: Email + SMS</p>
            <p className="tile-sub">Reason: urgency high, CTA booking</p>
          </div>
        </li>
      </ul>
    </CardShell>
  );
}

function SettingsPage() {
  return (
    <CardShell title="Settings">
      <p className="muted">Manage API keys, routing preferences, and workspace members.</p>
      <div className="badge-list">
        <div className="pill">OpenRouter key</div>
        <div className="pill">HF embeddings key</div>
        <div className="pill">Webhook destinations</div>
      </div>
    </CardShell>
  );
}

function AppShell() {
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  const hero = useMemo(() => ({
    title: 'Outboundly Workspace',
    subtitle: 'Agentic outreach copilot that classifies intent, matches ICPs, selects channels, and ships copy.',
    tags: ['LLM Orchestration', 'Vector Retrieval', 'Channel Decisioning', 'Personalized CTAs'],
  }), []);

  return (
    <div className={`saas-shell theme-${theme}`}>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />

      <div className="main-area">
        <Header onToggleSidebar={() => setSidebarOpen((o) => !o)} theme={theme} onToggleTheme={toggle} />

        <main className="main-content">
          <section className="hero-section">
            <div className="hero-label">
              <span className="dot" />
              Multi-Agent Pipeline
            </div>
            <h1 className="hero-title">{hero.title}</h1>
            <p className="hero-sub">{hero.subtitle}</p>
            <div className="hero-pills">
              {hero.tags.map((t) => (
                <span key={t} className="pill">{t}</span>
              ))}
            </div>
          </section>

          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pipelines" element={<PipelinesPage />} />
            <Route path="/activity" element={<ActivityPage />} />
            <Route path="/generate" element={<NewRequest />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <OrchestrationProvider>
      <AppShell />
    </OrchestrationProvider>
  );
}
