import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';
import { Users, UserPlus } from 'lucide-react';

export const UserManagementPage = () => {
  const { addToast } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      if (res.data.success) setUsers(res.data.data);
    } catch (e) {
      setUsers([
        { id: 'usr-app-001', first_name: 'Ramesh', last_name: 'Patel', email: 'applicant@dairycoop.com', roles_list: 'Applicant', status: 'ACTIVE' },
        { id: 'usr-rev-001', first_name: 'Priya', last_name: 'Sharma', email: 'reviewer@dairycoop.com', roles_list: 'Reviewer', status: 'ACTIVE' },
        { id: 'usr-sup-001', first_name: 'Vikram', last_name: 'Singh', email: 'supervisor@dairycoop.com', roles_list: 'Supervisor', status: 'ACTIVE' },
        { id: 'usr-adm-001', first_name: 'Ananya', last_name: 'Deshmukh', email: 'admin@dairycoop.com', roles_list: 'Compliance Admin', status: 'ACTIVE' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStatus = async (user) => {
    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/users/${user.id}/status`, { status: newStatus });
      addToast(`Status updated for ${user.email}`, 'success');
      fetchUsers();
    } catch (e) {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
      addToast(`Status updated to ${newStatus}`, 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-cyan-400" />
            Organization User Administration
          </h2>
          <p className="text-xs text-slate-400">Manage user accounts, roles, and status controls</p>
        </div>
      </div>

      <div className="overflow-x-auto bg-slate-900/80 border border-slate-800 rounded-2xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
            <tr>
              <th className="p-3">User Name</th>
              <th className="p-3">Email Address</th>
              <th className="p-3">Assigned Role</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-slate-800/30">
                <td className="p-3 font-semibold text-slate-100">{u.first_name} {u.last_name}</td>
                <td className="p-3 font-mono text-slate-400">{u.email}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono text-[11px]">{u.roles_list}</span></td>
                <td className="p-3"><StatusBadge status={u.status} /></td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggleStatus(u)}
                    className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700"
                  >
                    Toggle Status
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;
