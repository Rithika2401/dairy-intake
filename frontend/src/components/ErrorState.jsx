import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorState = ({ title = 'Failed to Load Data', message = 'An unexpected error occurred while communicating with the server.', onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-rose-950/20 border border-rose-900/40 rounded-2xl text-center space-y-4">
      <div className="p-3 bg-rose-900/40 rounded-full text-rose-400">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-rose-200">{title}</h4>
        <p className="text-xs text-rose-300/80 max-w-md">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center space-x-2 px-3 py-1.5 bg-rose-900/60 hover:bg-rose-800 text-rose-100 rounded-lg text-xs font-medium border border-rose-700/50 transition"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Operation</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
