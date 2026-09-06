import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { Zap, Lock, Loader2, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

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

  const inputClass = "block w-full rounded-lg border border-white/[0.09] bg-[#121526] py-2.5 pl-10 pr-3.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all";

  return (
    <div className="flex min-h-screen bg-[#0b0d14]">
      {/* Left panel — branding */}
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
            Create a secure new password for your account. Once updated, you can sign in and continue where you left off.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400 border-t border-white/[0.06] pt-6">
            <span>✓ Secure Encryption</span>
            <span>✓ Verified Session</span>
            <span>✓ Instant Access</span>
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

          <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Set New Password</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            Please enter and confirm your new account password below.
          </p>

          {!resetToken && !success ? (
            <div className="mt-8 space-y-4">
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/25 px-4 py-3.5 text-xs sm:text-sm text-amber-400 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-amber-300">No reset session found</p>
                  <p className="mt-1 text-xs text-amber-200/80 leading-relaxed">
                    To reset your password, please first verify your identity with your security question.
                  </p>
                </div>
              </div>
              <Link
                to="/forgot-password"
                className="btn-primary w-full py-2.5"
              >
                Go to Forgot Password
              </Link>
            </div>
          ) : success ? (
            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/10 p-6 text-center">
                <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-400 mb-3 shadow-sm" />
                <h3 className="text-base font-bold text-white">Password Updated Successfully!</h3>
                <p className="mt-1.5 text-xs text-slate-300">
                  Your password has been securely reset. Redirecting you to the sign-in page...
                </p>
              </div>
              <Link
                to="/login"
                className="btn-primary w-full py-2.5"
              >
                Sign in now
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/25 px-4 py-3 text-xs sm:text-sm font-medium text-rose-400">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="new-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={inputClass}
                    placeholder="Enter new password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Lock className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    className={inputClass}
                    placeholder="Re-enter your new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-2.5"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Resetting password…' : 'Reset Password'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
