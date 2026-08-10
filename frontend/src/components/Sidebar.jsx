import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import {
  UploadCloud,
  FileCheck2,
  AlertTriangle,
  LayoutDashboard,
  BrainCircuit,
  CheckCheck,
  FileText,
  BarChart3,
  Bell,
  Users,
  Settings,
  ShieldAlert,
  LogIn
} from 'lucide-react';

export const Sidebar = () => {
  const { currentUser } = useAuth();
  const { exceptions, notifications } = useData();

  const activeExceptionsCount = exceptions.filter(e => e.status !== 'Resolved').length;
  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { label: 'Login & Auth', path: '/login', icon: LogIn, badge: null, roles: ['Applicant', 'Reviewer', 'Supervisor', 'Compliance Admin'] },
    { label: 'Document Intake Portal', path: '/intake', icon: UploadCloud, badge: null, roles: ['Applicant', 'Reviewer', 'Supervisor', 'Compliance Admin'] },
    { label: 'Case Review Workspace', path: '/case/CASE-2026-8801', icon: FileCheck2, badge: null, roles: ['Applicant', 'Reviewer', 'Supervisor', 'Compliance Admin'] },
    { label: 'Exception Review Queue', path: '/exceptions', icon: AlertTriangle, badge: activeExceptionsCount > 0 ? activeExceptionsCount : null, badgeColor: 'bg-rose-500', roles: ['Reviewer', 'Supervisor', 'Compliance Admin'] },
    { label: 'Supervisor & Search', path: '/supervisor', icon: LayoutDashboard, badge: null, roles: ['Supervisor', 'Compliance Admin'] },
    { label: 'AI Document Extraction', path: '/ai-extraction', icon: BrainCircuit, badge: 'Gemini', badgeColor: 'bg-cyan-500/30 text-cyan-300 border-cyan-500/50', roles: ['Applicant', 'Reviewer', 'Supervisor', 'Compliance Admin'] },
    { label: 'Validation & Rule Checks', path: '/validation', icon: CheckCheck, badge: null, roles: ['Reviewer', 'Supervisor', 'Compliance Admin'] },
    { label: 'Grounded Summaries', path: '/summaries', icon: FileText, badge: null, roles: ['Reviewer', 'Supervisor', 'Compliance Admin'] },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, badge: null, roles: ['Supervisor', 'Compliance Admin'] },
    { label: 'Notifications Center', path: '/notifications', icon: Bell, badge: unreadNotifsCount > 0 ? unreadNotifsCount : null, badgeColor: 'bg-cyan-500', roles: ['Applicant', 'Reviewer', 'Supervisor', 'Compliance Admin'] },
    { label: 'User & Role Management', path: '/users', icon: Users, badge: null, roles: ['Compliance Admin'] },
    { label: 'Audit Logs & Settings', path: '/audit-settings', icon: Settings, badge: null, roles: ['Compliance Admin'] },
  ];

  const userRole = currentUser?.role || 'Applicant';

  return (
    <aside className="w-64 bg-slate-900/95 border-r border-slate-800 flex flex-col justify-between shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Intake & Decision Hub
        </div>

        {navItems.map((item) => {
          const isAllowed = item.roles.includes(userRole);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-300 border border-cyan-500/30 font-semibold shadow-sm'
                    : isAllowed
                    ? 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                    : 'text-slate-600 opacity-60 cursor-not-allowed hover:bg-transparent'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-cyan-400/80 shrink-0" />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${
                    item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Role Permission Footer */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
          <ShieldAlert className="w-3.5 h-3.5" /> Scope: {userRole}
        </div>
        <p className="text-[11px] text-slate-400 leading-tight">
          Signed in to <span className="text-slate-200">{currentUser?.centre || 'Anand Hub'}</span>. All actions logged in audit trail.
        </p>
      </div>
    </aside>
  );
};
