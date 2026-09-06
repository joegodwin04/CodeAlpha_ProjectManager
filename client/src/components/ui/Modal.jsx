import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Modal – centered relative to viewport, independent of page scroll,
 * with fixed header, scrollable body, and pinned footer.
 *
 * Props:
 *  isOpen   {boolean}         – visibility
 *  onClose  {function}        – close callback
 *  title    {string}          – header text
 *  children {ReactNode}       – scrollable body
 *  footer   {ReactNode}       – optional pinned action row (Cancel / Save etc.)
 *  size     {'sm'|'md'|'lg'}  – max-width preset (default 'md')
 */
const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  const overlayRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  const modalContent = (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity" aria-hidden="true" />

      {/* Modal panel – flex-col so footer is always pinned below the scroll area */}
      <div className={`animate-scale-in relative w-full ${sizeClasses[size]} flex flex-col max-h-[90vh] rounded-2xl bg-[#141728] border border-white/[0.12] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden`}>

        {/* ── Header (fixed) ──────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center justify-between border-b border-white/[0.08] px-6 py-4.5 bg-white/[0.01]">
          <h2 id="modal-title" className="text-base sm:text-lg font-bold text-white tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/[0.08] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body (scrollable) ────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>

        {/* ── Footer (pinned) – only rendered when provided ────────────── */}
        {footer && (
          <div className="shrink-0 border-t border-white/[0.08] px-6 py-4 bg-white/[0.01]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
};

export default Modal;
