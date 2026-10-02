import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-slate-400">
      <span className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-nyala-primary" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      {Icon && <Icon size={40} className="text-slate-300" aria-hidden="true" />}
      <p className="text-lg font-bold text-slate-700">{title}</p>
      {subtitle && <p className="max-w-sm text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="card border-red-200 p-6 text-center">
      <p className="font-bold text-red-700">Something went wrong</p>
      <p className="mt-1 text-sm text-red-600">{message}</p>
      {onRetry && (
        <button className="btn-secondary mt-4" onClick={onRetry}>Try again</button>
      )}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = e => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className={`card relative max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} overflow-y-auto p-6 shadow-xl`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="text-slate-600">{message}</p>
      <div className="mt-6 flex justify-end gap-3">
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
        <button className="btn bg-red-600 text-white hover:bg-red-700" onClick={onConfirm}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}
