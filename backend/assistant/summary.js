// Builds a readable daily summary strictly from today's stored data.
function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:${String(m).padStart(2, '0')} ${ampm}`;
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d + 'T00:00:00');
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function handleSummary(db, dbHelpers) {
  const today = dbHelpers.getTodayString();
  const sentences = [];

  const events = dbHelpers.getToday('events');
  const reminders = dbHelpers.getTodayReminders();
  const routines = dbHelpers.getRoutines();
  const recent = dbHelpers.getRecentMemories(3);

  const doneRoutines = routines.filter(r => r.completed);
  const pendingRoutines = routines.filter(r => !r.completed);

  if (events.length) {
    const e = events[0];
    sentences.push(`Today you have ${e.title} at ${fmtTime(e.time)}${e.location ? ` at ${e.location}` : ''}.`);
  }
  if (doneRoutines.length) {
    sentences.push(`You completed your ${doneRoutines.map(r => r.title.toLowerCase()).join(' and ')}.`);
  }
  if (pendingRoutines.length) {
    const next = pendingRoutines[0];
    sentences.push(`Still pending: ${next.title} at ${fmtTime(next.time)}.`);
  }
  const openReminders = reminders.filter(r => !r.completed);
  if (openReminders.length) {
    const r = openReminders[0];
    sentences.push(`You have a reminder: ${r.title} at ${fmtTime(r.time)}.`);
  }
  if (recent.length) {
    const m = recent.find(x => x.date === today) || recent[0];
    const prefix = m.date === today ? 'Today you added' : 'You recently added';
    sentences.push(`${prefix} a memory about ${m.title.toLowerCase()}${m.date !== today ? ` on ${fmtDate(m.date)}` : ''}.`);
  }

  if (!sentences.length) {
    return "Nothing is scheduled for today yet. Add reminders, routines or events and I'll summarise your day here.";
  }
  return sentences.join(' ');
}
