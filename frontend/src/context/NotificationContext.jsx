import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (e) {
      // Offline mock notification fallback
      setNotifications([
        {
          id: 'not-001',
          title: 'New Case Assignment',
          message: 'Case CAS-2026-001 (Morning Milk Intake) assigned to you.',
          type: 'ASSIGNMENT',
          status: 'UNREAD',
          related_case_id: 'case-001',
          created_at: new Date().toISOString()
        },
        {
          id: 'not-002',
          title: 'Critical Exception Flagged',
          message: 'Case CAS-2026-002 flagged for quantity mismatch (300 L).',
          type: 'EXCEPTION',
          status: 'UNREAD',
          related_case_id: 'case-002',
          created_at: new Date().toISOString()
        }
      ]);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (e) {}
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, status: 'READ' } : n));
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read-all');
    } catch (e) {}
    setNotifications(prev => prev.map(n => ({ ...n, status: 'READ' })));
  };

  const unreadCount = notifications.filter(n => n.status === 'UNREAD').length;

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, addToast, toasts, removeToast }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-lg shadow-xl border flex items-center justify-between transition-all duration-300 transform translate-y-0 ${
              toast.type === 'success' ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500/40' :
              toast.type === 'error' ? 'bg-rose-900/90 text-rose-100 border-rose-500/40' :
              toast.type === 'warning' ? 'bg-amber-900/90 text-amber-100 border-amber-500/40' :
              'bg-slate-900/90 text-slate-100 border-slate-700'
            }`}
          >
            <span className="text-sm font-medium pr-4">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
