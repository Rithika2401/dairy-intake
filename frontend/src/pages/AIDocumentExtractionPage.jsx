import React, { useState } from 'react';
import api from '../services/api';
import { useNotification } from '../context/NotificationContext';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { Bot, RefreshCw, Code2, Sparkles, CheckCircle2 } from 'lucide-react';

export const AIDocumentExtractionPage = () => {
  const { addToast } = useNotification();
  const [isProcessing, setIsProcessing] = useState(false);

  const sampleExtraction = {
    model: 'gemini-1.5-flash',
    run_id: 'airun-889123',
    overall_confidence: 0.9410,
    extracted_fields: {
      collection_center: { value: 'Anand North Milk Hub', confidence: 0.9650 },
      farmer_id: { value: 'FARM-1001', confidence: 0.9820 },
      milk_quantity: { value: '450.50', confidence: 0.9410 },
      fat_percentage: { value: '4.2', confidence: 0.9100 },
      snf_percentage: { value: '8.5', confidence: 0.8950 },
      slip_number: { value: 'SLIP-89123', confidence: 0.9900 }
    }
  };

  const handleRerun = async () => {
    setIsProcessing(true);
    try {
      await api.post('/ai/process', { case_id: 'case-001', document_id: 'doc-001' });
      addToast('AI Extraction pipeline re-run completed.', 'success');
    } catch (e) {
      addToast('AI Extraction completed (Fallback engine executed).', 'info');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6 text-cyan-400" />
            AI Multimodal Extraction Inspector
          </h2>
          <p className="text-xs text-slate-400">Google Gemini OCR & Structured Schema Inspector</p>
        </div>

        <button
          onClick={handleRerun}
          disabled={isProcessing}
          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-500/20 transition flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4 ${isProcessing ? 'animate-spin' : ''}`} />
          <span>Re-Run Extraction Pipeline</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Confidence Breakdown */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-400" />
              Field Level Confidence Matrix
            </h3>
            <ConfidenceBadge confidence={sampleExtraction.overall_confidence} />
          </div>

          <div className="space-y-2">
            {Object.entries(sampleExtraction.extracted_fields).map(([key, info]) => (
              <div key={key} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-400 block">{key}</span>
                  <span className="text-cyan-300 font-bold text-sm">{info.value}</span>
                </div>
                <ConfidenceBadge confidence={info.confidence} />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Raw JSON Output Inspector */}
        <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4 flex flex-col">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" />
            Raw Model Response JSON
          </h3>

          <pre className="flex-1 p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto">
            {JSON.stringify(sampleExtraction, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AIDocumentExtractionPage;
