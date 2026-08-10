import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-4">
      <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-full text-rose-400">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold text-white font-mono">403 - Access Forbidden</h1>
      <p className="text-xs text-rose-300 max-w-sm">You do not possess the required RBAC permissions or tenant access scope to view this resource.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};

export default ForbiddenPage;
