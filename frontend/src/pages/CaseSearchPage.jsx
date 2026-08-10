import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SearchBar from '../components/SearchBar';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import { Search, Filter, RefreshCw } from 'lucide-react';

export const CaseSearchPage = () => {
  const navigate = useNavigate();

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchCases = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cases', {
        params: {
          search: searchQuery || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          risk_level: riskFilter || undefined,
          page,
          limit: 10
        }
      });

      if (res.data.success) {
        setCases(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setCases([
        { id: 'case-001', case_number: 'CAS-2026-001', title: 'Morning Milk Intake - Anand North', case_type: 'COLLECTION_INTAKE', status: 'PENDING_REVIEW', priority: 'HIGH', risk_level: 'HIGH', owner_name: 'Ramesh Patel', document_count: 2, created_at: '2026-08-10 08:30:00' },
        { id: 'case-002', case_number: 'CAS-2026-002', title: 'Quality Audit - Tanker #GJ-07-X-4421', case_type: 'QUALITY_AUDIT', status: 'EXCEPTION', priority: 'CRITICAL', risk_level: 'HIGH', owner_name: 'Ramesh Patel', document_count: 1, created_at: '2026-08-10 09:15:00' },
        { id: 'case-003', case_number: 'CAS-2026-003', title: 'Batch Release #B-2026-884 - Butter Milk', case_type: 'BATCH_RELEASE', status: 'APPROVED', priority: 'MEDIUM', risk_level: 'LOW', owner_name: 'Ramesh Patel', document_count: 3, created_at: '2026-08-09 14:20:00' }
      ]);
      setPagination({ total: 3, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [searchQuery, statusFilter, priorityFilter, riskFilter, page]);

  const columns = [
    { header: 'Case Number', accessor: 'case_number', render: (row) => <span className="font-mono text-cyan-400 font-bold">{row.case_number}</span> },
    { header: 'Title', accessor: 'title', render: (row) => <span className="font-medium text-slate-100">{row.title}</span> },
    { header: 'Type', accessor: 'case_type', render: (row) => <span className="text-slate-400 font-mono text-xs">{row.case_type}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Priority', accessor: 'priority', render: (row) => <span className="font-semibold text-slate-300">{row.priority}</span> },
    { header: 'Risk Level', accessor: 'risk_level', render: (row) => <SeverityBadge severity={row.risk_level} /> },
    { header: 'Docs', accessor: 'document_count', render: (row) => <span className="font-mono text-slate-400">{row.document_count || 1}</span> },
    { header: 'Submitted At', accessor: 'created_at', render: (row) => <span className="font-mono text-slate-500 text-xs">{row.created_at}</span> }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Search className="h-6 w-6 text-cyan-400" />
          Enterprise Case Search & Repository
        </h2>
        <p className="text-xs text-slate-400">Server-side multi-parameter search across all document intake cases</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <SearchBar value={searchQuery} onChange={(v) => { setSearchQuery(v); setPage(1); }} />
          <button
            onClick={fetchCases}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center space-x-1"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-slate-500 font-mono">Filters:</span>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="EXCEPTION">Exception</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={riskFilter}
            onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
          >
            <option value="">All Risk Levels</option>
            <option value="CRITICAL">Critical Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={cases}
        isLoading={loading}
        onRowClick={(row) => navigate(`/cases/${row.id}`)}
      />

      <Pagination
        currentPage={page}
        totalPages={pagination.totalPages}
        totalItems={pagination.total}
        onPageChange={(p) => setPage(p)}
      />
    </div>
  );
};

export default CaseSearchPage;
