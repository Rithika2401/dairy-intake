import React from 'react';

export const StatusBadge = ({ status }) => {
  const getStyle = (s) => {
    switch (s?.toUpperCase()) {
      case 'APPROVED':
      case 'PASSED':
      case 'RESOLVED':
      case 'SAFE':
      case 'PROCESSED':
      case 'ACTIVE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'REJECTED':
      case 'FAILED':
      case 'CRITICAL':
      case 'MALWARE':
      case 'SCAN_FAILED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'SUBMITTED':
      case 'PROCESSING':
      case 'PENDING_REVIEW':
      case 'IN_PROGRESS':
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'EXCEPTION':
      case 'CORRECTION_REQUESTED':
      case 'ESCALATED':
      case 'HIGH':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle(status)}`}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current animate-pulse"></span>
      {status || 'UNKNOWN'}
    </span>
  );
};

export default StatusBadge;
