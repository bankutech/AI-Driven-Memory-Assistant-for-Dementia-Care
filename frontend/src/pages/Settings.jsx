import React, { useState } from 'react';
import { Bell, Database, Info, RefreshCw, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import { requestNotificationPermission } from '../lib/notifications.js';
import { ConfirmDialog } from '../components/ui.jsx';

export default function Settings() {
  const { session, notify } = useApp();
  const [notifState, setNotifState] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [resetting, setResetting] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const enableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifState(result);
    if (result === 'granted') notify('Notifications enabled', 'Reminder alerts will appear in this browser.');
    else if (result === 'denied') notify('Notifications blocked', 'You can allow them later from browser settings.');
  };

  const reseed = async () => {
    setConfirmReset(false);
    setResetting(true);
    try {
      const res = await fetch('/api/reseed', { method: 'POST' });
      if (!res.ok) throw new Error(`Reseed failed (${res.status})`);
      notify('Demo data restored', 'The database was reset to the original demo data.');
    } catch (err) {
      notify('Could not reset data', err.message);
    } finally {
      setResetting(false);
    }
  };

  const user = session?.user || {};

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <header>
        <h1 className="text-3xl font-extrabold text-slate-800">Settings</h1>
        <p className="mt-1 text-slate-500">Preferences, data tools and app information.</p>
      </header>

      {/* Profile */}
      <section className="card p-5">
        <h2 className="mb-3 font-bold text-slate-800">Profile</h2>
        <dl className="grid gap-3 sm:grid-cols-2">
          <div><dt className="text-sm font-semibold text-slate-500">Name</dt><dd className="text-lg font-bold text-slate-800">{user.name}</dd></div>
          <div><dt className="text-sm font-semibold text-slate-500">Role</dt><dd className="text-lg font-bold text-slate-800 capitalize">{user.role || 'demo'}</dd></div>
          <div><dt className="text-sm font-semibold text-slate-500">Email</dt><dd className="text-lg font-bold text-slate-800">{user.email || '-'}</dd></div>
          <div><dt className="text-sm font-semibold text-slate-500">Mode</dt><dd className="text-lg font-bold capitalize text-slate-800">{session?.mode || 'demo'}</dd></div>
        </dl>
      </section>

      {/* Notifications */}
      <section className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800"><Bell size={18} className="text-brand-600" /> Notifications</h2>
        <p className="mb-3 text-slate-600">
          Status:{' '}
          <b className="capitalize">
            {notifState === 'granted' ? 'Enabled'
              : notifState === 'denied' ? 'Blocked'
              : notifState === 'unsupported' ? 'Not supported - in-app alerts will be used'
              : 'Not enabled'}
          </b>
        </p>
        {notifState === 'default' && (
          <button className="btn-primary" onClick={enableNotifications}>Enable browser notifications</button>
        )}
        {notifState === 'granted' && (
          <button
            className="btn-secondary"
            onClick={() => new Notification('Memory Assistant', { body: 'This is what a reminder alert looks like.' })}
          >
            Send test notification
          </button>
        )}
      </section>

      {/* Data tools */}
      <section className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800"><Database size={18} className="text-brand-600" /> Data</h2>
        <p className="mb-3 text-slate-600">
          Restore the original demo data. This clears any memories, reminders or people you added during the demo.
        </p>
        <button className="btn-danger" onClick={() => setConfirmReset(true)} disabled={resetting}>
          <RefreshCw size={16} className={resetting ? 'animate-spin' : ''} /> {resetting ? 'Restoring...' : 'Reset demo data'}
        </button>

        <ConfirmDialog
          open={confirmReset}
          title="Reset demo data"
          message="This replaces the current memories, people, reminders, routines, contacts and events with the original demo data. Anything you added during the demo will be removed."
          confirmLabel="Reset demo data"
          onConfirm={reseed}
          onCancel={() => setConfirmReset(false)}
        />
      </section>

      {/* About + disclaimer */}
      <section className="card p-5">
        <h2 className="mb-3 flex items-center gap-2 font-bold text-slate-800"><Info size={18} className="text-brand-600" /> About</h2>
        <p className="text-slate-600">
          <b>AI-Driven Memory Assistant for Dementia Care</b> - a supportive memory-assistance prototype
          (college demonstration project). Version 1.0.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-brand-50 p-4 text-sm leading-relaxed text-brand-800">
          <ShieldCheck size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>
            <b>Safety notice:</b> This prototype is designed for memory assistance and caregiver support.
            It is not a medical diagnostic or treatment system.
          </p>
        </div>
      </section>
    </div>
  );
}
