import React, { useCallback, useEffect, useState } from 'react';
import { Bell, Plus, Pencil, Trash2, Check, Circle, CalendarOff } from 'lucide-react';
import api from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Spinner, ErrorState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { fmtTime, fmtDate, todayStr, relDay } from '../lib/format.js';
import { requestNotificationPermission } from '../lib/notifications.js';
import { useDeepLinkOpen } from '../lib/useDeepLinkOpen.js';

const emptyForm = { title: '', description: '', date: todayStr(), time: '09:00', priority: 'Normal', completed: false };

export default function Reminders() {
  const { notify } = useApp();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All'); // Upcoming | Today | Done | All
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [notifState, setNotifState] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    api.get('/api/reminders')
      .then(setReminders)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  useDeepLinkOpen(openAdd);

  const openEdit = r => {
    setEditing(r);
    setForm({
      title: r.title || '',
      description: r.description || '',
      date: r.date || todayStr(),
      time: r.time || '09:00',
      priority: r.priority || 'Normal',
      completed: !!r.completed
    });
    setFormError('');
    setModalOpen(true);
  };

  const save = async e => {
    e.preventDefault();
    if (!form.title.trim()) { setFormError('Please give the reminder a title.'); return; }
    if (!form.date) { setFormError('Please choose a date.'); return; }
    if (!form.time) { setFormError('Please choose a time.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editing) {
        const updated = await api.put(`/api/reminders/${editing.id}`, form);
        setReminders(rs => rs.map(x => (x.id === updated.id ? updated : x)));
        notify('Reminder updated', `${updated.title} was saved.`);
      } else {
        const created = await api.post('/api/reminders', form);
        setReminders(rs => [...rs, created]);
        notify('Reminder added', `${created.title} on ${relDay(created.date)} at ${fmtTime(created.time)}.`);
      }
      setModalOpen(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggle = async r => {
    try {
      const updated = await api.put(`/api/reminders/${r.id}`, { completed: !r.completed });
      setReminders(rs => rs.map(x => (x.id === updated.id ? updated : x)));
    } catch (err) {
      notify('Could not update reminder', err.message);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await api.del(`/api/reminders/${deleting.id}`);
      setReminders(rs => rs.filter(x => x.id !== deleting.id));
      notify('Reminder deleted', `"${deleting.title}" was removed.`);
    } catch (err) {
      notify('Could not delete reminder', err.message);
    } finally {
      setDeleting(null);
    }
  };

  const enableNotifications = async () => {
    const result = await requestNotificationPermission();
    setNotifState(result);
    if (result === 'granted') notify('Notifications enabled', 'You will get browser alerts when reminders are due.');
    else if (result === 'unsupported') notify('Notifications unavailable', 'In-app alerts will be shown instead.');
    else notify('Notifications blocked', 'In-app alerts will be shown instead.');
  };

  const today = todayStr();
  
  // Sort items: incomplete first (sorted by date/time), then completed (sorted by date/time)
  const visible = reminders
    .filter(r => {
      if (filter === 'Today') return r.date === today;
      if (filter === 'Upcoming') return r.date >= today && !r.completed;
      if (filter === 'Done') return !!r.completed;
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (a.date + a.time).localeCompare(b.date + b.time);
    });

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-2">Reminders</h1>
          <p className="text-xl text-slate-600">Your to-do list and important tasks.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          {notifState !== 'granted' && notifState !== 'unsupported' && (
            <button className="bg-white border-2 border-nyala-primary text-nyala-primary font-bold text-lg px-6 py-3 rounded-sm flex items-center hover:bg-blue-50 transition-colors" onClick={enableNotifications}>
              <Bell size={24} className="mr-2" /> Enable notifications
            </button>
          )}
          <button className="btn-primary text-lg px-6 py-3 flex items-center" onClick={openAdd}>
            <Plus size={24} className="mr-2" /> Add Task
          </button>
        </div>
      </header>

      {notifState === 'unsupported' && (
        <p className="mb-8 border border-amber-200 bg-amber-50 p-4 text-lg font-bold text-amber-800 rounded-sm">
          Browser notifications aren't available here - in-app alerts will be shown instead.
        </p>
      )}

      <div className="flex gap-4 mb-8 border-b-2 border-slate-200 overflow-x-auto scrollbar-hide pb-1">
        {['All', 'Today', 'Upcoming', 'Done'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-6 py-3 text-xl font-bold break-words whitespace-nowrap transition-colors border-b-4 -mb-1.5 ${
              filter === f ? 'border-nyala-primary text-nyala-primary' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <Spinner label="Loading tasks..." />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : visible.length === 0 ? (
        <div className="bg-white border border-slate-200 p-12 text-center rounded-sm">
          <p className="text-2xl font-bold break-words text-slate-700 mb-2">{filter === 'Done' ? 'No completed tasks' : 'No tasks here'}</p>
          <p className="text-lg text-slate-500">Enjoy your free time, or add a new task.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map(r => (
            <li key={r.id} className={`flex items-start md:items-center gap-6 p-6 rounded-sm border transition-colors ${r.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-300 shadow-sm hover:border-nyala-primary'}`}>
              <button 
                onClick={() => toggle(r)} 
                className="shrink-0 mt-1 md:mt-0"
                aria-label={r.completed ? `Mark ${r.title} as not done` : `Mark ${r.title} as done`}
              >
                {r.completed ? (
                  <Check size={40} className="text-nyala-primary" />
                ) : (
                  <Circle size={40} className="text-slate-300 hover:text-nyala-primary" />
                )}
              </button>
              
              <div className="min-w-0 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className={`text-2xl font-bold break-words ${r.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{r.title}</p>
                  {r.description && <p className="text-lg text-slate-600 mt-1">{r.description}</p>}
                </div>
                
                <div className={`shrink-0 flex flex-col md:items-end ${r.completed ? 'opacity-50' : ''}`}>
                  <p className="text-xl font-bold break-words text-nyala-primary">{relDay(r.date)}</p>
                  <p className="text-lg font-bold text-slate-600">{fmtTime(r.time)}</p>
                </div>
              </div>
              
              <div className="flex shrink-0 gap-2 mt-2 md:mt-0">
                <button className="p-3 text-slate-400 hover:text-nyala-primary bg-white rounded-sm border border-slate-200 hover:border-nyala-primary transition-colors" onClick={() => openEdit(r)} aria-label={`Edit ${r.title}`}>
                  <Pencil size={24} />
                </button>
                <button className="p-3 text-slate-400 hover:text-red-600 bg-white rounded-sm border border-slate-200 hover:border-red-600 transition-colors" onClick={() => setDeleting(r)} aria-label={`Delete ${r.title}`}>
                  <Trash2 size={24} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add/edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Task' : 'Add Task'}>
        <form onSubmit={save} className="space-y-6" noValidate>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="rem-title">What needs to be done? *</label>
            <input id="rem-title" className="input text-lg py-4" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Take evening medicine" />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="rem-desc">Notes</label>
            <textarea id="rem-desc" className="input text-lg py-4 min-h-32" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Any details that help." />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="rem-date">Date *</label>
              <input id="rem-date" type="date" className="input text-lg py-4" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="rem-time">Time *</label>
              <input id="rem-time" type="time" className="input text-lg py-4" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="rem-priority">Importance</label>
            <select id="rem-priority" className="input text-lg py-4" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
              {['High', 'Normal', 'Low'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          {formError && <p className="bg-red-50 border border-red-200 p-4 text-lg font-bold text-red-700 rounded-sm">{formError}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" className="btn-secondary text-lg px-8 py-4" onClick={() => setModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn-primary text-lg px-8 py-4" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Add task'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title="Delete task"
        message={`Are you sure you want to delete "${deleting?.title}"?`}
        onConfirm={doDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
