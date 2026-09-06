import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, LogOut, User, Search, Bell } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const pageTitles = {
  '/':         'Dashboard',
  '/projects': 'Projects',
  '/tasks':    'Tasks',
  '/profile':  'Profile',
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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-x-4 border-b border-white/[0.06] bg-bg-secondary/80 backdrop-blur-xl px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2 p-2 text-slate-500 hover:text-slate-300 lg:hidden transition-colors"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Mobile separator */}
      <div className="h-5 w-px bg-white/[0.08] lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-sm font-semibold text-slate-200 lg:text-base">{pageTitle}</h1>

        <div className="flex items-center gap-2">
          {/* Search hint */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg bg-white/[0.04] border border-white/[0.06] px-3 py-1.5 text-xs text-slate-500 cursor-default">
            <Search className="h-3.5 w-3.5" />
            <span>Search…</span>
          </div>

          {/* Notifications */}
          <button className="relative rounded-lg p-2 text-slate-500 hover:bg-white/[0.04] hover:text-slate-300 transition-colors">
            <Bell className="h-4.5 w-4.5" />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition-colors focus:outline-none"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-semibold text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-300">
                {user?.name}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-surface border border-white/[0.08] py-1 shadow-2xl z-50 animate-scale-in">
                <div className="px-4 py-3 border-b border-white/[0.06]">
                  <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 hover:bg-white/[0.04] hover:text-slate-200 transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <div className="border-t border-white/[0.06] mt-1 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
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
