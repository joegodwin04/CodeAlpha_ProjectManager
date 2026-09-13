import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

/* Status styling indicators */
const statusDots = {
  Planning: 'bg-slate-400',
  Active: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.5)]',
  'On Hold': 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.5)]',
  Completed: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]',
  Todo: 'bg-slate-400',
  'In Progress': 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.5)]',
  Done: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]',
};

/* Priority icon and color mappings */
const priorityMeta = {
  High: { icon: ArrowUp, color: 'text-rose-400' },
  Medium: { icon: ArrowRight, color: 'text-amber-400' },
  Low: { icon: ArrowDown, color: 'text-cyan-400' },
};

const CustomSelect = ({
  value,
  onChange,
  options = [],
  name,
  placeholder = 'Select option',
  className = '',
  size = 'md',
  disabled = false,
  align = 'left'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Normalize options to { value, label, sublabel, icon, avatar, dot } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value,
        label: opt.label !== undefined ? opt.label : opt.value,
        sublabel: opt.sublabel,
        icon: opt.icon,
        avatar: opt.avatar,
        dot: opt.dot
      };
    }
    return { value: opt, label: String(opt) };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (isOpen) {
        if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
          handleSelect(normalizedOptions[highlightedIndex].value);
        } else {
          setIsOpen(false);
        }
      } else {
        setIsOpen(true);
        const idx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(0);
      } else {
        setHighlightedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setHighlightedIndex(normalizedOptions.length - 1);
      } else {
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Tab') {
      setIsOpen(false);
    }
  };

  const handleSelect = (val) => {
    if (onChange) {
      const syntheticEvent = {
        target: { name: name || '', value: val }
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const renderIndicator = (val) => {
    if (priorityMeta[val]) {
      const { icon: Icon, color } = priorityMeta[val];
      return <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} />;
    }
    if (statusDots[val]) {
      return <span className={`h-2 w-2 rounded-full ${statusDots[val]} shrink-0`} />;
    }
    return null;
  };

  const sizeClasses = size === 'sm'
    ? 'py-1.5 px-2.5 text-xs'
    : 'py-2.5 px-3.5 text-sm';

  return (
    <div className="relative inline-block w-full" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            const idx = normalizedOptions.findIndex((opt) => String(opt.value) === String(value));
            setHighlightedIndex(idx >= 0 ? idx : 0);
          }
        }}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full flex items-center justify-between gap-2 rounded-lg border border-white/[0.09] bg-[#121526] ${sizeClasses} text-slate-200 text-left transition-all hover:border-white/[0.18] hover:bg-[#15192e] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 focus:outline-none ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${className}`}
      >
        <span className="flex items-center gap-2 truncate">
          {selectedOption?.avatar ? (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-[10px] font-bold text-violet-300 ring-1 ring-white/15">
              {selectedOption.avatar}
            </span>
          ) : (
            selectedOption && renderIndicator(selectedOption.value)
          )}
          <span className={selectedOption ? 'text-slate-100 font-medium truncate' : 'text-slate-500 truncate'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.sublabel && (
            <span className="text-slate-500 text-xs truncate hidden sm:inline">
              {selectedOption.sublabel}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-violet-400' : ''
          }`}
        />
      </button>

      {/* Dropdown Options Popup */}
      {isOpen && (
        <div
          role="listbox"
          className={`absolute ${
            align === 'right' ? 'right-0' : 'left-0'
          } mt-1.5 w-full min-w-[180px] max-h-60 overflow-y-auto rounded-xl border border-white/[0.12] bg-[#15192e] p-1 shadow-2xl z-50 animate-scale-in outline-none`}
        >
          {normalizedOptions.map((opt, index) => {
            const isSelected = String(opt.value) === String(value);
            const isHighlighted = highlightedIndex === index;

            return (
              <div
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setHighlightedIndex(index)}
                onClick={() => handleSelect(opt.value)}
                className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-xs font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-violet-600/25 text-violet-200 font-semibold'
                    : isHighlighted
                    ? 'bg-white/[0.07] text-slate-100'
                    : 'text-slate-300 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {opt.avatar ? (
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-violet-600/30 text-[10px] font-bold text-violet-300 ring-1 ring-white/15">
                      {opt.avatar}
                    </span>
                  ) : (
                    renderIndicator(opt.value)
                  )}
                  <div className="flex flex-col truncate text-left">
                    <span className="truncate">{opt.label}</span>
                    {opt.sublabel && (
                      <span className="text-[10px] text-slate-400 truncate">{opt.sublabel}</span>
                    )}
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
