import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import {
  LayoutDashboard,
  FileUp,
  FileCheck,
  AlertOctagon,
  Search,
  Users,
  ShieldAlert,
  Bot,
  CheckCircle2,
  FileText,
  BarChart3,
  Bell,
  Sliders,
  History,
  User,
  LogOut,
  Menu,
  X,
  Milk
} from 'lucide-react';

export const MainLayout = () => {
  const { user, logout, hasPermission } = useAuth();
  const { unreadCount } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Document Intake', path: '/intake', icon: FileUp, perm: 'documents.upload' },
    { label: 'Case Workspace', path: '/cases/case-001', icon: FileCheck, perm: 'cases.read' },
    { label: 'Exception Queue', path: '/exceptions', icon: AlertOctagon, perm: 'cases.read' },
    { label: 'Case Search', path: '/search', icon: Search, perm: 'cases.read' },
    { label: 'Supervisor Dashboard', path: '/supervisor', icon: ShieldAlert, perm: 'cases.assign' },
    { label: 'AI Extraction', path: '/ai-extraction', icon: Bot, perm: 'ai.review' },
    { label: 'Validation Checks', path: '/validations', icon: CheckCircle2, perm: 'cases.read' },
    { label: 'Grounded Summary', path: '/grounded-summary', icon: FileText, perm: 'ai.review' },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart3, perm: 'reports.export' },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'User Management', path: '/users', icon: Users, perm: 'users.manage' },
    { label: 'Role & Permissions', path: '/roles', icon: ShieldAlert, perm: 'roles.manage' },
    { label: 'Audit Logs', path: '/audit', icon: History, perm: 'audit.read' },
    { label: 'System Settings', path: '/settings', icon: Sliders, perm: 'settings.manage' },
    { label: 'My Profile', path: '/profile', icon: User }
  ];

  const filteredNav = navItems.filter(item => !item.perm || hasPermission(item.perm));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Bar Navigation */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20">
              <Milk className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Dairy Intake Hub
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  v2026.1
                </span>
              </h1>
              <p className="text-xs text-slate-400">{user?.organizationName || 'Apex Dairy Cooperative'}</p>
            </div>
          </div>
        </div>

        {/* Right Action Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications Button */}
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Badge */}
          <div className="hidden sm:flex items-center space-x-3 pl-3 border-l border-slate-800">
            <div className="text-right">
              <p className="text-xs font-semibold text-slate-200">{user ? `${user.firstName} ${user.lastName}` : 'Guest Reviewer'}</p>
              <p className="text-[10px] text-cyan-400 uppercase tracking-wider font-mono">{user?.roles?.[0] || 'Reviewer'}</p>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-sm hover:border-cyan-500 transition"
            >
              {user?.firstName ? user.firstName[0] : 'U'}
            </button>
          </div>

          <button
            onClick={logout}
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
            title="Log Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900/95 border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:z-auto pt-16 md:pt-0 ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col justify-between p-4 overflow-y-auto">
            <div className="space-y-1">
              <p className="px-3 py-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
                Intake Modules
              </p>
              {filteredNav.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>

            {/* Tenant Boundary Indicator */}
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 uppercase font-mono">Tenant Boundary</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              </div>
              <p className="font-medium text-slate-300 truncate">{user?.organizationName || 'Apex Dairy'}</p>
              <p className="text-[10px] font-mono text-slate-500">ID: {user?.organizationId || 'org-001'}</p>
            </div>
          </div>
        </aside>

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
