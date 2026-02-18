import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import DashboardStats from './components/DashboardStats';
import PipelineHistory from './components/PipelineHistory';
import ActivityTable from './components/ActivityTable';
import SettingsForm from './components/SettingsForm';
import Toast from './components/Toast';
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

function DashboardPage() {
  return <DashboardStats />;
}

function PipelinesPage() {
  return <PipelineHistory />;
}

function ActivityPage() {
  return <ActivityTable />;
}

function SettingsPage({ onToast }) {
  return <SettingsForm onToast={onToast} />;
}

function AppShell() {
  const { theme, toggle } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const closeSidebar = () => setSidebarOpen(false);

  const addToast = useCallback((type, message) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

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
            <Route path="/generate" element={<NewRequest onToast={addToast} />} />
            <Route path="/settings" element={<SettingsPage onToast={addToast} />} />
          </Routes>
        </main>
      </div>

      <Toast toasts={toasts} remove={removeToast} />
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
