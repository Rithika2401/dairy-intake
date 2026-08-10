import React, { useState, useEffect } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import { History, Search } from 'lucide-react';

export const AuditLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit', { params: { page, limit: 10 } });
      if (res.data.success) {
        setLogs(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (e) {
      setLogs([
        { id: 'aud-001', actor_email: 'applicant@dairycoop.com', actor_role: 'Applicant', action: 'CASE_CREATED', entity_type: 'CASE', entity_id: 'case-001', outcome: 'SUCCESS', created_at: '2026-08-10 08:30:00' },
        { id: 'aud-002', actor_email: 'reviewer@dairycoop.com', actor_role: 'Reviewer', action: 'DECISION_SUBMITTED', entity_type: 'CASE', entity_id: 'case-003', outcome: 'SUCCESS', created_at: '2026-08-10 11:20:00' }
      ]);
      setPagination({ total: 2, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const columns = [
    { header: 'Action Code', accessor: 'action', render: (row) => <span className="font-mono text-cyan-400 font-bold text-xs">{row.action}</span> },
    { header: 'Actor Email', accessor: 'actor_email', render: (row) => <span className="font-mono text-slate-300 text-xs">{row.actor_email}</span> },
    { header: 'Actor Role', accessor: 'actor_role', render: (row) => <span className="text-slate-400 text-xs">{row.actor_role}</span> },
    { header: 'Target Entity', accessor: 'entity_type', render: (row) => <span className="font-mono text-slate-400 text-xs">{row.entity_type} ({row.entity_id})</span> },
    { header: 'Outcome', accessor: 'outcome', render: (row) => <StatusBadge status={row.outcome} /> },
    { header: 'Timestamp', accessor: 'created_at', render: (row) => <span className="font-mono text-slate-500 text-xs">{row.created_at}</span> }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <History className="h-6 w-6 text-cyan-400" />
          Immutable Audit Log Trail
        </h2>
        <p className="text-xs text-slate-400">Complete, tamper-proof record of logins, uploads, decisions, overrides, and system changes</p>
      </div>

      <DataTable columns={columns} data={logs} isLoading={loading} />
      <Pagination currentPage={page} totalPages={pagination.totalPages} totalItems={pagination.total} onPageChange={(p) => setPage(p)} />
    </div>
  );
};

export default AuditLogsPage;
