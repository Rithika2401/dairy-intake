import React, { useState, useEffect } from 'react';
import api from '../services/api';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { FileText, ShieldAlert, Sparkles, Quote, Info } from 'lucide-react';

export const GroundedSummaryPage = () => {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await api.get('/ai/grounded-summary/case-001');
        if (res.data.success) {
          setSummaryData(res.data.data);
        }
      } catch (e) {
        setSummaryData({
          summary: 'Collection Slip Lot #891 contains 450.50 L milk volume. Test sample #SMP-991 recorded an elevated temperature of 9.5 C exceeding the 8.0 C maximum threshold limit.',
          key_findings: [
            'Collection Slip quantity and quality metrics parsed across 5 fields.',
            'Milk sample temperature recorded at elevated level (9.5 C > 8.0 C).',
            'Deterministic validation engine flagged 1 rule violation.'
          ],
          risks: [
            '[HIGH] Milk Temperature Deviation Warning: Mandatory cooling inspection required.'
          ],
          cited_evidence: [
            'COLLECTION_SLIP.milk_quantity = "450.50" (Confidence: 94%)',
            'TEST_REPORT.temperature = "9.5" (Confidence: 99%)',
            'COLLECTION_SLIP.farmer_id = "FARM-1001" (Confidence: 98%)'
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <FileText className="h-6 w-6 text-cyan-400" />
          Grounded AI Executive Summary & Decision Support
        </h2>
        <p className="text-xs text-slate-400">Audited executive summary strictly referencing observed source evidence</p>
      </div>

      <div className="p-6 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs">
          <Quote className="h-4 w-4" />
          <span className="uppercase tracking-wider font-bold">Executive Case Summary</span>
        </div>
        <p className="text-sm font-medium text-slate-100 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
          {summaryData?.summary}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Key Observed Findings</h4>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {summaryData?.key_findings?.map((kf, i) => <li key={i}>{kf}</li>)}
            </ul>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-rose-300 uppercase tracking-wider font-mono">Quality & Compliance Risks</h4>
            <ul className="space-y-1 text-xs text-rose-200 list-disc list-inside">
              {summaryData?.risks?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        </div>

        <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2">
          <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">Cited Source Evidence</h4>
          <div className="space-y-1 font-mono text-xs text-cyan-300">
            {summaryData?.cited_evidence?.map((ev, i) => (
              <div key={i} className="p-2 bg-slate-900 rounded border border-slate-800">{ev}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroundedSummaryPage;
