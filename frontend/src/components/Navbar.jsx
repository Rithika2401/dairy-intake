import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { NotificationDropdown } from './NotificationDropdown';
import { Milk, Search, ShieldCheck, UserCheck, ChevronDown, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { currentUser, switchRole, usersList } = useAuth();
  const { globalSearch, setGlobalSearch } = useData();
  const navigate = useNavigate();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      navigate(`/supervisor?search=${encodeURIComponent(globalSearch)}`);
    }
  };

  return (
    <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
      {/* Brand Header */}
      <div className="flex items-center gap-3">
        <Link to="/intake" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Milk className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-cyan-400 bg-clip-text text-transparent tracking-tight">
                DairyIntake
              </span>
              <span className="bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> AI Hub
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Dairy Cooperative Decision & Extraction Hub</p>
          </div>
        </Link>
      </div>

      {/* Global Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Global search across collection slips, lab reports, farmers, invoices..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/60 transition-all"
          />
        </div>
      </form>

      {/* Right Controls: Role Persona Switcher + Notifications + Profile */}
      <div className="flex items-center gap-3">
        {/* Role Persona Quick Switcher */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg text-xs transition-colors">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-medium hidden sm:inline">Persona:</span>
            <span className="font-semibold text-cyan-300">{currentUser?.role || 'Select Role'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          
          <div className="absolute right-0 mt-1 w-52 glass-panel rounded-xl shadow-xl border border-slate-700/60 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 p-1 divide-y divide-slate-800">
            <div className="px-3 py-2">
              <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Switch Test Role Persona</p>
            </div>
            <div className="py-1">
              {['Applicant', 'Reviewer', 'Supervisor', 'Compliance Admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => switchRole(role)}
                  className={`w-full text-left px-3 py-1.5 text-xs rounded-lg transition-colors flex items-center justify-between ${
                    currentUser?.role === role
                      ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{role}</span>
                  {currentUser?.role === role && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notification Bell */}
        <NotificationDropdown />

        {/* User Profile */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-3">
          <img
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150"}
            alt={currentUser?.name}
            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-slate-200">{currentUser?.name}</p>
            <p className="text-[10px] text-slate-400">{currentUser?.department}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
