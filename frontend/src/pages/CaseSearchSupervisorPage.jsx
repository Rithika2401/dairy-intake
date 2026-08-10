import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { ReasonModal } from '../components/ReasonModal';
import {
  LayoutDashboard,
  Search,
  Users,
  Clock,
  GitCompare,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  Layers,
  Filter
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';

export const CaseSearchSupervisorPage = () => {
  const { cases, submitCaseDecision } = useData();
  const { currentUser, hasPermission } = useAuth();
  const [searchParams] = useSearchParams();

  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedReviewer, setSelectedReviewer] = useState('ALL');
  const [showDiffTool, setShowDiffTool] = useState(false);

  const [selectedCaseForAction, setSelectedCaseForAction] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [showReasonModal, setShowReasonModal] = useState(false);

  const filteredCases = cases.filter((c) => {
    if (selectedReviewer !== 'ALL' && c.assignedReviewer !== selectedReviewer) return false;
    if (
      searchTerm &&
      !c.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !c.documentType.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const handleSupervisorAction = (caseItem, actionType) => {
    setSelectedCaseForAction(caseItem);
    setPendingAction(actionType);
    setShowReasonModal(true);
  };

  const handleModalSubmit = (reasonText) => {
    if (selectedCaseForAction && pendingAction) {
      submitCaseDecision(selectedCaseForAction.id, pendingAction, reasonText, currentUser);
    }
    setSelectedCaseForAction(null);
    setPendingAction(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
            <LayoutDashboard className="w-4 h-4" /> Supervisor Oversight & Case Search
          </div>
          <h1 className="text-xl font-bold text-slate-100">Reviewer Workload, Aging & Document Comparison</h1>
          <p className="text-xs text-slate-400 mt-1">
            Supervisor control center to re-assign cases, compare document versions side-by-side, and track aging SLA metrics.
          </p>
        </div>

        <button
          onClick={() => setShowDiffTool(!showDiffTool)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          <GitCompare className="w-4 h-4" /> {showDiffTool ? 'Hide Diff Tool' : 'Launch Document Comparison Diff Tool'}
        </button>
      </div>

      {/* Reviewer Workload Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Dr. Ananya Roy (QC Tech)</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-xl font-bold text-slate-100">3 Active Cases</p>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 w-3/4 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400">SLA Turnaround Avg: 1.8 hrs</p>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Sanjay Mehta (Plant Ops)</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-bold text-slate-100">1 Active Case</p>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 w-1/4 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400">SLA Turnaround Avg: 0.9 hrs</p>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Priya Nair (Compliance)</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-xl font-bold text-slate-100">1 Active Case</p>
          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
            <div className="h-full bg-purple-400 w-1/4 rounded-full" />
          </div>
          <p className="text-[10px] text-slate-400">SLA Turnaround Avg: 1.2 hrs</p>
        </div>
      </div>

      {/* Document Comparison Diff Tool (Side-by-side text/field comparison) */}
      {showDiffTool && (
        <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-cyan-300 flex items-center gap-2">
              <GitCompare className="w-4 h-4" /> Side-by-Side Document Version & Cross-Matching Diff Tool
            </h2>
            <span className="text-xs text-slate-400 font-mono">Comparing: Collection Slip CS-991 vs Tanker Log TL-409</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Version A / Document A */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-cyan-400 font-bold border-b border-slate-800 pb-2">
                <span>Document A: Morning Collection Slip #CS-991</span>
                <span>v1.0 (Original Intake)</span>
              </div>
              <div className="font-mono space-y-1 text-slate-300">
                <p>Volume Recorded: <span className="text-emerald-400 font-bold">1,250.5 Liters</span></p>
                <p>Fat Content: <span className="text-emerald-400 font-bold">4.2%</span></p>
                <p>Temperature: <span className="text-emerald-400 font-bold">3.4°C</span></p>
                <p>Chilling Depot: Anand Main Chilling Hub</p>
              </div>
            </div>

            {/* Version B / Document B */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-amber-400 font-bold border-b border-slate-800 pb-2">
                <span>Document B: Tanker Reception Log #TL-409</span>
                <span>v1.1 (Bay Flowmeter)</span>
              </div>
              <div className="font-mono space-y-1 text-slate-300">
                <p>Volume Received: <span className="text-emerald-400 font-bold">1,250.5 Liters</span> <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1 rounded">MATCH</span></p>
                <p>Fat Content: <span className="text-amber-400 font-bold">4.1%</span> <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-1 rounded">-0.1% diff</span></p>
                <p>Arrival Temp: <span className="text-emerald-400 font-bold">3.6°C</span> <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1 rounded">+0.2°C diff</span></p>
                <p>Chilling Depot: Anand Main Chilling Hub</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Case Search & Management Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">Global Case Directory & Timeline</h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search cases, ID, document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <select
              value={selectedReviewer}
              onChange={(e) => setSelectedReviewer(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Reviewers</option>
              <option value="Dr. Ananya Roy">Dr. Ananya Roy</option>
              <option value="Sanjay Mehta">Sanjay Mehta</option>
              <option value="Priya Nair">Priya Nair</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3">Case ID</th>
                <th className="p-3">Title</th>
                <th className="p-3">Assigned Reviewer</th>
                <th className="p-3">Aging (Hours)</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Supervisor Controls</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredCases.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-cyan-400">{c.id}</td>
                  <td className="p-3 font-sans text-slate-200">{c.title}</td>
                  <td className="p-3 font-sans text-slate-300">{c.assignedReviewer}</td>
                  <td className="p-3">
                    <span className="flex items-center gap-1 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> {c.agingHours}h
                    </span>
                  </td>
                  <td className="p-3">
                    <StatusBadge type="status" value={c.status} />
                  </td>
                  <td className="p-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/case/${c.id}`}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Inspect
                      </Link>

                      {hasPermission('canSupervise') && (
                        <>
                          <button
                            onClick={() => handleSupervisorAction(c, 'approve')}
                            className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold hover:bg-emerald-500/30"
                          >
                            Override Approve
                          </button>
                          <button
                            onClick={() => handleSupervisorAction(c, 'escalate')}
                            className="px-2 py-1 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30 text-[11px] font-semibold hover:bg-purple-500/30"
                          >
                            Reassign
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReasonModal
        isOpen={showReasonModal}
        onClose={() => setShowReasonModal(false)}
        onSubmit={handleModalSubmit}
        title={`Supervisor Override Action: ${pendingAction?.toUpperCase()}`}
      />
    </div>
  );
};
