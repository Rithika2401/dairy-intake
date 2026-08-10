import React from 'react';

export const ConfidenceBadge = ({ confidence }) => {
  const val = parseFloat(confidence || 0);
  const pct = (val * 100).toFixed(0);

  let badgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let label = 'HIGH';

  if (val < 0.70) {
    badgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    label = 'MANDATORY REVIEW';
  } else if (val < 0.88) {
    badgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    label = 'REVIEW RECOMMENDED';
  }

  return (
    <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-xs font-mono font-medium border ${badgeColor}`}>
      <span>{pct}%</span>
      <span className="opacity-75">({label})</span>
    </span>
  );
};

export default ConfidenceBadge;
