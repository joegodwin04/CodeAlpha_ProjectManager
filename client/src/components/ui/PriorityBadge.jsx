import React from 'react';
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

const priorityConfig = {
  High:   { bg: 'bg-red-500/15',    text: 'text-red-400',    icon: ArrowUp },
  Medium: { bg: 'bg-amber-500/15',  text: 'text-amber-400',  icon: ArrowRight },
  Low:    { bg: 'bg-cyan-500/15',   text: 'text-cyan-400',   icon: ArrowDown },
};

const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.Medium;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${config.bg} ${config.text}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {priority}
    </span>
  );
};

export default PriorityBadge;
