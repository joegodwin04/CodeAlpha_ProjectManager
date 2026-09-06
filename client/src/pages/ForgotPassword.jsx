import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Zap, Mail, HelpCircle, KeyRound, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: Security Question
  const [email, setEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Step 1: Look up account & fetch security question
  const handleFindAccount = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      return setError('Please enter your email address.');
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/forgot-password', {
        email: email.trim()
      });

      setSecurityQuestion(data.securityQuestion);
      setStep(2);
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'No security question is configured for this account. Please verify the email address.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Submit answer and obtain short-lived reset token
  const handleVerifyAnswer = async (e) => {
    e.preventDefault();
    setError('');

    if (!securityAnswer.trim()) {
      return setError('Please enter your security answer.');
    }

    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/verify-security-answer', {
        email: email.trim(),
        securityAnswer: securityAnswer.trim()
      });

      // Navigate to Reset Password page with the verified resetToken
      navigate('/reset-password', {
        state: {
          resetToken: data.resetToken,
          email: email.trim()
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect security answer. Please try again.');
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
            Secure password recovery. Answer your chosen security question to reset your password and regain access to your workspace.
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

          <h2 className="text-2xl font-bold text-white">Recover password</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            {step === 1 
              ? 'Enter your registered email address to find your security question.' 
              : 'Answer your security question to authorize a password reset.'}
          </p>

          {error && (
            <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form className="mt-8 space-y-5" onSubmit={handleFindAccount}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-slate-600" />
                  </div>
                  <input
                    id="email"
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 active:from-violet-700 active:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Searching…' : 'Continue'}
              </button>
            </form>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleVerifyAnswer}>
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1 border-b border-white/[0.06]">
                <span>Account: <strong className="text-slate-200">{email}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                    setSecurityAnswer('');
                  }}
                  className="text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Change
                </button>
              </div>

              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-400 mb-1.5">
                  <HelpCircle className="h-4 w-4" /> Security Question
                </div>
                <p className="text-sm font-medium text-white">
                  {securityQuestion}
                </p>
              </div>

              <div>
                <label htmlFor="securityAnswer" className="block text-sm font-medium text-slate-300 mb-1.5">
                  Your Answer
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <KeyRound className="h-4 w-4 text-slate-600" />
                  </div>
                  <input
                    id="securityAnswer"
                    name="securityAnswer"
                    type="text"
                    required
                    autoFocus
                    className={inputClass}
                    placeholder="Enter your security answer"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 active:from-violet-700 active:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Verifying…' : 'Verify Answer'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
