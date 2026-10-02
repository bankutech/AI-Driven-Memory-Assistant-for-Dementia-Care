import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, LogIn, PlayCircle, Users, HeartHandshake, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext.jsx';
import api from '../lib/api.js';
import { getLastUser, getPin, clearLastUser } from '../lib/session.js';

export default function Welcome() {
  const { setSession } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState(null); // null | 'patient' | 'caregiver'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  // Returning visitor: offer the saved PIN instead of a full sign in.
  const [lastUser, setLastUserState] = useState(() => getLastUser());
  const [pin, setPinValue] = useState('');
  const [pinError, setPinError] = useState('');

  const go = (user, m) => {
    setSession(user, m);
    navigate(m === 'caregiver' ? '/caregiver' : '/dashboard');
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setBusy(true);
    try {
      const user = await api.post('/api/login', { email, password });
      go(user, user.role === 'caregiver' ? 'caregiver' : 'patient');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const demoMode = () => {
    go({ name: 'Arun Kumar', role: 'patient', email: 'arun@demo.com' }, 'demo');
  };

  const useAnotherAccount = () => {
    clearLastUser();
    setLastUserState(null);
    setPin('');
    setPinError('');
  };

  const unlockWithPin = e => {
    e.preventDefault();
    if (pin !== getPin()) {
      setPinError('That PIN does not match. Try again, or sign in with email.');
      setPinValue('');
      return;
    }
    go(lastUser, lastUser.role === 'caregiver' ? 'caregiver' : 'patient');
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-nyala-bg font-sans">
      {/* Left: branding panel */}
      <div className="flex flex-col justify-between bg-nyala-primary p-12 text-white lg:w-1/2 lg:p-[150px] opacity-0 animate-slide-up">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center bg-white/10 rounded-sm border border-white/20">
            <Brain size={32} aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-display font-bold leading-tight tracking-tight">Memory Assistant</p>
            <p className="text-sm text-blue-200 mt-1 uppercase tracking-widest font-semibold">Dementia Care Support</p>
          </div>
        </div>

        <div className="my-16 lg:my-0 opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <h1 className="max-w-xl text-5xl font-display font-bold leading-tight lg:text-6xl lg:leading-tight">
            Helping you remember the people, places, and moments that matter.
          </h1>
          <ul className="mt-12 space-y-6 text-blue-50 text-lg">
            <li className="flex items-start gap-4">
              <Users className="mt-1 shrink-0 text-blue-300" size={24} aria-hidden="true" />
              Recognise familiar faces and stay connected with important people.
            </li>
            <li className="flex items-start gap-4">
              <Brain className="mt-1 shrink-0 text-blue-300" size={24} aria-hidden="true" />
              Keep memories, routines and appointments in one calm place.
            </li>
            <li className="flex items-start gap-4">
              <HeartHandshake className="mt-1 shrink-0 text-blue-300" size={24} aria-hidden="true" />
              Gentle reminders and support for caregivers - never a medical diagnosis.
            </li>
          </ul>
        </div>

        <p className="max-w-md text-sm leading-relaxed text-blue-200 border-l-2 border-blue-400 pl-4 py-1 opacity-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          This prototype is designed for memory assistance and caregiver support. It is not a medical
          diagnostic or treatment system.
        </p>
      </div>

      {/* Right: login options */}
      <div className="flex flex-1 items-center justify-center p-8 sm:p-12 lg:p-[150px] bg-white opacity-0 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="w-full max-w-md">
          {lastUser && !mode && (
            <form onSubmit={unlockWithPin} className="border border-nyala-gray bg-white mb-8 p-10 text-center rounded-sm shadow-sm">
              <span className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-nyala-primary text-nyala-primary rounded-full mb-6">
                <KeyRound size={28} aria-hidden="true" />
              </span>
              <h2 className="text-2xl font-display font-bold text-nyala-text">Welcome back, {lastUser.name?.split(' ')[0] || 'friend'}</h2>
              <p className="mt-2 text-base text-slate-500">
                Enter your 4-digit quick PIN, or sign in with your email below.
              </p>
              <label className="label mt-8 block text-left" htmlFor="quick-pin">Quick PIN</label>
              <input
                id="quick-pin"
                className="input text-center text-3xl tracking-[0.5em] font-mono py-4 rounded-sm"
                value={pin}
                onChange={e => setPinValue(e.target.value.replace(/\D/g, '').slice(0, 4))}
                inputMode="numeric"
                maxLength={4}
                placeholder="****"
                autoComplete="off"
              />
              {pinError && <p className="mt-4 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 border border-red-200 rounded-sm">{pinError}</p>}
              <button type="submit" className="btn-primary mt-6 w-full py-4 text-lg">
                <KeyRound size={20} /> Unlock
              </button>
              <p className="mt-6 text-sm text-slate-500">
                Default demo PIN <b>1234</b> - change it any time under Profile.
              </p>
              <button type="button" onClick={useAnotherAccount} className="mt-4 text-sm font-semibold text-nyala-primary hover:text-[#093a82] underline underline-offset-4">
                Sign in with another account
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              className={`border p-6 text-left transition-colors duration-200 rounded-sm ${mode === 'patient' ? 'border-nyala-primary bg-blue-50/50' : 'border-nyala-gray hover:border-nyala-primary bg-white'}`}
              onClick={() => setMode('patient')}
            >
              <Users size={28} className="text-nyala-primary mb-4" aria-hidden="true" />
              <p className="text-xl font-display font-bold text-nyala-text">Patient</p>
              <p className="mt-1 text-sm text-slate-500">For the person receiving care</p>
            </button>
            <button
              className={`border p-6 text-left transition-colors duration-200 rounded-sm ${mode === 'caregiver' ? 'border-nyala-primary bg-blue-50/50' : 'border-nyala-gray hover:border-nyala-primary bg-white'}`}
              onClick={() => setMode('caregiver')}
            >
              <HeartHandshake size={28} className="text-green-600 mb-4" aria-hidden="true" />
              <p className="text-xl font-display font-bold text-nyala-text">Caregiver</p>
              <p className="mt-1 text-sm text-slate-500">For family & carers</p>
            </button>
          </div>

          {mode && (
            <form onSubmit={submit} className="border border-nyala-gray border-t-0 bg-white space-y-5 p-8 shadow-sm rounded-b-sm">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={mode === 'patient' ? 'arun@demo.com' : 'meera@demo.com'}
                  autoComplete="username"
                />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="demo123"
                  autoComplete="current-password"
                />
              </div>
              {error && <p className="bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 border border-red-200">{error}</p>}
              <button type="submit" className="btn-primary w-full py-4 text-lg" disabled={busy}>
                <LogIn size={20} /> {busy ? 'Signing in...' : 'Sign in'}
              </button>
              <p className="text-center text-sm text-slate-500 mt-4 border-t border-slate-100 pt-4">
                Demo patient: <b className="text-slate-800">arun@demo.com</b><br/>Demo caregiver: <b className="text-slate-800">meera@demo.com</b><br/>Password: <b className="text-slate-800">demo123</b>
              </p>
            </form>
          )}

          <div className="mt-12 text-center">
            <span className="block text-xs uppercase tracking-widest font-semibold text-slate-400 mb-4">Or try without account</span>
            <button
              onClick={demoMode}
              className="btn-secondary w-full py-4 text-lg border-2 border-nyala-primary text-nyala-primary hover:bg-nyala-primary hover:text-white"
            >
              <PlayCircle size={22} /> Enter Demo Mode
            </button>
            <p className="mt-3 text-sm text-slate-500">
              Demo Mode opens the app instantly - no account needed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
