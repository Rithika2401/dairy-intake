import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Bell, CheckCheck, Trash2, ArrowRight, AlertTriangle, FileText, CheckCircle2, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotificationDropdown = () => {
  const { notifications, markNotifRead, markAllNotifsRead, clearNotif } = useData();
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type) => {
    switch (type) {
      case 'urgent':
      case 'alert':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'system':
        return <Shield className="w-4 h-4 text-purple-400" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 glass-panel rounded-xl shadow-2xl border border-slate-700/60 z-50 overflow-hidden">
            <div className="p-3.5 bg-slate-900/80 border-b border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-cyan-400" />
                <h3 className="font-semibold text-slate-100 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-cyan-500/20 text-cyan-400 text-xs px-2 py-0.5 rounded-full font-medium">
                    {unreadCount} unread
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotifsRead}
                  className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">
                  No notifications found.
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3.5 hover:bg-slate-800/50 transition-colors flex gap-3 ${
                      !n.read ? 'bg-slate-800/30' : ''
                    }`}
                  >
                    <div className="mt-0.5 p-1.5 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-xs font-semibold ${!n.read ? 'text-slate-100' : 'text-slate-400'}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-slate-500">{n.timestamp.substring(11, 16)}</span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed truncate">{n.message}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <Link
                          to={n.link}
                          onClick={() => {
                            markNotifRead(n.id);
                            setIsOpen(false);
                          }}
                          className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          View Details <ArrowRight className="w-3 h-3" />
                        </Link>
                        <button
                          onClick={() => clearNotif(n.id)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                          title="Clear notification"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-2.5 bg-slate-900/90 border-t border-slate-800 text-center">
              <Link
                to="/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1"
              >
                Open Notification Center & Timeline <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
