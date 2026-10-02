import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function ToastHost() {
  const { toasts } = useApp();
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" role="status" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className="card border-l-4 border-l-brand-500 p-4 shadow-lg">
          <p className="font-bold text-slate-800">{t.title}</p>
          {t.body && <p className="mt-0.5 text-sm text-slate-600">{t.body}</p>}
        </div>
      ))}
    </div>
  );
}
