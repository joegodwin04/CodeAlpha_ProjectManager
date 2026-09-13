import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, UserPlus, LogIn, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

/**
 * GuestAuthPrompt
 *
 * A modal-style overlay shown when a guest tries to perform a protected action
 * (create / edit / delete projects or tasks). Provides clear paths to Sign In
 * or Create Account without feeling like an error state.
 *
 * Usage:
 *   const [showPrompt, setShowPrompt] = useState(false);
 *   <GuestAuthPrompt isOpen={showPrompt} onClose={() => setShowPrompt(false)} action="create a project" />
 */
const GuestAuthPrompt = ({ isOpen, onClose, action = 'perform this action' }) => {
  const navigate = useNavigate();
  const { exitGuestMode } = useAuth();

  if (!isOpen) return null;

  const goToLogin = () => {
    exitGuestMode();
    onClose();
    navigate('/login');
  };

  const goToRegister = () => {
    exitGuestMode();
    onClose();
    navigate('/register');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
      aria-labelledby="guest-prompt-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full max-w-sm animate-scale-in rounded-2xl border border-white/[0.1] bg-[#141728] p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-violet-500/15 border border-violet-500/25 ring-1 ring-white/10">
          <Lock className="h-5 w-5 text-violet-400" />
        </div>

        {/* Heading */}
        <h3
          id="guest-prompt-title"
          className="mt-4 text-center text-base font-bold text-white tracking-tight"
        >
          Sign in to continue
        </h3>
        <p className="mt-2 text-center text-sm text-slate-400 leading-relaxed">
          You need an account to {action}. Create a free account to manage your own projects and
          tasks.
        </p>

        {/* CTA buttons */}
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            onClick={goToLogin}
            className="btn-primary w-full py-2.5"
          >
            <LogIn className="h-4 w-4" />
            Sign In
          </button>
          <button
            onClick={goToRegister}
            className="btn-secondary w-full py-2.5"
          >
            <UserPlus className="h-4 w-4" />
            Create Account
          </button>
        </div>

        {/* Guest mode hint */}
        <p className="mt-4 text-center text-xs text-slate-500">
          You're currently browsing in{' '}
          <span className="font-semibold text-violet-400">Guest Preview</span> mode.
        </p>
      </div>
    </div>
  );
};

export default GuestAuthPrompt;
