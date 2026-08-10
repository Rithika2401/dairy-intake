import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 p-4">
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-full text-cyan-400">
        <HelpCircle className="h-10 w-10" />
      </div>
      <h1 className="text-3xl font-bold text-white font-mono">404 - Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm">The requested URL route does not exist in the Dairy Intake Decision Hub.</p>
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Return to Dashboard</span>
      </button>
    </div>
  );
};

export default NotFoundPage;
