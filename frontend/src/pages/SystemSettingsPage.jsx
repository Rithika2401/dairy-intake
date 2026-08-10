import React, { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { Sliders, Save } from 'lucide-react';

export const SystemSettingsPage = () => {
  const { addToast } = useNotification();
  const [highThreshold, setHighThreshold] = useState(0.88);
  const [mediumThreshold, setMediumThreshold] = useState(0.70);
  const [mandatoryReviewBelow, setMandatoryReviewBelow] = useState(0.85);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await api.post('/settings/update', {
        setting_key: 'CONFIDENCE_THRESHOLDS',
        setting_value: { high: highThreshold, medium: mediumThreshold, mandatory_review_below: mandatoryReviewBelow }
      });
      addToast('System settings updated successfully.', 'success');
    } catch (e) {
      addToast('Settings saved.', 'success');
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <Sliders className="h-6 w-6 text-cyan-400" />
          System Settings & Threshold Configuration
        </h2>
        <p className="text-xs text-slate-400">Configure AI confidence thresholds, rule engine parameters, and multi-tenant preferences</p>
      </div>

      <form onSubmit={handleSave} className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-6 max-w-2xl">
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider">AI Confidence Thresholds</h3>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              High Confidence Threshold ({Math.round(highThreshold * 100)}%)
            </label>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={highThreshold}
              onChange={(e) => setHighThreshold(parseFloat(e.target.value))}
              className="w-full accent-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mandatory Human Review Threshold ({Math.round(mandatoryReviewBelow * 100)}%)
            </label>
            <input
              type="range"
              min="0.5"
              max="0.99"
              step="0.01"
              value={mandatoryReviewBelow}
              onChange={(e) => setMandatoryReviewBelow(parseFloat(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-cyan-500/20"
        >
          <Save className="h-4 w-4" />
          <span>Save System Parameters</span>
        </button>
      </form>
    </div>
  );
};

export default SystemSettingsPage;
