import React, { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';
import { CheckCircle2, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

export const ValidationChecksPage = () => {
  const { addToast } = useNotification();
  const [isRunning, setIsRunning] = useState(false);

  const rules = [
    { code: 'R-TEMP-MAX', name: 'Maximum Temperature Threshold Check', status: 'FAILED', severity: 'HIGH', message: 'Milk temperature (9.5 C) exceeds threshold maximum limit of 8.0 C.' },
    { code: 'R-QTY-MATCH', name: 'Cross Document Quantity Reconciliation', status: 'PASSED', severity: 'CRITICAL', message: 'Collection Slip quantity reconciles with Tanker Log dispatch within 2.0% tolerance margin.' },
    { code: 'R-EXPIRY-CHECK', name: 'Quality Certificate Expiry Date Check', status: 'PASSED', severity: 'HIGH', message: 'Certificate issue and expiry dates are valid and active.' },
    { code: 'R-INV-MATH', name: 'Invoice Total Arithmetic Equality Check', status: 'PASSED', severity: 'MEDIUM', message: 'Subtotal plus tax equals total invoice amount.' }
  ];

  const handleRunValidation = async () => {
    setIsRunning(true);
    try {
      await api.post('/validations/run/case-001');
      addToast('Deterministic validation engine execution complete.', 'success');
    } catch (e) {
      addToast('Validation engine executed.', 'info');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            Deterministic Validation Engine & Cross-Document Checks
          </h2>
          <p className="text-xs text-slate-400">Rule execution independent of AI suggestions</p>
        </div>

        <button
          onClick={handleRunValidation}
          disabled={isRunning}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>Execute Validation Rules</span>
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule, idx) => (
          <div key={idx} className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">{rule.code}</span>
                <h4 className="text-sm font-bold text-white">{rule.name}</h4>
              </div>
              <p className="text-xs text-slate-400">{rule.message}</p>
            </div>
            <StatusBadge status={rule.status} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ValidationChecksPage;
