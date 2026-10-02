import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Sunrise, Sun, Sunset, Moon, Plus, Pencil, Trash2, Check, Circle,
  CalendarPlus, MapPin
} from 'lucide-react';
import api from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';
import { Spinner, ErrorState, Modal, ConfirmDialog } from '../components/ui.jsx';
import { fmtTime, fmtDate, todayStr, relDay } from '../lib/format.js';
import { useDeepLinkOpen } from '../lib/useDeepLinkOpen.js';

const PERIODS = [
  { key: 'Morning', icon: Sunrise },
  { key: 'Afternoon', icon: Sun },
  { key: 'Evening', icon: Sunset },
  { key: 'Night', icon: Moon }
];

const emptyRoutine = { title: '', description: '', time: '08:00', period: 'Morning', completed: false };
const emptyEvent = { title: '', description: '', date: todayStr(), time: '10:00', location: '' };

function periodFor(time) {
  const h = Number(String(time).split(':')[0]);
  if (h < 12) return 'Morning';
  if (h < 16) return 'Afternoon';
  if (h < 20) return 'Evening';
  return 'Night';
}

export default function Schedule() {
  const { notify } = useApp();
  const [routines, setRoutines] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [routineModal, setRoutineModal] = useState(false);
  const [eventModal, setEventModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [rForm, setRForm] = useState(emptyRoutine);
  const [eForm, setEForm] = useState(emptyEvent);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null); // { kind: 'routine'|'event', item }
  const [reminded, setReminded] = useState([]); // routine ids that got a reminder today

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([api.get('/api/routines'), api.get('/api/events')])
      .then(([r, e]) => { setRoutines(r); setEvents(e); })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const openRoutineAdd = () => {
    setEditingRoutine(null);
    setRForm(emptyRoutine);
    setFormError('');
    setRoutineModal(true);
  };

  const openRoutineEdit = r => {
    setEditingRoutine(r);
    setRForm({
      title: r.title || '',
      description: r.description || '',
      time: r.time || '08:00',
      period: r.period || 'Morning',
      completed: !!r.completed
    });
    setFormError('');
    setRoutineModal(true);
  };

  const saveRoutine = async e => {
    e.preventDefault();
    if (!rForm.title.trim()) { setFormError('Please give the routine a name.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...rForm, period: periodFor(rForm.time) };
      if (editingRoutine) {
        const updated = await api.put(`/api/routines/${editingRoutine.id}`, payload);
        setRoutines(rs => rs.map(x => (x.id === updated.id ? updated : x)));
        notify('Routine updated', `${updated.title} was saved.`);
      } else {
        const created = await api.post('/api/routines', payload);
        setRoutines(rs => [...rs, created].sort((a, b) => a.time.localeCompare(b.time)));
        notify('Routine added', `${created.title} at ${fmtTime(created.time)}.`);
      }
      setRoutineModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleRoutine = async r => {
    try {
      const updated = await api.put(`/api/routines/${r.id}`, { completed: !r.completed });
      setRoutines(rs => rs.map(x => (x.id === updated.id ? updated : x)));
    } catch (err) {
      notify('Could not update routine', err.message);
    }
  };

  const openEventAdd = () => {
    setEditingEvent(null);
    setEForm(emptyEvent);
    setFormError('');
    setEventModal(true);
  };

  const openEventEdit = ev => {
    setEditingEvent(ev);
    setEForm({
      title: ev.title || '',
      description: ev.description || '',
      date: ev.date || todayStr(),
      time: ev.time || '10:00',
      location: ev.location || ''
    });
    setFormError('');
    setEventModal(true);
  };

  useDeepLinkOpen(openEventAdd, 'add', 'event');
  useDeepLinkOpen(openRoutineAdd, 'add', 'routine');

  const saveEvent = async e => {
    e.preventDefault();
    if (!eForm.title.trim()) { setFormError('Please give the event a title.'); return; }
    if (!eForm.date) { setFormError('Please choose a date.'); return; }
    setSaving(true);
    setFormError('');
    try {
      if (editingEvent) {
        const updated = await api.put(`/api/events/${editingEvent.id}`, eForm);
        setEvents(es => es.map(x => (x.id === updated.id ? updated : x)));
        notify('Event updated', `${updated.title} was saved.`);
      } else {
        const created = await api.post('/api/events', eForm);
        setEvents(es => [...es, created]);
        notify('Event added', `${created.title} on ${fmtDate(created.date)}.`);
      }
      setEventModal(false);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const addRoutineReminder = async r => {
    try {
      const created = await api.post('/api/reminders', {
        title: r.title,
        description: r.description || `Part of the daily routine at ${fmtTime(r.time)}.`,
        date: todayStr(),
        time: r.time,
        priority: 'Normal',
        completed: false
      });
      setReminded(ids => [...ids, r.id]);
      notify('Reminder set', `${created.title} - you will be nudged at ${fmtTime(created.time)}.`);
    } catch (err) {
      notify('Could not set reminder', err.message);
    }
  };

  const doDelete = async () => {
    if (!deleting) return;
    try {
      await api.del(`/api/${deleting.kind === 'routine' ? 'routines' : 'events'}/${deleting.item.id}`);
      if (deleting.kind === 'routine') setRoutines(rs => rs.filter(x => x.id !== deleting.item.id));
      else setEvents(es => es.filter(x => x.id !== deleting.item.id));
      notify('Deleted', `"${deleting.item.title}" was removed.`);
    } catch (err) {
      notify('Could not delete', err.message);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Spinner label="Loading schedule..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;

  const today = todayStr();

  return (
    <div className="mx-auto max-w-5xl pb-16">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-2">Schedule</h1>
          <p className="text-xl text-slate-600">Your daily routine and upcoming events.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button className="bg-white border-2 border-nyala-primary text-nyala-primary font-bold text-lg px-6 py-3 rounded-sm flex items-center hover:bg-blue-50 transition-colors" onClick={openEventAdd}>
            <CalendarPlus size={24} className="mr-2" /> Add Event
          </button>
          <button className="btn-primary text-lg px-6 py-3 flex items-center" onClick={openRoutineAdd}>
            <Plus size={24} className="mr-2" /> Add Routine
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Routine timeline */}
        <section>
          <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-6">Daily Routine</h2>
          {routines.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 text-center rounded-sm">
              <p className="text-xl font-bold break-words text-slate-700 mb-2">No routines yet</p>
              <p className="text-slate-500">Add morning-to-night activities.</p>
            </div>
          ) : (
            <div className="space-y-10">
              {PERIODS.map(({ key, icon: Icon }) => {
                const items = routines.filter(r => r.period === key);
                if (items.length === 0) return null;
                return (
                  <div key={key}>
                    <h3 className="flex items-center gap-3 text-2xl font-display font-bold text-slate-800 border-b border-slate-200 pb-3 mb-6">
                      <Icon size={28} className="text-nyala-primary" /> {key}
                    </h3>
                    <ul className="space-y-4">
                      {items.map(r => (
                        <li key={r.id} className={`flex items-center gap-4 p-4 rounded-sm border ${r.completed ? 'bg-slate-50 border-slate-200' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <button
                            onClick={() => toggleRoutine(r)}
                            className="shrink-0"
                            aria-label={r.completed ? `Mark ${r.title} as pending` : `Mark ${r.title} as completed`}
                          >
                            {r.completed
                              ? <Check size={36} className="text-nyala-primary" />
                              : <Circle size={36} className="text-slate-300 hover:text-nyala-primary" />}
                          </button>
                          
                          <div className="min-w-0 flex-1">
                            <span className={`block text-xl font-bold break-words ${r.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{r.title}</span>
                            <span className="block text-lg text-nyala-primary font-bold mt-1">{fmtTime(r.time)}</span>
                          </div>
                          
                          <div className="flex gap-2 shrink-0">
                            {!r.completed && (
                              <button
                                className={`text-sm font-bold px-4 py-2 rounded-sm ${reminded.includes(r.id) ? 'bg-blue-50 text-slate-400 cursor-not-allowed' : 'bg-blue-50 text-nyala-primary hover:bg-blue-100'}`}
                                onClick={() => addRoutineReminder(r)}
                                disabled={reminded.includes(r.id)}
                              >
                                {reminded.includes(r.id) ? 'Reminder Set' : 'Remind Me'}
                              </button>
                            )}
                            <button className="p-2 text-slate-400 hover:text-nyala-primary bg-slate-50 rounded-sm" onClick={() => openRoutineEdit(r)} aria-label={`Edit ${r.title}`}>
                              <Pencil size={20} />
                            </button>
                            <button className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-sm" onClick={() => setDeleting({ kind: 'routine', item: r })} aria-label={`Delete ${r.title}`}>
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Events */}
        <section>
          <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-6">Appointments & Events</h2>
          {events.length === 0 ? (
            <div className="bg-white border border-slate-200 p-8 text-center rounded-sm">
              <p className="text-xl font-bold break-words text-slate-700 mb-2">No events yet</p>
              <p className="text-slate-500">Add appointments and family gatherings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {[...events]
                .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
                .map(ev => (
                  <article key={ev.id} className="bg-white border-2 border-slate-200 rounded-sm p-6 shadow-sm flex items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <span className={`inline-block px-3 py-1 text-sm font-bold uppercase tracking-wider rounded-sm mb-3 ${ev.date === today ? 'bg-blue-50 text-nyala-primary' : ev.date < today ? 'bg-slate-100 text-slate-500' : 'bg-slate-50 border border-slate-200 text-slate-700'}`}>
                        {relDay(ev.date)}
                      </span>
                      <h3 className="text-2xl font-display font-bold text-slate-900 mb-2">{ev.title}</h3>
                      <p className="text-lg font-bold text-nyala-primary mb-2">{fmtDate(ev.date)} at {fmtTime(ev.time)}</p>
                      {ev.location && <p className="inline-flex items-center gap-2 text-lg text-slate-600"><MapPin size={20} /> {ev.location}</p>}
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button className="p-2 text-slate-400 hover:text-nyala-primary bg-slate-50 rounded-sm" onClick={() => openEventEdit(ev)} aria-label={`Edit ${ev.title}`}>
                        <Pencil size={20} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-sm" onClick={() => setDeleting({ kind: 'event', item: ev })} aria-label={`Delete ${ev.title}`}>
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      </div>

      {/* Routine modal */}
      <Modal open={routineModal} onClose={() => setRoutineModal(false)} title={editingRoutine ? 'Edit Routine' : 'Add Routine'}>
        <form onSubmit={saveRoutine} className="space-y-6" noValidate>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="r-title">Activity *</label>
            <input id="r-title" className="input text-lg py-4" value={rForm.title} onChange={e => setRForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Morning walk" />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="r-desc">Notes</label>
            <textarea id="r-desc" className="input text-lg py-4 min-h-32" value={rForm.description} onChange={e => setRForm(f => ({ ...f, description: e.target.value }))} placeholder="Any details that help." />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="r-time">Time *</label>
              <input id="r-time" type="time" className="input text-lg py-4" value={rForm.time} onChange={e => setRForm(f => ({ ...f, time: e.target.value, period: periodFor(e.target.value) }))} />
            </div>
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="r-period">Time of day</label>
              <input id="r-period" className="input text-lg py-4 bg-slate-50 text-slate-500" value={rForm.period} readOnly />
            </div>
          </div>
          {formError && <p className="bg-red-50 border border-red-200 p-4 text-lg font-bold text-red-700 rounded-sm">{formError}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" className="btn-secondary text-lg px-8 py-4" onClick={() => setRoutineModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary text-lg px-8 py-4" disabled={saving}>{saving ? 'Saving...' : editingRoutine ? 'Save changes' : 'Add routine'}</button>
          </div>
        </form>
      </Modal>

      {/* Event modal */}
      <Modal open={eventModal} onClose={() => setEventModal(false)} title={editingEvent ? 'Edit Event' : 'Add Event'}>
        <form onSubmit={saveEvent} className="space-y-6" noValidate>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="e-title">Title *</label>
            <input id="e-title" className="input text-lg py-4" value={eForm.title} onChange={e => setEForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Doctor appointment" />
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="e-desc">Description</label>
            <textarea id="e-desc" className="input text-lg py-4 min-h-32" value={eForm.description} onChange={e => setEForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="e-date">Date *</label>
              <input id="e-date" type="date" className="input text-lg py-4" value={eForm.date} onChange={e => setEForm(f => ({ ...f, date: e.target.value }))} />
            </div>
            <div>
              <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="e-time">Time *</label>
              <input id="e-time" type="time" className="input text-lg py-4" value={eForm.time} onChange={e => setEForm(f => ({ ...f, time: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-lg font-bold text-slate-800 mb-2" htmlFor="e-loc">Location</label>
            <input id="e-loc" className="input text-lg py-4" value={eForm.location} onChange={e => setEForm(f => ({ ...f, location: e.target.value }))} placeholder="e.g. Sunrise Clinic" />
          </div>
          {formError && <p className="bg-red-50 border border-red-200 p-4 text-lg font-bold text-red-700 rounded-sm">{formError}</p>}
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-200">
            <button type="button" className="btn-secondary text-lg px-8 py-4" onClick={() => setEventModal(false)}>Cancel</button>
            <button type="submit" className="btn-primary text-lg px-8 py-4" disabled={saving}>{saving ? 'Saving...' : editingEvent ? 'Save changes' : 'Add event'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleting}
        title={deleting?.kind === 'routine' ? 'Delete routine' : 'Delete event'}
        message={`Are you sure you want to delete "${deleting?.item?.title}"?`}
        onConfirm={doDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
