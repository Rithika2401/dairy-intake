import React from 'react';

export const SeverityBadge = ({ severity }) => {
  const getStyle = (s) => {
    switch (s?.toUpperCase()) {
      case 'CRITICAL':
        return 'bg-rose-950 text-rose-300 border-rose-600/50 font-bold';
      case 'HIGH':
        return 'bg-amber-950 text-amber-300 border-amber-600/50';
      case 'MEDIUM':
        return 'bg-purple-950 text-purple-300 border-purple-600/50';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border ${getStyle(severity)}`}>
      {severity || 'LOW'}
    </span>
  );
};

export default SeverityBadge;
