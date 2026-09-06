import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Zap, Mail, HelpCircle, KeyRound, Loader2, ArrowLeft } from 'lucide-react';

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
            Secure password recovery. Answer your chosen security question to reset your password and regain access to your workspace.
          </p>
          <div className="mt-8 flex justify-center gap-6 text-xs text-slate-400 border-t border-white/[0.06] pt-6">
            <span>✓ Encrypted Answers</span>
            <span>✓ Verified Tokens</span>
            <span>✓ Zero Friction</span>
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

          <h2 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">Recover Password</h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
            {step === 1 
              ? 'Enter your registered email to load your security question.' 
              : 'Answer your security question to authorize a password reset.'}
          </p>

          {error && (
            <div className="mt-6 rounded-xl bg-rose-500/10 border border-rose-500/25 px-4 py-3 text-xs sm:text-sm font-medium text-rose-400">
              {error}
            </div>
          )}

          {step === 1 ? (
            <form className="mt-8 space-y-5" onSubmit={handleFindAccount}>
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <Mail className="h-4 w-4 text-slate-500" />
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
                className="btn-primary w-full py-2.5"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Verifying email…' : 'Continue'}
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
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleVerifyAnswer}>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Security Question
                </label>
                <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-violet-300 mb-1.5">
                    <HelpCircle className="h-4 w-4 text-violet-400" /> Account Question
                  </div>
                  <p className="text-sm font-semibold text-white leading-snug">
                    {securityQuestion}
                  </p>
                </div>
              </div>

              <div>
                <label htmlFor="securityAnswer" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Security Answer
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                    <KeyRound className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="securityAnswer"
                    name="securityAnswer"
                    type="text"
                    required
                    autoFocus
                    className={inputClass}
                    placeholder="Enter your answer"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-2.5"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? 'Verifying answer…' : 'Verify & Reset Password'}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  Change email
                </button>
                <Link
                  to="/login"
                  className="font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                >
                  Return to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
