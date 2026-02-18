import React from 'react';
import NewRequest from './pages/NewRequest';

function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <header className="border-b border-slate-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold text-primary-400">AgenticContent</span>
          <nav className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-primary-400 transition-colors">Dashboard</a>
            <a href="#" className="hover:text-primary-400 transition-colors">Logs</a>
          </nav>
        </div>
      </header>
      
      <main className="py-12">
        <NewRequest />
      </main>
    </div>
  );
}

export default App;
