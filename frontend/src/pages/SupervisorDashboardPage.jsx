import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../components/StatusBadge';
import SeverityBadge from '../components/SeverityBadge';
import Modal from '../components/Modal';
import { useNotification } from '../context/NotificationContext';
import { Users, ShieldAlert, Clock, UserCheck, ArrowRight } from 'lucide-react';

export const SupervisorDashboardPage = () => {
  const navigate = useNavigate();
  const { addToast } = useNotification();

  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [newReviewer, setNewReviewer] = useState('usr-rev-001');

  const reviewersWorkload = [
    { id: 'usr-rev-001', name: 'Priya Sharma', role: 'Reviewer', pending_cases: 8, completed_today: 14, avg_turnaround: '1.2h' },
    { id: 'usr-rev-002', name: 'Rahul Verma', role: 'Reviewer', pending_cases: 12, completed_today: 9, avg_turnaround: '2.1h' },
    { id: 'usr-rev-003', name: 'Sneha Patel', role: 'Reviewer', pending_cases: 4, completed_today: 18, avg_turnaround: '0.9h' }
  ];

  const highRiskCases = [
    { id: 'case-002', case_number: 'CAS-2026-002', title: 'Quality Audit - Tanker #GJ-07-X-4421', priority: 'CRITICAL', risk_level: 'CRITICAL', reviewer: 'Priya Sharma', ageing_hours: '18h' },
    { id: 'case-004', case_number: 'CAS-2026-004', title: 'Raw Milk Tanker Clearance - Kheda Hub', priority: 'HIGH', risk_level: 'HIGH', reviewer: 'Rahul Verma', ageing_hours: '26h' }
  ];

  const handleReassignSubmit = (e) => {
    e.preventDefault();
    addToast(`Case ${selectedCase.case_number} reassigned successfully.`, 'success');
    setShowReassignModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <ShieldAlert className="h-6 w-6 text-amber-400" />
          Supervisor Command & Team Workload Center
        </h2>
        <p className="text-xs text-slate-400">Monitor reviewer allocation, turnaround times, ageing cases, and high-risk flags</p>
      </div>

      {/* Reviewer Workload Table */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Users className="h-4 w-4 text-cyan-400" />
          Team Reviewer Workload Allocation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviewersWorkload.map(rev => (
            <div key={rev.id} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-100">{rev.name}</span>
                <span className="text-[10px] font-mono text-cyan-400 font-semibold">{rev.pending_cases} active cases</span>
              </div>
              <div className="space-y-1 text-slate-400 text-[11px]">
                <p>Completed Today: <span className="text-emerald-400 font-semibold">{rev.completed_today}</span></p>
                <p>Avg Turnaround: <span className="font-mono text-slate-300">{rev.avg_turnaround}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* High-Risk & Ageing Cases Table */}
      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-rose-400" />
          Ageing & High-Risk Priority Cases
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase font-mono text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Case Number</th>
                <th className="p-3">Title</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Assigned Reviewer</th>
                <th className="p-3">Ageing Time</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {highRiskCases.map(c => (
                <tr key={c.id} className="hover:bg-slate-800/30">
                  <td className="p-3 font-mono text-cyan-400 font-semibold">{c.case_number}</td>
                  <td className="p-3 font-medium text-slate-200">{c.title}</td>
                  <td className="p-3"><span className="font-bold text-amber-400">{c.priority}</span></td>
                  <td className="p-3"><SeverityBadge severity={c.risk_level} /></td>
                  <td className="p-3 text-slate-400">{c.reviewer}</td>
                  <td className="p-3 font-mono text-rose-400 font-bold">{c.ageing_hours}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => { setSelectedCase(c); setShowReassignModal(true); }}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-lg text-xs font-medium border border-slate-700"
                    >
                      Reassign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {showReassignModal && selectedCase && (
        <Modal isOpen={showReassignModal} onClose={() => setShowReassignModal(false)} title={`Reassign Case: ${selectedCase.case_number}`}>
          <form onSubmit={handleReassignSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Select Target Reviewer</label>
              <select
                value={newReviewer}
                onChange={(e) => setNewReviewer(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-medium"
              >
                {reviewersWorkload.map(r => (
                  <option key={r.id} value={r.id}>{r.name} ({r.pending_cases} active cases)</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setShowReassignModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-xl">Confirm Reassignment</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default SupervisorDashboardPage;
