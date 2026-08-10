import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import { Bell, CheckCircle2, ArrowRight } from 'lucide-react';

export const NotificationsPage = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotification();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 text-cyan-400" />
            In-App Notifications Center
          </h2>
          <p className="text-xs text-slate-400">System alerts, case assignments, and exception triggers</p>
        </div>

        <button
          onClick={markAllAsRead}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
        >
          <CheckCircle2 className="h-4 w-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map(n => (
          <div
            key={n.id}
            onClick={() => markAsRead(n.id)}
            className={`p-4 rounded-2xl border transition flex items-center justify-between gap-4 cursor-pointer ${
              n.status === 'UNREAD' ? 'bg-slate-900 border-cyan-500/40 ring-1 ring-cyan-500/20' : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                {n.status === 'UNREAD' && <span className="h-2 w-2 rounded-full bg-cyan-400"></span>}
                <h4 className="text-sm font-bold text-slate-100">{n.title}</h4>
              </div>
              <p className="text-xs text-slate-300">{n.message}</p>
              <span className="text-[10px] font-mono text-slate-500">{n.created_at}</span>
            </div>

            {n.related_case_id && (
              <button
                onClick={(e) => { e.stopPropagation(); navigate(`/cases/${n.related_case_id}`); }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs flex items-center space-x-1 shrink-0"
              >
                <span>View Case</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
