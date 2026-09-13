import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, Loader2, Eye } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, enterGuestMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestMode = () => {
    enterGuestMode();
    navigate('/');
  };

  const inputClass =
    'block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all';

  return (
    <div className="flex min-h-screen bg-[#0b0d14]">
      {/* Left panel — ambient branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden border-r border-white/[0.06] bg-[#0e111d]">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/15 via-transparent to-purple-600/10 pointer-events-none" />
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-md text-center z-10 px-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-xl shadow-violet-500/25 ring-2 ring-white/20">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-8 text-3xl font-extrabold text-white tracking-tight">ProjectManager</h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Organize projects, track deliverables, and ship on time. A modern productivity workspace
            built for developers.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400 border-t border-white/[0.06] pt-6">
            <span>✓ Task Workspaces</span>
            <span>✓ Real-time Progress</span>
            <span>✓ Milestone Deadlines</span>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 ring-1 ring-white/20 shadow-md">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">ProjectManager</span>
          </div>

          <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Welcome back</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Sign in to access your workspace dashboard.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 px-4 py-3 text-xs sm:text-sm font-medium text-rose-400">
                {error}
              </div>
            )}

            <div>
              <label
                htmlFor="email-address"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputClass}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={inputClass}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-2.5"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* OR divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#0b0d14] px-3 text-xs font-medium text-slate-500 uppercase tracking-widest">
                or
              </span>
            </div>
          </div>

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={handleGuestMode}
            className="group w-full flex items-center justify-center gap-2.5 rounded-lg border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/[0.06] hover:border-white/[0.18] hover:text-white transition-all duration-200"
          >
            <Eye className="h-4 w-4 text-slate-400 group-hover:text-violet-400 transition-colors" />
            Continue as Guest
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-500">
            Preview the app with demo data — no account needed
          </p>

          {/* Register link */}
          <p className="mt-6 text-center text-xs sm:text-sm text-slate-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
