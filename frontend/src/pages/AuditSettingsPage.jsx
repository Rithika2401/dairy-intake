import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  Shield,
  Search,
  Lock,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  History,
  FileCheck,
  Cpu,
  Database
} from 'lucide-react';

export const AuditSettingsPage = () => {
  const { auditLogs, systemSettings, updateSettings } = useData();
  const { currentUser, hasPermission } = useAuth();

  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'settings'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('ALL');

  const [tempSettings, setTempSettings] = useState({
    aiConfidenceThreshold: systemSettings.aiConfidenceThreshold,
    coldChainMaxTempC: systemSettings.coldChainMaxTempC,
    fatMinStandardPct: systemSettings.fatMinStandardPct,
    malwareScanningStrict: systemSettings.malwareScanningStrict,
  });

  const filteredLogs = auditLogs.filter((log) => {
    if (actionFilter !== 'ALL' && log.action !== actionFilter) return false;
    if (
      searchTerm &&
      !log.actor.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.details.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !log.entity.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    if (!hasPermission('canManageSettings')) {
      alert('Only Compliance Admin persona has rights to modify system configurations.');
      return;
    }
    updateSettings(tempSettings, currentUser);
    alert('System configurations successfully updated and logged in compliance audit trail.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs mb-1">
            <Shield className="w-4 h-4" /> Immutable Audit & System Settings
          </div>
          <h1 className="text-xl font-bold text-slate-100">Regulatory Compliance Trail & Hub Configuration</h1>
          <p className="text-xs text-slate-400 mt-1">
            Searchable append-only audit trail capturing logins, field overrides, decisions, and system threshold parameters.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'audit'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Immutable Audit Trail
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'settings'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            System Settings & Thresholds
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        /* Audit Trail Tab */
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold text-slate-100">Append-Only Audit Log Register</h2>
              <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-mono">
                {filteredLogs.length} events
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search actor, entity, details..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Event Types</option>
                <option value="FIELD_OVERRIDE">FIELD_OVERRIDE</option>
                <option value="DOCUMENT_UPLOAD">DOCUMENT_UPLOAD</option>
                <option value="SYSTEM_CONFIG_CHANGE">SYSTEM_CONFIG_CHANGE</option>
                <option value="CASE_ASSIGNMENT">CASE_ASSIGNMENT</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Actor & Role</th>
                  <th className="p-3">Action Event</th>
                  <th className="p-3">Entity Ref</th>
                  <th className="p-3">Audit Details</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3 text-right">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-slate-400">{log.timestamp}</td>
                    <td className="p-3 font-sans">
                      <span className="font-semibold text-slate-200 block">{log.actor}</span>
                      <span className="text-[10px] text-cyan-400">{log.role}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-800 text-cyan-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 font-semibold">{log.entity}</td>
                    <td className="p-3 font-sans text-slate-300 max-w-xs leading-tight">{log.details}</td>
                    <td className="p-3 text-slate-500">{log.ipAddress}</td>
                    <td className="p-3 text-right font-sans">
                      <span className="text-emerald-400 font-semibold">{log.outcome}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Settings Tab */
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" /> Operational & AI Model Parameters
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Requires Compliance Admin privileges to update system parameters.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                AI Confidence Low Threshold (Auto-Routing to Reviewer)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="50"
                  max="99"
                  value={tempSettings.aiConfidenceThreshold}
                  onChange={(e) => setTempSettings({ ...tempSettings, aiConfidenceThreshold: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-300 font-bold w-24"
                />
                <span className="text-xs text-slate-400">% minimum confidence</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Cold-Chain Maximum Temperature Limit
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={tempSettings.coldChainMaxTempC}
                  onChange={(e) => setTempSettings({ ...tempSettings, coldChainMaxTempC: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-300 font-bold w-24"
                />
                <span className="text-xs text-slate-400">°C max allowed threshold</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Milk Fat Minimum Standard Limit
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={tempSettings.fatMinStandardPct}
                  onChange={(e) => setTempSettings({ ...tempSettings, fatMinStandardPct: Number(e.target.value) })}
                  className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-cyan-300 font-bold w-24"
                />
                <span className="text-xs text-slate-400">% fat content</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={!hasPermission('canManageSettings')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-xs hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
              >
                Save System Configurations
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
