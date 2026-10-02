import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Sparkles, Check, Circle } from 'lucide-react';
import api from '../lib/api.js';
import { useApp } from '../context/AppContext.jsx';
import PeopleSection from '../components/PeopleSection.jsx';
import { Spinner, ErrorState } from '../components/ui.jsx';
import { fmtTime, fmtDate, todayStr, greeting } from '../lib/format.js';

export default function Dashboard() {
  const { session, notify } = useApp();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [now, setNow] = useState(new Date());

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

  useEffect(() => {
    load();
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, [load]);

  const summarize = async () => {
    setSummarizing(true);
    setSummary('');
    try {
      const res = await api.post('/api/summary');
      setSummary(res.summary);
    } catch (err) {
      notify('Could not build summary', err.message);
    } finally {
      setSummarizing(false);
    }
  };

  const toggle = async (item) => {
    try {
      if (item.kind === 'reminder') {
        const updated = await api.put(`/api/reminders/${item.id}`, { completed: !item.completed });
        setData(prev => ({ ...prev, reminders: prev.reminders.map(r => r.id === updated.id ? updated : r) }));
      } else if (item.kind === 'routine') {
        const updated = await api.put(`/api/routines/${item.id}`, { completed: !item.completed });
        setData(prev => ({ ...prev, routines: prev.routines.map(r => r.id === updated.id ? updated : r) }));
      }
    } catch (err) {
      notify('Could not update', err.message);
    }
  };

  if (loading) return <Spinner label="Loading your day..." />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  const today = todayStr();
  const firstName = (session?.user?.name || 'User').split(' ')[0];

  const allToday = [
    ...data.reminders.filter(r => r.date === today).map(r => ({ kind: 'reminder', id: r.id, time: r.time, title: r.title, desc: r.description, completed: !!r.completed })),
    ...data.routines.map(r => ({ kind: 'routine', id: r.id, time: r.time, title: r.title, desc: r.description, completed: !!r.completed })),
    ...data.events.filter(e => e.date === today).map(e => ({ kind: 'event', id: e.id, time: e.time, title: e.title, desc: e.location, completed: false }))
  ].sort((a, b) => a.time.localeCompare(b.time));

  const nextActivity = allToday.find(a => !a.completed);

  const getPeriod = (time) => {
    const h = Number(String(time).split(':')[0]);
    if (h < 12) return 'Morning';
    if (h < 16) return 'Afternoon';
    if (h < 20) return 'Evening';
    return 'Night';
  };

  const itemsByPeriod = { Morning: [], Afternoon: [], Evening: [], Night: [] };
  allToday.forEach(a => itemsByPeriod[getPeriod(a.time)].push(a));
  const periods = ['Morning', 'Afternoon', 'Evening', 'Night'];

  return (
    <div className="mx-auto max-w-3xl pb-16">
      {/* HEADER */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-slate-900 mb-2">
          {greeting()}, {firstName}.
        </h1>
        <p className="text-xl text-slate-600">
          {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </header>

      {summary && (
        <section className="bg-blue-50 border-l-4 border-nyala-primary p-6 mb-12 rounded-sm" aria-live="polite">
          <p className="text-lg leading-relaxed text-slate-800">{summary}</p>
        </section>
      )}

      {/* NEXT ACTIVITY */}
      <section className="mb-16">
        <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-4">Next</h2>
        {nextActivity ? (
          <div className="bg-white border-2 border-nyala-primary rounded-sm p-8 shadow-sm">
            <h3 className="text-3xl font-display break-words font-bold text-slate-900">{nextActivity.title}</h3>
            <p className="text-2xl mt-2 font-bold text-nyala-primary">{fmtTime(nextActivity.time)}</p>
            {nextActivity.desc && <p className="mt-3 text-lg text-slate-600">{nextActivity.desc}</p>}
            
            {nextActivity.kind !== 'event' && (
              <button 
                onClick={() => toggle(nextActivity)}
                className="mt-8 px-8 py-4 w-full sm:w-auto bg-nyala-primary text-white text-xl font-bold break-words rounded-sm hover:bg-[#093a82] transition-colors flex items-center justify-center gap-3"
              >
                <Check size={28} />
                Mark as Done
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-sm p-8 shadow-sm text-center">
            <p className="text-2xl font-bold break-words text-slate-700">You're all caught up!</p>
            <p className="text-lg text-slate-500 mt-2">No more activities for today.</p>
          </div>
        )}
      </section>

      {/* TODAY'S ROUTINE */}
      <section className="mb-16">
        <h2 className="text-sm font-bold tracking-widest text-slate-500 uppercase mb-6">Today's Routine</h2>
        
        {allToday.length === 0 ? (
          <p className="text-lg text-slate-500">Nothing planned for today.</p>
        ) : (
          <div className="space-y-10">
            {periods.map(period => {
              const items = itemsByPeriod[period];
              if (items.length === 0) return null;
              
              return (
                <div key={period}>
                  <h3 className="text-2xl font-display font-bold text-slate-800 border-b border-slate-200 pb-2 mb-4">{period}</h3>
                  <ul className="space-y-3">
                    {items.map(item => (
                      <li key={`${item.kind}-${item.id}`} className="flex items-center gap-4 py-2">
                        {item.kind !== 'event' ? (
                          <button onClick={() => toggle(item)} aria-label={item.completed ? 'Mark as not done' : 'Mark as done'} className="shrink-0">
                            {item.completed ? <Check size={32} className="text-nyala-primary" /> : <Circle size={32} className="text-slate-300 hover:text-nyala-primary transition-colors" />}
                          </button>
                        ) : (
                          <div className="w-8 shrink-0 flex justify-center"><div className="w-3 h-3 rounded-full bg-slate-300" /></div>
                        )}
                        <span className={`text-xl font-bold break-words w-24 shrink-0 ${item.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {fmtTime(item.time)}
                        </span>
                        <span className={`text-xl ${item.completed ? 'text-slate-400 line-through' : 'text-slate-900 font-medium'}`}>
                          {item.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* OTHER SECTIONS */}
      <div className="grid md:grid-cols-2 gap-8 border-t border-slate-200 pt-12">
        <PeopleSection people={data.people} />
        
        <div className="bg-white border border-slate-200 rounded-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold break-words text-slate-800">Recent Memories</h3>
            <Link to="/memories" className="text-nyala-primary font-bold hover:underline">View all</Link>
          </div>
          {data.memories.length === 0 ? (
            <p className="text-slate-500">No memories added yet.</p>
          ) : (
            <ul className="space-y-4">
              {data.memories.slice(0, 3).map(m => (
                <li key={m.id}>
                  <p className="text-lg font-bold text-slate-800">{m.title}</p>
                  <p className="text-slate-500">{fmtDate(m.date)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      
      <div className="mt-12 flex justify-center">
        <button onClick={summarize} disabled={summarizing} className="btn-secondary text-lg px-6 py-3">
          {summarizing ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Ask AI to Summarize My Day
        </button>
      </div>
    </div>
  );
}
