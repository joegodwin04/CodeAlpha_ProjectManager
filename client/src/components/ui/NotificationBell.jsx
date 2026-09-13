import React, { useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, MessageSquare, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import useNotifications from '../../hooks/useNotifications';

const typeIcon = (type) => {
  if (type === 'comment_added') return <MessageSquare className="h-3.5 w-3.5 text-violet-400" />;
  return <Zap className="h-3.5 w-3.5 text-amber-400" />;
};

/**
 * NotificationBell
 * Shows an animated bell with unread badge; clicking opens a dropdown
 * that lists recent notifications with mark-read / delete actions.
 *
 * Props:
 *  userId – authenticated user id (null/undefined in guest mode)
 */
const NotificationBell = ({ userId }) => {
  const [open, setOpen] = React.useState(false);
  const ref = useRef(null);

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications(userId);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        id="notification-bell-btn"
        type="button"
        onClick={handleOpen}
        className="relative rounded-lg p-2 text-slate-400 hover:bg-white/[0.05] hover:text-slate-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <Bell className={`h-4 w-4 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500 ring-2 ring-[#0b0d14]" />
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          id="notification-dropdown"
          className="absolute right-0 mt-2 w-80 rounded-xl bg-[#141728] border border-white/[0.1] shadow-2xl z-50 animate-scale-in overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.07]">
            <span className="text-xs font-semibold text-slate-200">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-[10px] font-medium text-violet-400 hover:text-violet-300 transition-colors"
              >
                <CheckCheck className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <ul className="max-h-72 overflow-y-auto divide-y divide-white/[0.04] custom-scrollbar">
            {notifications.length === 0 ? (
              <li className="py-8 text-center text-xs text-slate-500">
                You're all caught up 🎉
              </li>
            ) : (
              notifications.map((n) => (
                <li
                  key={n.id}
                  className={`group flex items-start gap-3 px-4 py-3 transition-colors ${
                    !n.read ? 'bg-violet-500/[0.04]' : ''
                  } hover:bg-white/[0.03]`}
                >
                  {/* Unread dot */}
                  <div className="mt-0.5 flex-shrink-0 flex items-center gap-2">
                    {typeIcon(n.type)}
                    {!n.read && (
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400 flex-shrink-0" />
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => !n.read && markAsRead(n.id)}
                  >
                    <p className={`text-xs leading-relaxed ${n.read ? 'text-slate-400' : 'text-slate-200 font-medium'}`}>
                      {n.message}
                    </p>
                    <p className="mt-0.5 text-[10px] text-slate-500">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={() => deleteNotification(n.id)}
                    className="opacity-0 group-hover:opacity-100 flex-shrink-0 rounded p-1 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                    title="Dismiss"
                    aria-label="Dismiss notification"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
