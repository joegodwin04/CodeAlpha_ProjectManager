import React from 'react';

const statusConfig = {
  // Project statuses
  Planning:   { bg: 'bg-slate-100',  text: 'text-slate-700',  dot: 'bg-slate-400' },
  Active:     { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  'On Hold':  { bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-500' },
  Completed:  { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  // Task statuses
  Todo:          { bg: 'bg-slate-100',  text: 'text-slate-700',  dot: 'bg-slate-400' },
  'In Progress': { bg: 'bg-blue-50',    text: 'text-blue-700',   dot: 'bg-blue-500' },
  Done:          { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
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
