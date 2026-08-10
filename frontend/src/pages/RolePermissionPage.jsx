import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Key } from 'lucide-react';

export const RolePermissionPage = () => {
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await api.get('/roles');
        if (res.data.success) setRoles(res.data.data);
      } catch (e) {
        setRoles([
          { id: 'role-applicant', name: 'Applicant', code: 'APPLICANT', permissions: ['cases.read', 'cases.create', 'documents.upload', 'documents.read'] },
          { id: 'role-reviewer', name: 'Reviewer', code: 'REVIEWER', permissions: ['cases.read', 'cases.update', 'cases.approve', 'cases.reject', 'documents.upload', 'documents.read', 'ai.run', 'ai.review'] },
          { id: 'role-supervisor', name: 'Supervisor', code: 'SUPERVISOR', permissions: ['cases.read', 'cases.update', 'cases.assign', 'cases.approve', 'cases.reject', 'cases.override', 'documents.upload', 'documents.read', 'ai.run', 'ai.review', 'reports.export'] },
          { id: 'role-admin', name: 'Compliance Admin', code: 'COMPLIANCE_ADMIN', permissions: ['cases.read', 'cases.create', 'cases.update', 'cases.assign', 'cases.approve', 'cases.reject', 'cases.override', 'documents.upload', 'documents.read', 'documents.delete', 'ai.run', 'ai.review', 'reports.export', 'users.manage', 'roles.manage', 'settings.manage', 'audit.read'] }
        ]);
      }
    };
    fetchRoles();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-cyan-400" />
          Role-Based Access Control (RBAC) Matrix
        </h2>
        <p className="text-xs text-slate-400">Inspect system roles and mapped granular permission codes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map(role => (
          <div key={role.id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{role.name}</h3>
              <span className="font-mono text-[10px] text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">{role.code}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Granted Permissions ({role.permissions.length}):</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {role.permissions.map((p, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-slate-950 border border-slate-800 rounded text-[10px] font-mono text-slate-300">
                    {p}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RolePermissionPage;
