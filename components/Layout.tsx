
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, currentView, onNavigate }) => {
  return (
    <div className="flex h-screen bg-[#05070a] text-slate-200 selection:bg-blue-500/30">
      <div className="mesh-gradient" />
      
      {/* Sidebar Minimalista */}
      <aside className="w-20 lg:w-64 glass-panel m-4 mr-0 flex flex-col border-r-0 shadow-2xl transition-all duration-500">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/20 transform hover:rotate-12 transition-transform cursor-pointer">
            L
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 hidden lg:block">
            Nexus CRM
          </span>
        </div>
        
        <nav className="flex-1 mt-10 px-3 space-y-2">
          <NavItem 
            active={currentView === 'dashboard'} 
            onClick={() => onNavigate('dashboard')}
            label="Dashboard"
            icon={<DashboardIcon />}
          />
          <NavItem 
            active={currentView === 'contacts' || currentView === 'contact-details'} 
            onClick={() => onNavigate('contacts')}
            label="Contatos"
            icon={<UsersIcon />}
          />
        </nav>
        
        <div className="p-6 mt-auto">
          <div className="hidden lg:block p-4 glass-card bg-white/5 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Status Sistema</p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-slate-300 uppercase tracking-tighter">Online</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 font-bold mt-4 text-center lg:text-left">PRO VERSION v1.0</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="px-8 py-6 flex items-center justify-between z-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {currentView === 'dashboard' ? 'Overview' : 
               currentView === 'contacts' ? 'Database' : 'Client Profile'}
            </h2>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-widest opacity-60">
              Nexus Intelligent Storage
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-xl glass-card text-slate-400 hover:text-white border-0">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <div className="flex items-center space-x-3 glass-panel px-4 py-2 border-0 bg-white/5">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-slate-700 to-slate-800 flex items-center justify-center text-[10px] font-black text-white border border-white/10">
                 AD
               </div>
               <div className="hidden md:block">
                 <p className="text-xs font-bold text-white leading-none">Admin</p>
                 <p className="text-[9px] font-black text-blue-500 uppercase tracking-tighter">Premium User</p>
               </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; label: string; icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-0 lg:space-x-4 px-0 lg:px-5 py-3 lg:py-3.5 rounded-xl transition-all duration-300 group relative ${
      active 
        ? 'bg-blue-600/10 text-white shadow-lg shadow-blue-500/5' 
        : 'text-slate-500 hover:text-slate-200'
    }`}
  >
    <div className={`flex flex-1 items-center justify-center lg:justify-start ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}>
      <span className={`w-10 h-10 lg:w-5 lg:h-5 flex items-center justify-center transition-all duration-300 ${active ? 'text-blue-500 scale-110' : ''}`}>
        {icon}
      </span>
      <span className="font-semibold text-sm hidden lg:block ml-3">{label}</span>
    </div>
    {active && (
      <div className="absolute left-0 lg:-left-3 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
    )}
  </button>
);

const DashboardIcon = () => (
  <svg className="w-full h-full lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>
);

const UsersIcon = () => (
  <svg className="w-full h-full lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
);
