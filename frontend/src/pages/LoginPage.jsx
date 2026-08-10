import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Milk, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('reviewer@dairycoop.com');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const sessionExpired = searchParams.get('session_expired') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl shadow-cyan-500/20">
            <Milk className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dairy Intake & Decision Hub</h1>
          <p className="text-xs text-slate-400">Enterprise AI-Powered Intelligent Document Intake System</p>
        </div>

        {/* Session Expired Alert */}
        {sessionExpired && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Your session has expired. Please sign in again.</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Card */}
        <div className="bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 shadow-2xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@dairycoop.com"
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span>Remember me on this browser</span>
              </label>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <span>Sign In to Decision Hub</span>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <p className="text-[10px] uppercase font-mono text-slate-500 text-center">Quick Demo Account Quick-Fill</p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => { setEmail('reviewer@dairycoop.com'); setPassword('Password123!'); }}
                className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:border-cyan-500 text-left truncate"
              >
                Reviewer Role
              </button>
              <button
                type="button"
                onClick={() => { setEmail('supervisor@dairycoop.com'); setPassword('Password123!'); }}
                className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-300 hover:border-cyan-500 text-left truncate"
              >
                Supervisor Role
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white">Reset Account Password</h3>
            {forgotSubmitted ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Password reset instructions dispatched if account exists.</span>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3">
                <p className="text-xs text-slate-400">Enter your registered email address to receive a secure password reset link.</p>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="name@dairycoop.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100"
                />
                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowForgotModal(false); setForgotSubmitted(false); }}
                    className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-cyan-600 text-white font-medium rounded-xl text-xs"
                  >
                    Send Instructions
                  </button>
                </div>
              </form>
            )}
            {forgotSubmitted && (
              <button
                onClick={() => { setShowForgotModal(false); setForgotSubmitted(false); }}
                className="w-full py-2 bg-slate-800 text-slate-200 text-xs rounded-xl"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
