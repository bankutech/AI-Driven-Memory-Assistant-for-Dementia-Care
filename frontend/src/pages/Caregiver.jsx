import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HeartHandshake, CheckCircle2, Circle, XCircle, CalendarClock, Brain, Bell,
  UserPlus, CalendarPlus, AlertCircle, Activity
} from 'lucide-react';
import api from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';
import PeopleSection from '../components/PeopleSection.jsx';
import { Spinner, EmptyState, ErrorState } from '../components/ui.jsx';
import { fmtTime, fmtDate, todayStr, relDay } from '../lib/format.js';

export default function Caregiver() {
  const { session } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    Promise.all([
      api.get('/api/reminders'),
      api.get('/api/events'),
      api.get('/api/routines'),
      api.get('/api/people'),
      api.get('/api/memories')
    ])
      .then(([reminders, events, routines, people, memories]) => setData({ reminders, events, routines, people, memories }))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Spinner label="Loading care overview..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const today = todayStr();
  const patientName = 'Arun Kumar';
  const careFor = session?.user?.role === 'caregiver' ? session.user.name : 'Meera Kumar';

  const todayReminders = data.reminders.filter(r => r.date === today);
  const missedReminders = data.reminders.filter(r => r.date < today && !r.completed);
  const doneRoutines = data.routines.filter(r => r.completed);
  const pendingRoutines = data.routines.filter(r => !r.completed);
  const upcomingEvents = data.events
    .filter(e => e.date >= today)
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const recentMemories = [...data.memories]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 4);

  const missedItems = [
    ...missedReminders.map(r => ({ ...r, type: 'reminder' })),
    ...data.routines.filter(r => !r.completed && r.time < new Date().toTimeString().slice(0, 5)).map(r => ({ ...r, type: 'routine' }))
  ];

  return (
    <div className="mx-auto max-w-6xl pb-16">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 bg-nyala-primary text-white p-8 rounded-sm shadow-sm">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-blue-200 mb-2">
            <HeartHandshake size={20} /> Caregiver Dashboard
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-2">{patientName}</h1>
          <p className="text-xl text-blue-100">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left column: Status & Attention */}
        <div className="lg:col-span-2 space-y-8">
          
          <section className="bg-white border-2 border-slate-200 rounded-sm p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-6 flex items-center gap-3">
              <Activity size={28} className="text-nyala-primary" /> Today's Status
            </h2>
            
            <p className="text-xl text-slate-700 font-bold mb-6">
              {patientName} has completed {doneRoutines.length} of {data.routines.length} routines today.
            </p>
            
            <div className="space-y-3">
              {data.routines.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-sm bg-slate-50">
                  <div className="flex items-center gap-4">
                    {r.completed ? (
                      <CheckCircle2 size={24} className="text-nyala-primary" />
                    ) : r.time < new Date().toTimeString().slice(0, 5) ? (
                      <XCircle size={24} className="text-red-500" />
                    ) : (
                      <Circle size={24} className="text-slate-300" />
                    )}
                    <span className={`text-lg font-bold ${r.completed ? 'text-slate-500' : 'text-slate-900'}`}>{r.title}</span>
                  </div>
                  <span className="text-lg font-bold text-slate-500">{fmtTime(r.time)}</span>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-slate-500 uppercase tracking-widest font-bold">This is a supportive overview, not a medical diagnostic tool.</p>
          </section>

          {missedItems.length > 0 && (
            <section className="bg-red-50 border-2 border-red-200 rounded-sm p-8 shadow-sm">
              <h2 className="text-2xl font-display font-bold text-red-800 mb-6 flex items-center gap-3">
                <AlertCircle size={28} /> Attention Needed
              </h2>
              <ul className="space-y-3">
                {missedItems.map(item => (
                  <li key={item.id} className="flex items-center justify-between p-4 bg-white border border-red-100 rounded-sm">
                    <span className="text-lg font-bold text-red-900">{item.title}</span>
                    <span className="text-slate-500 font-bold">{item.type === 'reminder' ? relDay(item.date) : 'Today'} {fmtTime(item.time)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="bg-white border-2 border-slate-200 rounded-sm p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-6 flex items-center gap-3">
              <CalendarClock size={28} className="text-nyala-primary" /> Upcoming
            </h2>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">Appointments</h3>
                {upcomingEvents.length === 0 ? (
                  <p className="text-lg text-slate-600">No upcoming appointments.</p>
                ) : (
                  <ul className="space-y-3">
                    {upcomingEvents.slice(0, 3).map(ev => (
                      <li key={ev.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-sm">
                        <span className="text-xl font-bold break-words text-slate-900">{ev.title}</span>
                        <span className="text-lg font-bold text-nyala-primary">{relDay(ev.date)} {fmtTime(ev.time)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-slate-500 uppercase tracking-widest mb-4">Reminders</h3>
                {todayReminders.length === 0 ? (
                  <p className="text-lg text-slate-600">No additional reminders for today.</p>
                ) : (
                  <ul className="space-y-3">
                    {todayReminders.map(r => (
                      <li key={r.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-sm">
                        <span className={`text-xl font-bold break-words ${r.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{r.title}</span>
                        <span className="text-lg font-bold text-nyala-primary">{fmtTime(r.time)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

        </div>

        {/* Right column: Quick Actions & Memory/People */}
        <div className="space-y-8">
          
          <section className="bg-blue-50 border-2 border-nyala-primary rounded-sm p-8 shadow-sm">
            <h2 className="text-2xl font-display font-bold text-slate-900 mb-6">Quick Actions</h2>
            <div className="flex flex-col gap-4">
              <Link to="/reminders?add=1" className="bg-white border-2 border-slate-200 hover:border-nyala-primary text-slate-800 hover:text-nyala-primary font-bold text-lg p-4 flex items-center transition-colors rounded-sm">
                <Bell size={24} className="mr-3 text-nyala-primary" /> Add Reminder
              </Link>
              <Link to="/schedule?add=event" className="bg-white border-2 border-slate-200 hover:border-nyala-primary text-slate-800 hover:text-nyala-primary font-bold text-lg p-4 flex items-center transition-colors rounded-sm">
                <CalendarPlus size={24} className="mr-3 text-nyala-primary" /> Add Appointment
              </Link>
              <Link to="/people?add=1" className="bg-white border-2 border-slate-200 hover:border-nyala-primary text-slate-800 hover:text-nyala-primary font-bold text-lg p-4 flex items-center transition-colors rounded-sm">
                <UserPlus size={24} className="mr-3 text-nyala-primary" /> Add Person
              </Link>
              <Link to="/memories?add=1" className="bg-white border-2 border-slate-200 hover:border-nyala-primary text-slate-800 hover:text-nyala-primary font-bold text-lg p-4 flex items-center transition-colors rounded-sm">
                <Brain size={24} className="mr-3 text-nyala-primary" /> Add Memory
              </Link>
            </div>
          </section>
          
          <section className="bg-white border-2 border-slate-200 rounded-sm p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-slate-900">Recent Memories</h2>
              <Link to="/memories" className="text-nyala-primary font-bold hover:underline">View All</Link>
            </div>
            {recentMemories.length === 0 ? (
              <p className="text-lg text-slate-600">No memories recorded yet.</p>
            ) : (
              <ul className="space-y-4">
                {recentMemories.map(m => (
                  <li key={m.id} className="p-4 bg-slate-50 border border-slate-100 rounded-sm">
                    <p className="text-xl font-bold break-words text-slate-900 mb-1">{m.title}</p>
                    <p className="text-slate-600">{m.category} &bull; {fmtDate(m.date)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <PeopleSection people={data.people} />
          
        </div>
      </div>
    </div>
  );
}
