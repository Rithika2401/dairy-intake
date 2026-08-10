import React from 'react';

export const LoadingSkeleton = ({ count = 3 }) => {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
          <div className="h-5 bg-slate-800 rounded w-1/3"></div>
          <div className="h-4 bg-slate-800/60 rounded w-2/3"></div>
          <div className="h-4 bg-slate-800/40 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;
