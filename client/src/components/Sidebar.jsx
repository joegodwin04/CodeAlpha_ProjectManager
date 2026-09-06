import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, User, LogOut, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', href: '/',         icon: LayoutDashboard },
  { name: 'Projects',  href: '/projects', icon: FolderKanban },
  { name: 'Tasks',     href: '/tasks',    icon: CheckSquare },
  { name: 'Profile',   href: '/profile',  icon: User },
];

const SidebarContent = ({ onNavClick }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-bg-secondary border-r border-white/[0.06]">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5 border-b border-white/[0.06]">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-base font-bold text-white tracking-tight">ProjectManager</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Menu</p>
        <ul role="list" className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.href}
                end={item.href === '/'}
                onClick={onNavClick}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-violet-500/15 text-violet-400 border-l-2 border-violet-500 ml-0'
                      : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`h-[18px] w-[18px] shrink-0 transition-colors ${
                        isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* User area + Logout */}
      <div className="border-t border-white/[0.06] px-3 py-3">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-sm font-semibold text-white">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-200">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
          Log out
        </button>
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-72 animate-slide-in-left">
            <div className="relative flex w-full flex-col">
              <div className="absolute right-0 top-0 -mr-12 pt-4">
                <button
                  type="button"
                  className="ml-1 flex h-9 w-9 items-center justify-center rounded-full text-white hover:bg-white/10 transition-colors"
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
