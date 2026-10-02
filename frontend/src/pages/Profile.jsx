import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, KeyRound, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { getPin, setPin } from '../lib/session.js';

export default function Profile() {
  const { session, logout, notify } = useApp();
  const navigate = useNavigate();
  const user = session?.user || { name: 'Demo User', role: 'patient' };
  const [pin, setPinState] = useState(getPin());
  const [error, setError] = useState('');

  const savePin = e => {
    e.preventDefault();
    if (!/^\d{4}$/.test(pin)) {
      setError('PIN must be exactly 4 digits.');
      return;
    }
    setError('');
    setPin(pin);
    notify('PIN updated', 'Your demo quick-unlock PIN was saved.');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <header className="card flex items-center gap-4 p-6">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          <UserCircle size={44} aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">{user.name}</h1>
          <p className="font-semibold capitalize text-brand-600">{user.role}</p>
          <p className="text-slate-500">{user.email || 'Demo mode - no account'}</p>
        </div>
      </header>

      <section className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800"><KeyRound size={18} className="text-brand-600" /> Quick PIN (demo)</h2>
        <p className="mb-3 text-sm text-slate-500">Prototype-only setting. The PIN is stored in this browser and is not real security.</p>
        <form className="flex flex-wrap items-end gap-3" onSubmit={savePin}>
          <div>
            <label className="label" htmlFor="pin">4-digit PIN</label>
            <input
              id="pin"
              className="input w-32 text-center text-xl tracking-[0.3em]"
              value={pin}
              onChange={e => setPinState(e.target.value.replace(/\D/g, '').slice(0, 4))}
              inputMode="numeric"
              maxLength={4}
            />
          </div>
          <button type="submit" className="btn-primary">Save PIN</button>
        </form>
        {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}
      </section>

      <section className="card p-5">
        <button
          className="btn-danger"
          onClick={() => { logout(); navigate('/'); }}
        >
          <LogOut size={16} /> Sign out
        </button>
      </section>
    </div>
  );
}
