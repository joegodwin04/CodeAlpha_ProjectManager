import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Zap, Lock, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve resetToken from location state or URL search parameters
  const queryParams = new URLSearchParams(location.search);
  const resetToken = location.state?.resetToken || queryParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!resetToken) {
      return setError('No reset authorization token found. Please restart the recovery flow.');
    }

    if (password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    setIsSubmitting(true);
    try {
      await api.post('/auth/reset-password', {
        resetToken,
        newPassword: password
      });

      setSuccess(true);
      // Automatically redirect to login after 2.5 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Failed to reset password. The reset link may have expired or is invalid.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "block w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors";

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-bg to-purple-600/10" />
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="relative max-w-md text-center z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-8 text-3xl font-bold text-white">ProjectManager</h1>
          <p className="mt-3 text-slate-400 text-base leading-relaxed">
            Create a secure new password for your account. Once updated, you can sign in immediately.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 flex items-center justify-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">ProjectManager</span>
          </div>

          <h2 className="text-2xl font-bold text-white">Set new password</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Please enter and confirm your new password below.
          </p>

          {!resetToken && !success ? (
            <div className="mt-8 space-y-4">
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-4 py-3 text-sm text-amber-400 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">No reset session found</p>
                  <p className="mt-1 text-xs text-amber-300/80">
                    To reset your password, please first verify your identity with your security question.
                  </p>
                </div>
              </div>
              <Link
                to="/forgot-password"
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 transition-all"
              >
                Go to Forgot Password
              </Link>
            </div>
          ) : success ? (
            <div className="mt-8 space-y-5">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
                <h3 className="text-base font-semibold text-white">Password Updated!</h3>
                <p className="mt-1.5 text-xs text-slate-300">
                  Your password has been securely reset. Redirecting you to the sign in page...
                </p>
              </div>
              <Link
                to="/login"
                className="flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 transition-all"
              >
                Sign in now
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-600" />
                  </div>
                  <input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={inputClass}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-600" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={inputClass}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 active:from-violet-700 active:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Resetting password…' : 'Reset Password'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Back to{' '}
            <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
