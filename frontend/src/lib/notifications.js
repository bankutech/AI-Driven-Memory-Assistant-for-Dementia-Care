import { useEffect } from 'react';

// Fires browser notifications for due reminders; falls back to in-app toasts.
// Reminder shape: { id, title, date, time, completed }
export function useReminderNotifications(reminders, notify) {
  useEffect(() => {
    if (!reminders || reminders.length === 0) return undefined;

    const firedKey = 'ma_fired_reminders';
    let fired = {};
    try {
      fired = JSON.parse(localStorage.getItem(firedKey) || '{}');
    } catch {
      fired = {};
    }

    const tick = () => {
      const now = new Date();
      let changed = false;
      reminders.forEach(r => {
        if (r.completed || fired[r.id]) return;
        const due = new Date(`${r.date}T${r.time || '09:00'}:00`);
        const diff = now - due;
        if (diff >= 0 && diff < 60_000) {
          fired[r.id] = true;
          changed = true;
          const title = `Reminder: ${r.title}`;
          if ('Notification' in window && Notification.permission === 'granted') {
            try {
              new Notification(title, { body: r.description || 'You have a reminder due now.' });
            } catch {
              notify(title, r.description);
            }
          } else {
            notify(title, r.description);
          }
        }
      });
      if (changed) localStorage.setItem(firedKey, JSON.stringify(fired));
    };

    tick();
    const interval = setInterval(tick, 15_000);
    return () => clearInterval(interval);
  }, [reminders, notify]);
}

// Ask for notification permission (call from a user gesture).
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'default') {
    try {
      return await Notification.requestPermission();
    } catch {
      return 'denied';
    }
  }
  return Notification.permission;
}

export default useReminderNotifications;
