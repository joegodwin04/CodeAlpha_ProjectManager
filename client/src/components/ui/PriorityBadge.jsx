import React from 'react';
import { ArrowUp, ArrowRight, ArrowDown } from 'lucide-react';

const priorityConfig = {
  High:   { bg: 'bg-red-50',    text: 'text-red-700',    icon: ArrowUp },
  Medium: { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: ArrowRight },
  Low:    { bg: 'bg-blue-50',   text: 'text-blue-700',   icon: ArrowDown },
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
