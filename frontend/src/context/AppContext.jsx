import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getSession, setSession as persistSession, clearSession, setLastUser } from '../lib/session.js';
import { useReminderNotifications } from '../lib/notifications.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [session, setSessionState] = useState(() => getSession());
  const [toasts, setToasts] = useState([]);
  const [reminders, setReminders] = useState([]);

  const notify = useCallback((title, body) => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, title, body }]);
    setTimeout(() => {
      setToasts(t => t.filter(x => x.id !== id));
    }, 6000);
  }, []);

  const setSession = useCallback((user, mode) => {
    persistSession(user, mode);
    setSessionState({ user, mode, token: undefined });
  }, []);

  const logout = useCallback(() => {
    // Remember who signed out so the welcome screen can offer a quick PIN unlock.
    const current = getSession();
    if (current?.user) setLastUser(current.user);
    clearSession();
    setSessionState(null);
  }, []);

  // Poll reminders so due items can fire notifications.
  useEffect(() => {
    let active = true;
    const load = () => {
      fetch('/api/reminders')
        .then(r => (r.ok ? r.json() : []))
        .then(data => {
          if (active) setReminders(data);
        })
        .catch(() => {});
    };
    load();
    const interval = setInterval(load, 60_000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Fire browser notifications (or in-app toasts as fallback) when due.
  useReminderNotifications(reminders, notify);

  const value = useMemo(
    () => ({ session, setSession, logout, toasts, notify }),
    [session, setSession, logout, toasts, notify]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export default AppContext;
