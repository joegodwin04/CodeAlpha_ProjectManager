import React from 'react';

const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3" role="status" aria-label={text}>
      <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-slate-200 border-t-indigo-500" />
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
