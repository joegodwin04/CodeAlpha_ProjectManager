import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User, Search, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const pageTitles = {
  '/':         'Dashboard',
  '/projects': 'Projects',
  '/tasks':    'Tasks',
  '/profile':  'Settings',
};

const Navbar = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  let pageTitle = pageTitles[location.pathname] || 'Project Details';

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-x-4 border-b border-white/[0.07] bg-[#0b0d14]/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2 p-2 text-slate-400 hover:text-slate-200 lg:hidden transition-colors rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Mobile separator */}
      <div className="h-5 w-px bg-white/[0.08] lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-sm font-semibold text-slate-100 lg:text-base tracking-tight">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search hint badge */}
          <div className="hidden sm:flex items-center gap-2.5 rounded-lg bg-white/[0.03] border border-white/[0.07] px-3 py-1.5 text-xs text-slate-400 hover:border-white/[0.12] transition-colors cursor-default">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-slate-400">Quick search…</span>
            <kbd className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium text-slate-400 border border-white/[0.08]">
              ⌘K
            </kbd>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative rounded-lg p-2 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            aria-label="Notifications"
          >
            <Bell className="h-4.5 w-4.5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-violet-500 ring-2 ring-[#0b0d14]" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-white/[0.04] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 cursor-pointer"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-semibold text-white shadow-sm ring-1 ring-white/20">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-xs font-medium text-slate-200 max-w-[120px] truncate">
                {user?.name}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#141728] border border-white/[0.1] py-1.5 shadow-2xl z-50 animate-scale-in">
                <div className="px-4 py-2.5 border-b border-white/[0.06]">
                  <p className="text-sm font-semibold text-slate-100 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 rounded bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
                    Pro Workspace
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors"
                  >
                    <User className="h-4 w-4 text-slate-400" />
                    Account & Settings
                  </Link>
                </div>
                <div className="border-t border-white/[0.06] pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
