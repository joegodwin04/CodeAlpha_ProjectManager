import React from 'react';
import { Inbox } from 'lucide-react';

const EmptyState = ({ icon: Icon = Inbox, title, description, action }) => {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-surface px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.06]">
        <Icon className="h-7 w-7 text-slate-500" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-200">{title}</h3>
      {description && (
        <p className="mt-1.5 text-sm text-slate-500 max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};

export default EmptyState;
