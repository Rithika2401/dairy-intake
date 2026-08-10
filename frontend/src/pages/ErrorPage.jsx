import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export const ErrorPage = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-4">
      <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-full text-rose-400">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold text-white font-mono">Unexpected System Error</h1>
      <p className="text-xs text-rose-300 max-w-md">An unhandled UI error occurred. Details have been logged for observability.</p>
      {error && (
        <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-rose-400 max-w-lg overflow-x-auto">
          {error.message || String(error)}
        </pre>
      )}
      <button
        onClick={resetErrorBoundary || (() => window.location.reload())}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
      >
        <RefreshCw className="h-4 w-4" />
        <span>Reload Page</span>
      </button>
    </div>
  );
};

export default ErrorPage;
