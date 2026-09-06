import React from 'react';

const statusConfig = {
  // Project statuses
  Planning:   { bg: 'bg-slate-500/15', text: 'text-slate-300',   dot: 'bg-slate-400' },
  Active:     { bg: 'bg-blue-500/15',  text: 'text-blue-400',    dot: 'bg-blue-400' },
  'On Hold':  { bg: 'bg-amber-500/15', text: 'text-amber-400',   dot: 'bg-amber-400' },
  Completed:  { bg: 'bg-emerald-500/15', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  // Task statuses
  Todo:          { bg: 'bg-slate-500/15',   text: 'text-slate-300',   dot: 'bg-slate-400' },
  'In Progress': { bg: 'bg-blue-500/15',    text: 'text-blue-400',    dot: 'bg-blue-400' },
  Done:          { bg: 'bg-emerald-500/15',  text: 'text-emerald-400', dot: 'bg-emerald-400' },
};

const StatusBadge = ({ status }) => {
  const config = statusConfig[status] || statusConfig.Planning;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
};

export default StatusBadge;
