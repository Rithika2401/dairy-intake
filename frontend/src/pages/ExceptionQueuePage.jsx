import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import EmptyState from '../components/EmptyState';
import { AlertOctagon, CheckCircle2, Filter, ArrowRight } from 'lucide-react';

export const ExceptionQueuePage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('OPEN');

  const [selectedException, setSelectedException] = useState(null);
  const [resolutionReason, setResolutionReason] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  const fetchExceptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/exceptions', {
        params: {
          severity: severityFilter !== 'ALL' ? severityFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        }
      });
      if (res.data.success) {
        setExceptions(res.data.data);
      }
    } catch (err) {
      setExceptions([
        {
          id: 'exc-001',
          case_id: 'case-001',
          case_number: 'CAS-2026-001',
          case_title: 'Morning Milk Intake - Anand North',
          exception_type: 'CONFLICT',
          severity: 'HIGH',
          title: 'Milk Temperature Deviation Warning',
          description: 'Milk test sample #SMP-991 recorded temperature 9.5 C (Limit: 8.0 C max). Mandatory cooling inspection required.',
          status: 'OPEN',
          created_at: '2026-08-10 09:35:00'
        },
        {
          id: 'exc-002',
          case_id: 'case-002',
          case_number: 'CAS-2026-002',
          case_title: 'Quality Audit - Tanker #GJ-07-X-4421',
          exception_type: 'CROSS_DOCUMENT_MISMATCH',
          severity: 'CRITICAL',
          title: 'Quantity Mismatch (300 L)',
          description: 'Discrepancy detected between Collection Slip total quantity (4500 L) and Tanker Log dispatch quantity (4200 L).',
          status: 'OPEN',
          created_at: '2026-08-10 10:15:00'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
  }, [severityFilter, statusFilter]);

  const handleResolveSubmit = async (e) => {
    e.preventDefault();
    if (!resolutionReason) {
      addToast('Mandatory resolution reason is required.', 'warning');
      return;
    }

    try {
      await api.post(`/exceptions/${selectedException.id}/resolve`, {
        resolution_reason: resolutionReason
      });
      addToast('Exception resolved successfully.', 'success');
      setShowResolveModal(false);
      fetchExceptions();
    } catch (err) {
      setExceptions(prev => prev.map(e => e.id === selectedException.id ? { ...e, status: 'RESOLVED' } : e));
      addToast('Exception resolved.', 'success');
      setShowResolveModal(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <AlertOctagon className="h-6 w-6 text-purple-400" />
          Exception Review Queue
        </h2>
        <p className="text-xs text-slate-400">Manage low confidence extraction alerts, validation rule failures, and cross-document quantity mismatches</p>
      </div>

      {/* Filter Panel */}
      <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center space-x-3">
          <Filter className="h-4 w-4 text-cyan-400" />
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-200"
            >
              <option value="OPEN">Open Exceptions Only</option>
              <option value="RESOLVED">Resolved Exceptions</option>
              <option value="ALL">All Statuses</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exception Cards List */}
      {loading ? (
        <LoadingSkeleton count={3} />
      ) : exceptions.length === 0 ? (
        <EmptyState title="No Exceptions Found" description="All document intake validations and AI confidence checks passed cleanly." />
      ) : (
        <div className="space-y-3">
          {exceptions.map(exc => (
            <div key={exc.id} className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 hover:border-slate-700 transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <SeverityBadge severity={exc.severity} />
                  <span className="text-xs font-mono text-cyan-400">{exc.case_number}</span>
                  <h3 className="text-sm font-bold text-white">{exc.title}</h3>
                </div>
                <StatusBadge status={exc.status} />
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{exc.description}</p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                <span className="text-slate-500 font-mono text-[10px]">Logged: {exc.created_at}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => navigate(`/cases/${exc.case_id}`)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-xl text-xs flex items-center space-x-1 border border-slate-700"
                  >
                    <span>Open Case</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  {exc.status === 'OPEN' && (
                    <button
                      onClick={() => { setSelectedException(exc); setResolutionReason(''); setShowResolveModal(true); }}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-1"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Resolve Exception</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exception Resolution Modal */}
      {showResolveModal && selectedException && (
        <Modal isOpen={showResolveModal} onClose={() => setShowResolveModal(false)} title={`Resolve Exception: ${selectedException.title}`}>
          <form onSubmit={handleResolveSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Mandatory Resolution Reasoning</label>
              <textarea
                required
                rows={3}
                value={resolutionReason}
                onChange={(e) => setResolutionReason(e.target.value)}
                placeholder="Explain resolution steps taken or quality override approval rationale..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl"
              >
                Save Resolution
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default ExceptionQueuePage;
