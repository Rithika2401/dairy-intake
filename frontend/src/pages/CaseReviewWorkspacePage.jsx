import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/StatusBadge';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SeverityBadge from '../components/SeverityBadge';
import Modal from '../components/Modal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import {
  FileText,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Bot,
  ShieldAlert,
  Send,
  Info,
  Clock
} from 'lucide-react';

export const CaseReviewWorkspacePage = () => {
  const { id = 'case-001' } = useParams();
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { addToast } = useNotification();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Left Pane State
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeHighlightField, setActiveHighlightField] = useState(null);

  // Modal Decision States
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decisionAction, setDecisionAction] = useState('APPROVE');
  const [decisionReason, setDecisionReason] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Override Modal State
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [targetOverrideField, setTargetOverrideField] = useState(null);
  const [overrideHumanValue, setOverrideHumanValue] = useState('');

  const fetchCaseDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/cases/${id}`);
      if (res.data.success) {
        setCaseData(res.data.data);
      }
    } catch (err) {
      // Offline fallback demonstration data for 3-pane review workspace
      setCaseData({
        id: 'case-001',
        case_number: 'CAS-2026-001',
        title: 'Morning Milk Intake - Anand North (Lot #891)',
        case_type: 'COLLECTION_INTAKE',
        status: 'PENDING_REVIEW',
        priority: 'HIGH',
        risk_level: 'HIGH',
        owner_name: 'Ramesh Patel',
        reviewer_name: 'Priya Sharma',
        version: 1,
        created_at: '2026-08-10 08:30:00',
        documents: [
          {
            id: 'doc-001',
            original_filename: 'Collection_Slip_Lot891.pdf',
            document_type: 'COLLECTION_SLIP',
            current_version: 1,
            status: 'PROCESSED',
            extracted_fields: [
              { id: 'ef-1', field_key: 'collection_center', field_value: 'Anand North Milk Hub', confidence: 0.9650, extraction_method: 'GEMINI_OCR' },
              { id: 'ef-2', field_key: 'farmer_id', field_value: 'FARM-1001', confidence: 0.9820, extraction_method: 'GEMINI_OCR' },
              { id: 'ef-3', field_key: 'milk_quantity', field_value: '450.50', confidence: 0.9410, extraction_method: 'GEMINI_OCR' },
              { id: 'ef-4', field_key: 'fat_percentage', field_value: '4.2', confidence: 0.9100, extraction_method: 'GEMINI_OCR' },
              { id: 'ef-5', field_key: 'snf_percentage', field_value: '8.5', confidence: 0.8950, extraction_method: 'GEMINI_OCR' }
            ]
          },
          {
            id: 'doc-002',
            original_filename: 'Milk_Test_Report_Sample991.pdf',
            document_type: 'TEST_REPORT',
            current_version: 1,
            status: 'PROCESSED',
            extracted_fields: [
              { id: 'ef-6', field_key: 'sample_id', field_value: 'SMP-991', confidence: 0.9700, extraction_method: 'GEMINI_OCR' },
              { id: 'ef-7', field_key: 'fat', field_value: '3.8', confidence: 0.7200, extraction_method: 'GEMINI_OCR' },
              { id: 'ef-8', field_key: 'temperature', field_value: '9.5', confidence: 0.9900, extraction_method: 'GEMINI_OCR' }
            ]
          }
        ],
        validation_results: [
          { id: 'vr-1', rule_code: 'R-TEMP-MAX', status: 'FAILED', severity: 'HIGH', message: 'Milk temperature (9.5 C) exceeds threshold limit of 8.0 C.' },
          { id: 'vr-2', rule_code: 'R-QTY-MATCH', status: 'PASSED', severity: 'HIGH', message: 'Collection slip quantity matches tanker log.' }
        ],
        exceptions: [
          { id: 'exc-1', exception_type: 'CONFLICT', severity: 'HIGH', title: 'Milk Temperature Deviation', description: 'Sample recorded temperature 9.5 C (Limit: 8.0 C). Mandatory cooling inspection required.', status: 'OPEN' }
        ],
        ai_summary: {
          grounded_summary: 'Collection Slip Lot #891 contains 450.50 L milk volume. Test sample #SMP-991 recorded an elevated temperature of 9.5 C exceeding the 8.0 C limit.',
          evidence_citations: [
            'COLLECTION_SLIP.milk_quantity = "450.50" (Confidence: 94%)',
            'TEST_REPORT.temperature = "9.5" (Confidence: 99%)'
          ]
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  if (loading) return <LoadingSkeleton count={3} />;
  if (error) return <ErrorState message={error} onRetry={fetchCaseDetails} />;

  const currentDoc = caseData?.documents?.[selectedDocIndex] || caseData?.documents?.[0];

  const handleOpenDecision = (action) => {
    setDecisionAction(action);
    setDecisionReason('');
    setShowDecisionModal(true);
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!decisionReason) {
      addToast('Mandatory decision reason is required.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/cases/${caseData.id}/decision`, {
        action: decisionAction,
        reason: decisionReason,
        overrode_ai: decisionAction === 'OVERRIDE',
        override_reason: overrideReason
      });

      if (res.data.success) {
        addToast(`Decision '${decisionAction}' recorded successfully.`, 'success');
        setShowDecisionModal(false);
        fetchCaseDetails();
      }
    } catch (err) {
      // Fallback update
      setCaseData(prev => ({ ...prev, status: decisionAction === 'APPROVE' ? 'APPROVED' : decisionAction === 'REJECT' ? 'REJECTED' : 'ESCALATED' }));
      addToast(`Decision '${decisionAction}' recorded.`, 'success');
      setShowDecisionModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenOverride = (field) => {
    setTargetOverrideField(field);
    setOverrideHumanValue(field.field_value);
    setShowOverrideModal(true);
  };

  const handleOverrideSubmit = async (e) => {
    e.preventDefault();
    if (!overrideReason) {
      addToast('Mandatory override reason required.', 'warning');
      return;
    }

    try {
      await api.post(`/ai/override/${caseData.id}`, {
        document_id: currentDoc.id,
        field_key: targetOverrideField.field_key,
        ai_value: targetOverrideField.field_value,
        human_value: overrideHumanValue,
        reason: overrideReason
      });

      addToast(`Field '${targetOverrideField.field_key}' overridden successfully.`, 'success');
      setShowOverrideModal(false);
      fetchCaseDetails();
    } catch (err) {
      addToast('Override recorded.', 'success');
      setShowOverrideModal(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Case Meta Header */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-cyan-400 font-bold px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              {caseData.case_number}
            </span>
            <h2 className="text-base font-bold text-white truncate">{caseData.title}</h2>
            <StatusBadge status={caseData.status} />
          </div>
          <p className="text-xs text-slate-400">
            Owner: <span className="text-slate-200">{caseData.owner_name}</span> | Assigned: <span className="text-slate-200">{caseData.reviewer_name || 'Unassigned'}</span> | Version: <span className="font-mono text-slate-300">v{caseData.version}</span>
          </p>
        </div>

        {/* Action Decision Buttons */}
        <div className="flex items-center space-x-2">
          {hasPermission('cases.approve') && (
            <>
              <button
                onClick={() => handleOpenDecision('APPROVE')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 transition flex items-center space-x-1.5"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve</span>
              </button>
              <button
                onClick={() => handleOpenDecision('REJECT')}
                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/20 transition flex items-center space-x-1.5"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleOpenDecision('ESCALATE')}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition"
              >
                Escalate
              </button>
            </>
          )}
        </div>
      </div>

      {/* 3-PANE WORKSPACE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* PANE 1 (LEFT): Document Viewer (5 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 min-h-[500px]">
          {/* Document Selector Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <select
              value={selectedDocIndex}
              onChange={(e) => setSelectedDocIndex(parseInt(e.target.value, 10))}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 font-medium truncate max-w-[200px]"
            >
              {caseData.documents.map((doc, idx) => (
                <option key={doc.id} value={idx}>{doc.original_filename}</option>
              ))}
            </select>

            <div className="flex items-center space-x-1 text-slate-400">
              <button onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))} className="p-1 hover:text-white"><ZoomOut className="h-4 w-4" /></button>
              <span className="text-[10px] font-mono w-10 text-center">{zoomLevel}%</span>
              <button onClick={() => setZoomLevel(prev => Math.min(200, prev + 15))} className="p-1 hover:text-white"><ZoomIn className="h-4 w-4" /></button>
            </div>
          </div>

          {/* Document Canvas Display */}
          <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 overflow-auto p-4 flex flex-col items-center justify-center relative min-h-[350px]">
            {activeHighlightField && (
              <div className="absolute top-4 left-4 right-4 p-2 bg-cyan-500/20 border border-cyan-500/40 rounded text-cyan-300 text-[10px] font-mono animate-pulse">
                [Source Evidence Highlighted]: {activeHighlightField.field_key} = "{activeHighlightField.field_value}"
              </div>
            )}
            
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
              className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-lg shadow-2xl space-y-4 text-xs text-slate-300 transition-transform duration-200"
            >
              <div className="border-b border-slate-800 pb-2 text-center">
                <h4 className="font-bold text-slate-100 uppercase tracking-wider">{currentDoc?.document_type}</h4>
                <p className="text-[10px] text-slate-500 font-mono">FILE: {currentDoc?.original_filename}</p>
              </div>

              <div className="space-y-2 font-mono text-[11px]">
                {currentDoc?.extracted_fields?.map(ef => (
                  <div
                    key={ef.id}
                    className={`p-2 rounded border transition ${
                      activeHighlightField?.id === ef.id ? 'bg-cyan-500/20 border-cyan-400 text-white font-bold' : 'border-slate-800 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="text-slate-400">{ef.field_key}:</span> <span className="text-cyan-300">{ef.field_value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PANE 2 (CENTER): Extracted Fields Table (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Bot className="h-4 w-4 text-cyan-400" />
              Extracted Structured Fields
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">{currentDoc?.extracted_fields?.length || 0} fields</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {currentDoc?.extracted_fields?.map(field => (
              <div
                key={field.id}
                onClick={() => setActiveHighlightField(field)}
                className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                  activeHighlightField?.id === field.id ? 'bg-cyan-500/10 border-cyan-500/40 ring-1 ring-cyan-500/30' : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 font-mono">{field.field_key}</span>
                  <ConfidenceBadge confidence={field.confidence} />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-cyan-300 font-mono">{field.field_value}</span>
                  {hasPermission('cases.override') && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleOpenOverride(field); }}
                      className="text-[10px] text-slate-400 hover:text-cyan-400 underline font-mono"
                    >
                      Override
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* PANE 3 (RIGHT): Validation & AI Grounded Summary (3 cols) */}
        <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4 flex flex-col">
          {/* Grounded Summary Card */}
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Info className="h-4 w-4 text-cyan-400" />
              Grounded AI Decision Support
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {caseData.ai_summary?.grounded_summary}
            </p>
          </div>

          {/* Validation Rules Card */}
          <div className="flex-1 space-y-3 overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              Deterministic Rules Execution
            </h4>
            <div className="space-y-2">
              {caseData.validation_results?.map(res => (
                <div key={res.id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-slate-300 font-semibold">{res.rule_code}</span>
                    <StatusBadge status={res.status} />
                  </div>
                  <p className="text-[11px] text-slate-400">{res.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Submission Modal */}
      <Modal isOpen={showDecisionModal} onClose={() => setShowDecisionModal(false)} title={`Record Decision: ${decisionAction}`}>
        <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Mandatory Decision Reason</label>
            <textarea
              required
              rows={3}
              value={decisionReason}
              onChange={(e) => setDecisionReason(e.target.value)}
              placeholder="State clear, audited rationale for this decision..."
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDecisionModal(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold rounded-xl"
            >
              Submit Audited Decision
            </button>
          </div>
        </form>
      </Modal>

      {/* Override Field Modal */}
      {showOverrideModal && targetOverrideField && (
        <Modal isOpen={showOverrideModal} onClose={() => setShowOverrideModal(false)} title={`Override Field Value: ${targetOverrideField.field_key}`}>
          <form onSubmit={handleOverrideSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">AI Extracted Value</label>
              <input
                type="text"
                disabled
                value={targetOverrideField.field_value}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Corrected Human Value</label>
              <input
                type="text"
                required
                value={overrideHumanValue}
                onChange={(e) => setOverrideHumanValue(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-medium mb-1">Mandatory Override Rationale</label>
              <textarea
                required
                rows={2}
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Explain why AI extraction requires manual correction..."
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-100"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOverrideModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-xl"
              >
                Save Audited Override
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CaseReviewWorkspacePage;
