import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({ title = 'No Records Found', description = 'There are no items matching your criteria at this time.', actionText, onAction }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl text-center space-y-4">
      <div className="p-4 bg-slate-800/60 rounded-full text-slate-400">
        <Inbox className="h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-slate-200">{title}</h4>
        <p className="text-sm text-slate-400 max-w-sm">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
