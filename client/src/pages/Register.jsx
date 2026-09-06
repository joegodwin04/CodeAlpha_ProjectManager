import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, Mail, Lock, User, AtSign, Loader2, HelpCircle, KeyRound } from 'lucide-react';

export const SECURITY_QUESTIONS = [
  'What was the name of your first school?',
  'What was the name of your first pet?',
  'What city were you born in?',
  'What was your childhood nickname?',
  'What was your favorite subject in school?',
  'What was the model of your first car?'
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    securityQuestion: SECURITY_QUESTIONS[0],
    securityAnswer: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      return setError('Password must be at least 6 characters long.');
    }

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match.');
    }

    if (!formData.securityQuestion) {
      return setError('Please select a security question.');
    }

    if (!formData.securityAnswer || !formData.securityAnswer.trim()) {
      return setError('Please provide an answer to your security question.');
    }

    setIsSubmitting(true);
    try {
      await register(
        formData.name,
        formData.username,
        formData.email,
        formData.password,
        formData.securityQuestion,
        formData.securityAnswer.trim()
      );
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "block w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors";
  const selectClass = "block w-full rounded-lg border border-white/[0.08] bg-[#161922] py-2.5 pl-10 pr-8 text-sm text-slate-200 placeholder:text-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-colors cursor-pointer";

  return (
    <div className="flex min-h-screen bg-bg">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/20 via-bg to-purple-600/10" />
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl" />
        <div className="relative max-w-md text-center z-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
            <Zap className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-8 text-3xl font-bold text-white">ProjectManager</h1>
          <p className="mt-3 text-slate-400 text-base leading-relaxed">
            Start organizing your development workflow today. Track projects, manage tasks, and stay on top of deadlines.
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

          <h2 className="text-2xl font-bold text-white">Create your account</h2>
          <p className="mt-1.5 text-sm text-slate-500">Get started for free — no credit card required.</p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1.5">Full name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <input id="name" name="name" type="text" required className={inputClass}
                  placeholder="Jane Doe" value={formData.name} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <AtSign className="h-4 w-4 text-slate-600" />
                </div>
                <input id="username" name="username" type="text" required className={inputClass}
                  placeholder="janedoe" value={formData.username} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-600" />
                </div>
                <input id="email-address" name="email" type="email" autoComplete="email" required className={inputClass}
                  placeholder="you@example.com" value={formData.email} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-600" />
                </div>
                <input id="password" name="password" type="password" autoComplete="new-password" required className={inputClass}
                  placeholder="Min. 6 characters" value={formData.password} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-1.5">Confirm password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-600" />
                </div>
                <input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required className={inputClass}
                  placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} />
              </div>
            </div>

            <div>
              <label htmlFor="securityQuestion" className="block text-sm font-medium text-slate-300 mb-1.5">
                Security Question
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <HelpCircle className="h-4 w-4 text-slate-600" />
                </div>
                <select
                  id="securityQuestion"
                  name="securityQuestion"
                  required
                  className={selectClass}
                  value={formData.securityQuestion}
                  onChange={handleChange}
                >
                  {SECURITY_QUESTIONS.map((q, idx) => (
                    <option key={idx} value={q} className="bg-[#1a1d27] text-slate-200">
                      {q}
                    </option>
                  ))}
                </select>
              </div>
              <p className="mt-1 text-xs text-slate-500">Used to recover your password if you ever forget it.</p>
            </div>

            <div>
              <label htmlFor="securityAnswer" className="block text-sm font-medium text-slate-300 mb-1.5">
                Security Answer
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
                  className={inputClass}
                  placeholder="Your secret answer"
                  value={formData.securityAnswer}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
