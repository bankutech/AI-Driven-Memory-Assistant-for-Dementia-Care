// Rule-based local assistant engine.
// Answers questions strictly from the SQLite database — it never invents
// personal information. Designed so an optional OpenAI-compatible key can
// later be layered on top without changing the API contract.

function norm(s) {
  return (s || '').toString().toLowerCase();
}

function hasWord(q, ...words) {
  return words.some(w => q.includes(w));
}

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

const MED_WORDS = ['medicine', 'medication', 'tablet', 'pill', 'dose'];
const MED_CHANGE_WORDS = [
  'increase', 'decrease', 'double', 'extra dose', 'skip', 'stop taking',
  'change my', 'more tablets', 'higher dose', 'lower dose', 'reduce'
];

export function handleAssistant(db, dbHelpers, message) {
  const q = norm(message);
  const today = dbHelpers.getTodayString();
  const sources = [];

  // ---- Safety first: never advise on changing medication ----
  if (hasWord(q, ...MED_CHANGE_WORDS) && hasWord(q, ...MED_WORDS)) {
    const recorded = db.prepare(
      `SELECT * FROM reminders WHERE lower(title) LIKE '%medicine%' OR lower(title) LIKE '%tablet%' ORDER BY date, time LIMIT 3`
    ).all();
    let reply = "I can't advise on changing medication — please check with your doctor or caregiver before taking an extra dose, skipping one, or changing anything. I can only show you what is recorded.";
    if (recorded.length) {
      recorded.forEach(r => { sources.push({ type: 'reminder', id: r.id, name: r.title }); });
      reply += ` Your recorded medicine reminders: ${recorded.map(r => `${r.title} (${fmtDate(r.date)} at ${fmtTime(r.time)})`).join(', ')}.`;
    }
    return { reply, sources };
  }

  // ---- Face / photo question → point at the Demo Recognition feature ----
  if (hasWord(q, 'photo', 'picture', 'face', 'image') && hasWord(q, 'who', 'this', 'recognise', 'recognize', 'identify')) {
    const names = dbHelpers.getPeople().map(p => `${p.name} (${p.relationship})`).slice(0, 6);
    return {
      reply: 'This prototype does not do real facial recognition. Open the People page and use the "Who is this?" button to try the simulated Demo Recognition, which matches a photo against your saved people.'
        + (names.length ? ` People saved right now: ${names.join(', ')}.` : ''),
      sources
    };
  }

  // ---- Who is <name>? ----
  const whoMatch = q.match(/who\s+is\s+([a-z\s\.]+?)(\??\s*$|\s*(what|when|where|which|tell|call)\b)/);
  if (whoMatch) {
    const name = whoMatch[1].trim();
    const person = dbHelpers.findPersonByName(name);
    if (person) {
      sources.push({ type: 'person', id: person.id, name: person.name });
      let reply = `${person.name} is your ${norm(person.relationship).includes('unknown') ? 'known contact' : person.relationship}. ${person.description || ''}`.trim();
      if (person.last_interaction) {
        reply += ` You last interacted on ${fmtDate(person.last_interaction)}.`;
      }
      const contact = db.prepare(`SELECT * FROM contacts WHERE lower(name) = lower(?)`).get(person.name);
      if (contact && contact.phone) {
        reply += ` Their number is saved in your contacts.`;
        sources.push({ type: 'contact', id: contact.id, name: contact.name });
      }
      const memoriesWith = db.prepare(`SELECT title, date FROM memories WHERE lower(person) = lower(?) ORDER BY date DESC LIMIT 3`).all(person.name);
      if (memoriesWith.length) {
        reply += ` Memories with them: ${memoriesWith.map(m => `"${m.title}" (${fmtDate(m.date)})`).join(', ')}.`;
      }
      return { reply, sources };
    }
    return { reply: `I couldn't find "${name}" in your important people. You can add them on the People page.`, sources };
  }

  // ---- Today's schedule / what do I have today ----
  if (hasWord(q, 'today', 'my day') && hasWord(q, 'what', 'schedule', 'plan', 'have', 'happening')) {
    const reminders = dbHelpers.getTodayReminders();
    const events = dbHelpers.getToday('events');
    const routines = dbHelpers.getRoutines();
    const lines = [];
    if (events.length) {
      lines.push('Events today:');
      events.forEach(e => { lines.push(`• ${e.title} at ${fmtTime(e.time)}${e.location ? ` (${e.location})` : ''}`); sources.push({ type: 'event', id: e.id, name: e.title }); });
    }
    if (reminders.length) {
      lines.push('Reminders today:');
      reminders.forEach(r => { lines.push(`• ${r.title} at ${fmtTime(r.time)}${r.completed ? ' ✓ done' : ''}`); sources.push({ type: 'reminder', id: r.id, name: r.title }); });
    }
    if (routines.length) {
      const pending = routines.filter(r => !r.completed);
      const done = routines.filter(r => r.completed);
      lines.push(`Routine: ${done.length} of ${routines.length} completed today.` + (pending.length ? ` Still pending: ${pending.map(r => r.title).join(', ')}.` : ' All done!'));
    }
    if (!lines.length) return { reply: 'You have nothing scheduled today. Enjoy your free day!', sources };
    return { reply: lines.join('\n'), sources };
  }

  // ---- Last doctor appointment / when was... ----
  if (hasWord(q, 'last', 'when') && hasWord(q, 'doctor', 'appointment', 'clinic', 'checkup', 'check-up')) {
    const rows = db.prepare(`SELECT * FROM memories WHERE (lower(title) LIKE '%doctor%' OR lower(title) LIKE '%appointment%' OR lower(category) = 'Important') ORDER BY date DESC LIMIT 1`).all();
    const ev = db.prepare(`SELECT * FROM events WHERE lower(title) LIKE '%doctor%' OR lower(title) LIKE '%appointment%' ORDER BY date DESC LIMIT 1`).get();
    if (rows.length) {
      const m = rows[0];
      sources.push({ type: 'memory', id: m.id, name: m.title });
      let reply = `Your most recent doctor visit on record was "${m.title}" on ${fmtDate(m.date)}${m.location ? ` at ${m.location}` : ''}.`;
      if (ev) {
        sources.push({ type: 'event', id: ev.id, name: ev.title });
        if (ev.date >= today) reply += ` Your next appointment is "${ev.title}" on ${fmtDate(ev.date)} at ${fmtTime(ev.time)}.`;
      }
      return { reply, sources };
    }
    if (ev) return { reply: `Upcoming: "${ev.title}" on ${fmtDate(ev.date)} at ${fmtTime(ev.time)}.`, sources };
    return { reply: 'I have no doctor visits recorded in your memories. You can add one in the Memory Vault.', sources };
  }

  // ---- Where did I go with family / trips ----
  if (hasWord(q, 'where', 'trip', 'beach', 'travel', 'visit', 'outing') && hasWord(q, 'family', 'we', 'go', 'went', 'did')) {
    const rows = db.prepare(`SELECT * FROM memories WHERE (lower(title) LIKE '%beach%' OR lower(title) LIKE '%trip%' OR lower(title) LIKE '%visit%' OR lower(location) LIKE '%beach%' OR lower(category) = 'Places') ORDER BY date DESC LIMIT 5`).all();
    if (rows.length) {
      const list = rows.map(m => { sources.push({ type: 'memory', id: m.id, name: m.title }); return `"${m.title}" — ${fmtDate(m.date)}${m.location ? `, ${m.location}` : ''}`; });
      return { reply: `Here are the outings I found:\n• ${list.join('\n• ')}`, sources };
    }
    return { reply: "I don't have any outings recorded yet. Add one in the Memory Vault under the Places category.", sources };
  }

  // ---- Show important memories ----
  if (hasWord(q, 'important') && hasWord(q, 'memory', 'memories')) {
    const rows = dbHelpers.getMemoriesByCategory('Important');
    const rows2 = db.prepare(`SELECT * FROM memories ORDER BY date DESC LIMIT 3`).all();
    const all = rows.length ? rows : rows2;
    if (all.length) {
      const list = all.map(m => { sources.push({ type: 'memory', id: m.id, name: m.title }); return `"${m.title}" (${m.category}, ${fmtDate(m.date)})`; });
      return { reply: `${rows.length ? 'Your important memories' : 'Your recent memories'}:\n• ${list.join('\n• ')}`, sources };
    }
    return { reply: 'Your memory vault is empty right now.', sources };
  }

  // ---- Who should I call today ----
  if (hasWord(q, 'call', 'phone', 'contact') && hasWord(q, 'who', 'whom', 'should', 'today')) {
    const rem = db.prepare(`SELECT * FROM reminders WHERE date = date('now','localtime') AND (lower(title) LIKE '%call%' OR lower(description) LIKE '%call%')`).all();
    if (rem.length) {
      const contacts = dbHelpers.getContacts().filter(c => c.phone);
      let reply = `Today's calls:\n`;
      rem.forEach(r => { sources.push({ type: 'reminder', id: r.id, name: r.title }); reply += `• "${r.title}" at ${fmtTime(r.time)}\n`; });
      if (contacts.length) {
        reply += `\nYou can reach them from the Contacts page. Saved numbers: ${contacts.map(c => `${c.name} (${c.relationship})`).join(', ')}.`;
      }
      return { reply: reply.trim(), sources };
    }
    return { reply: 'You have no calls scheduled for today. Your important contacts are on the Contacts page.', sources };
  }

  // ---- Medicine / medication ----
  if (hasWord(q, 'medicine', 'medication', 'tablet', 'pill')) {
    const rem = db.prepare(`SELECT * FROM reminders WHERE lower(title) LIKE '%medicine%' OR lower(description) LIKE '%medicine%' OR lower(title) LIKE '%tablet%' ORDER BY date DESC, time DESC LIMIT 3`).all();
    const routine = db.prepare(`SELECT * FROM routines WHERE lower(title) LIKE '%medicine%' OR lower(title) LIKE '%tablet%' ORDER BY time`).all();
    if (rem.length || routine.length) {
      const lines = [];
      rem.forEach(r => { sources.push({ type: 'reminder', id: r.id, name: r.title }); lines.push(`Reminder: "${r.title}" on ${fmtDate(r.date)} at ${fmtTime(r.time)}${r.completed ? ' ✓ done' : ''}.`); });
      routine.forEach(r => { sources.push({ type: 'routine', id: r.id, name: r.title }); lines.push(`Routine: "${r.title}" at ${fmtTime(r.time)} daily — ${r.completed ? 'completed' : 'pending'} today.`); });
      return { reply: lines.join('\n'), sources };
    }
    return { reply: 'No medicine reminders found. Ask your caregiver to add one on the Reminders page.', sources };
  }

  // ---- Daily routine (what is my routine) ----
  if (hasWord(q, 'routine', 'routines') && hasWord(q, 'what', 'my', 'daily', 'show', 'list', 'tell', 'today')) {
    const routines = dbHelpers.getRoutines();
    if (routines.length) {
      const periods = ['Morning', 'Afternoon', 'Evening', 'Night'];
      const lines = [];
      periods.forEach(p => {
        const items = routines.filter(r => r.period === p);
        if (!items.length) return;
        lines.push(`${p}:`);
        items.forEach(r => {
          sources.push({ type: 'routine', id: r.id, name: r.title });
          lines.push(`• ${fmtTime(r.time)} — ${r.title}${r.completed ? ' ✓ done' : ''}`);
        });
      });
      const done = routines.filter(r => r.completed).length;
      lines.push(`${done} of ${routines.length} routines completed today.`);
      return { reply: `Your daily routine:\n${lines.join('\n')}`, sources };
    }
    return { reply: 'You have no routines saved yet. Add one on the Schedule page.', sources };
  }

  // ---- Fallback: keyword search across memories, people, events ----
  const words = q.split(/\s+/).filter(w => w.length > 3 && !['about', 'what', 'when', 'where', 'which', 'tell', 'show', 'please', 'there', 'havent'].includes(w));
  for (const w of words) {
    const results = dbHelpers.searchAll(w);
    if (results.length) {
      const top = results.slice(0, 5);
      const lines = top.map(r => {
        sources.push({ type: r.type, id: r.id, name: r.title });
        const bits = [r.title];
        if (r.subtitle) bits.push(`(${r.subtitle})`);
        if (r.date) bits.push(`on ${fmtDate(r.date)}`);
        if (r.time) bits.push(`at ${fmtTime(r.time)}`);
        if (r.location) bits.push(`at ${r.location}`);
        return `• ${bits.join(' ')} — ${r.type}`;
      });
      return { reply: `Here's what I found for "${w}":\n${lines.join('\n')}`, sources };
    }
  }

  return {
    reply: "I'm not sure about that. I can answer questions about your memories, people, reminders, routines and events — for example: \"Who is Riya?\", \"What do I have today?\" or \"Where did I go with my family?\"",
    sources
  };
}
