import React from 'react';
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

const priorityConfig = {
  High:   { bg: 'bg-rose-500/10 border-rose-500/25',   text: 'text-rose-400',   icon: ArrowUp },
  Medium: { bg: 'bg-amber-500/10 border-amber-500/25', text: 'text-amber-400', icon: ArrowRight },
  Low:    { bg: 'bg-cyan-500/10 border-cyan-500/25',   text: 'text-cyan-400',   icon: ArrowDown },
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.Medium;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tracking-tight ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {priority}
    </span>
  );
};

export default PriorityBadge;
