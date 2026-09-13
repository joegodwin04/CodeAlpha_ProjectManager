import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, CheckSquare, User, LogOut, X, Zap,
  Plus, ShieldCheck, TrendingUp, Eye, LogIn, UserPlus, Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { GUEST_STATS } from '../data/guestDemoData';

const workspaceNav = [
  { name: 'Dashboard', href: '/',         icon: LayoutDashboard },
  { name: 'Projects',  href: '/projects', icon: FolderKanban },
  { name: 'Tasks',     href: '/tasks',    icon: CheckSquare },
];

const accountNav = [
  { name: 'Profile',           href: '/profile',              tab: 'personal', icon: User },
  { name: 'Security Settings', href: '/profile?tab=security', tab: 'security', icon: ShieldCheck },
];

const SidebarContent = ({ onNavClick }) => {
  const { user, logout, isGuest, exitGuestMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Guest mode: use static demo stats immediately; real users fetch from API
  const [stats, setStats] = useState(() => isGuest ? GUEST_STATS : null);

  useEffect(() => {
    // Authenticated mode only — fetch real workspace stats from the API
    if (isGuest) return; // static demo stats already set via state initialiser

    let isMounted = true;
    const fetchQuickStats = async () => {
      try {
        const { data } = await api.get('/users/dashboard');
        if (isMounted) {
          setStats(data);
        }
      } catch (err) {
        console.error('Sidebar stats fetch error:', err.message);
      }
    };

    fetchQuickStats();
    return () => { isMounted = false; };
  }, [isGuest]);

  const totalTasks      = stats?.tasks?.total     || 0;
  const completedTasks  = stats?.tasks?.completed || 0;
  const completionRate  = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeProjects  = stats?.projects?.active || 0;

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleExitGuest = () => {
    exitGuestMode();
    navigate('/login', { replace: true });
  };

  return (
    <div className="flex h-full flex-col bg-[#0e111d] border-r border-white/[0.07]">
      {/* Workspace Branding Header */}
      <div className="flex h-15 shrink-0 items-center justify-between px-4 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/25 ring-1 ring-white/20">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight truncate">ProjectManager</span>
              {isGuest ? (
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/25">
                  DEMO
                </span>
              ) : (
                <span className="text-[9px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  PRO
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {isGuest
                ? 'Guest Preview'
                : user?.name
                  ? `${user.name.split(' ')[0]}'s Workspace`
                  : 'Workspace'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Button */}
      <div className="px-3 pt-3.5 pb-1">
        {isGuest ? (
          /* Guest: disabled "New Project" — shows a locked variant */
          <button
            onClick={() => { onNavClick?.(); navigate('/login'); exitGuestMode(); }}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-white/[0.03] border border-white/[0.08] px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white/[0.06] hover:text-slate-400 transition-all cursor-pointer"
            title="Sign in to create projects"
          >
            <Lock className="h-3.5 w-3.5" />
            New Project
          </button>
        ) : (
          <Link
            to="/projects?new=true"
            onClick={onNavClick}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 px-3 py-2 text-xs font-semibold text-white shadow-md shadow-violet-600/20 border border-white/10 transition-all cursor-pointer hover:shadow-violet-600/30 hover:-translate-y-0.5"
          >
            <Plus className="h-3.5 w-3.5" />
            New Project
          </Link>
        )}
      </div>

      {/* Structured Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3.5 space-y-5">
        {/* Workspace Section */}
        <div>
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Workspace
          </p>
          <ul role="list" className="space-y-1">
            {workspaceNav.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  end={item.href === '/'}
                  onClick={onNavClick}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-sm'
                        : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? 'text-violet-400' : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{item.name}</span>
                      </div>
                      {item.name === 'Projects' && activeProjects > 0 && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-white/[0.06] text-slate-400 tabular-nums">
                          {activeProjects}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Account & Security Section — hidden for guests */}
        {!isGuest && (
          <div>
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Account &amp; Preferences
            </p>
            <ul role="list" className="space-y-1">
              {accountNav.map((item) => {
                const isItemActive = item.tab === 'security'
                  ? location.pathname === '/profile' && location.search.includes('tab=security')
                  : location.pathname === '/profile' && !location.search.includes('tab=security');

                return (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onClick={onNavClick}
                      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                        isItemActive
                          ? 'bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-sm'
                          : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 shrink-0 transition-colors ${
                          isItemActive
                            ? 'text-violet-400'
                            : 'text-slate-400 group-hover:text-slate-300'
                        }`}
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Workspace Productivity / Health Card */}
        {stats && (
          <div className="pt-2">
            <div className={`rounded-xl border p-3.5 space-y-2.5 ${isGuest ? 'border-amber-500/15 bg-amber-500/[0.03]' : 'border-white/[0.07] bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <TrendingUp className={`h-3.5 w-3.5 ${isGuest ? 'text-amber-400' : 'text-violet-400'}`} />
                  {isGuest ? 'Demo Stats' : 'Productivity'}
                </span>
                <span className={`font-bold tabular-nums text-xs ${isGuest ? 'text-amber-300' : 'text-violet-300'}`}>
                  {completionRate}%
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isGuest ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-gradient-to-r from-violet-500 to-emerald-400'}`}
                  style={{ width: `${completionRate}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>{activeProjects} active {activeProjects === 1 ? 'project' : 'projects'}</span>
                <span>{completedTasks}/{totalTasks} tasks</span>
              </div>
            </div>
          </div>
        )}

        {/* Guest CTA block */}
        {isGuest && (
          <div className="pt-1">
            <div className="rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-3.5 space-y-2.5">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                <p className="text-xs font-semibold text-violet-300">Guest Preview</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Create a free account to manage your own projects, tasks, and track real progress.
              </p>
              <div className="flex flex-col gap-1.5 pt-0.5">
                <Link
                  to="/register"
                  onClick={() => { exitGuestMode(); onNavClick?.(); }}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-all"
                >
                  <UserPlus className="h-3 w-3" />
                  Create Account
                </Link>
                <button
                  onClick={() => { handleExitGuest(); onNavClick?.(); }}
                  className="flex items-center justify-center gap-1.5 w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all"
                >
                  <LogIn className="h-3 w-3" />
                  Sign In
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* User Area + Logout Footer */}
      <div className="border-t border-white/[0.07] p-3">
        {isGuest ? (
          /* Guest footer */
          <div className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 bg-white/[0.02] border border-white/[0.05]">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 border border-amber-500/25 text-xs font-semibold text-amber-400">
              <Eye className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-300">Guest Preview</p>
              <p className="truncate text-[11px] text-slate-500">Demo mode — read only</p>
            </div>
          </div>
        ) : (
          /* Authenticated user footer */
          <>
            <Link
              to="/profile"
              onClick={onNavClick}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-white/[0.04] transition-colors group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-semibold text-white shadow-sm ring-1 ring-white/10">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-slate-200 group-hover:text-violet-300 transition-colors">
                  {user?.name}
                </p>
                <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <>
      {/* Mobile overlay + drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 flex w-72 animate-slide-in-left">
            <div className="relative flex w-full flex-col">
              <div className="absolute right-0 top-0 -mr-12 pt-4">
                <button
                  type="button"
                  className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors focus:outline-none"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <SidebarContent onNavClick={() => setSidebarOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <SidebarContent onNavClick={undefined} />
      </div>
    </>
  );
};

export default Sidebar;
