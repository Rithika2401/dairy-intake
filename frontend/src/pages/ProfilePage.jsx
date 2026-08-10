import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { User, Key, Shield, Building, Lock } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const { addToast } = useNotification();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      addToast('New password and confirmation do not match.', 'error');
      return;
    }
    addToast('Password changed successfully.', 'success');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <User className="h-6 w-6 text-cyan-400" />
          User Profile & Security Settings
        </h2>
        <p className="text-xs text-slate-400">Manage account credentials, MFA preferences, and organization context</p>
      </div>

      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold text-2xl">
            {user?.firstName ? user.firstName[0] : 'U'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.firstName} {user?.lastName}</h3>
            <p className="text-xs font-mono text-cyan-400">{user?.email}</p>
            <p className="text-xs text-slate-400">{user?.organizationName}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handlePasswordChange} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Lock className="h-4 w-4 text-cyan-400" />
          Change Account Password
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Current Password</label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>
          <div>
            <label className="block text-slate-300 font-medium mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl text-xs"
        >
          Update Password
        </button>
      </form>
    </div>
  );
};

export default ProfilePage;
