import React, { useEffect } from 'react';

export type ToastKind = 'info' | 'success' | 'error';

export const Toast: React.FC<{ message: string; kind?: ToastKind; onClose: () => void }>
  = ({ message, kind = 'info', onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);
  const bg = kind === 'error' ? 'bg-red-600' : kind === 'success' ? 'bg-green-600' : 'bg-gray-800';
  return (
    <div className={`fixed top-4 right-4 z-50 text-white px-4 py-2 rounded shadow ${bg}`}>
      <div className="flex items-start gap-3">
        <span className="text-sm">{message}</span>
        <button onClick={onClose} aria-label="Close" className="text-white/80 hover:text-white">×</button>
      </div>
    </div>
  );
};

