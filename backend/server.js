import express from 'express';
import cors from 'cors';
import { openDb } from './database/db.js';
import { runSchema } from './database/schema.js';
import { dbHelpers } from './database/helpers.js';
import seedIfEmpty from './database/seedIfEmpty.js';
import { handleAssistant } from './assistant/engine.js';
import { handleSummary } from './assistant/summary.js';
import { validate } from './middleware/validate.js';
import { clearAll, seedDemoData } from './database/demoData.js';

const PORT = Number(process.env.PORT) || 4000;

const app = express();
const db = openDb();

runSchema(db);
seedIfEmpty(db);

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// ---------- generic CRUD factory ----------
// SQLite binds only numbers, strings, bigints, buffers and null, so JavaScript
// booleans (e.g. `completed: true`) are stored as 1 / 0.
function coerce(value) {
  if (typeof value === 'boolean') return value ? 1 : 0;
  return value ?? null;
}

function crud(table, fields, { orderBy = 'id' } = {}) {
  const router = express.Router();

  // GET all
  router.get('/', (req, res) => {
    try {
      const rows = db.prepare(`SELECT * FROM ${table} ORDER BY ${orderBy}`).all();
      res.json(rows);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // POST create
  router.post('/', (req, res) => {
    const err = validate(req.body, fields);
    if (err) return res.status(400).json({ error: err });
    // Only insert the columns the client actually sent, so optional columns fall
    // back to their SQLite defaults instead of an explicit NULL.
    const cols = fields.map(f => f.name).filter(c => req.body[c] !== undefined);
    const vals = cols.map(c => coerce(req.body[c]));
    try {
      const info = db.prepare(
        `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})`
      ).run(...vals);
      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(info.lastInsertRowid);
      res.status(201).json(row);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // PUT update (partial: only the fields sent are changed)
  router.put('/:id', (req, res) => {
    const err = validate(req.body, fields, { partial: true });
    if (err) return res.status(400).json({ error: err });
    const updatable = fields.filter(f => req.body[f.name] !== undefined);
    if (updatable.length === 0) return res.status(400).json({ error: 'No fields to update' });
    const set = updatable.map(f => `${f.name} = ?`).join(', ');
    const vals = updatable.map(f => coerce(req.body[f.name]));
    try {
      const info = db.prepare(`UPDATE ${table} SET ${set} WHERE id = ?`).run(...vals, req.params.id);
      if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
      const row = db.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(req.params.id);
      res.json(row);
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  // DELETE
  router.delete('/:id', (req, res) => {
    try {
      const info = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(req.params.id);
      if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
      res.status(204).end();
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  return router;
}

// ---------- field definitions ----------
const memoryFields = [
  { name: 'title', required: true, label: 'Title' },
  { name: 'description' },
  { name: 'category' },
  { name: 'date' },
  { name: 'location' },
  { name: 'person' },
  { name: 'image' },
  { name: 'tags' }
];

const peopleFields = [
  { name: 'name', required: true, label: 'Name' },
  { name: 'relationship' },
  { name: 'description' },
  { name: 'image' },
  { name: 'last_interaction' }
];

const reminderFields = [
  { name: 'title', required: true, label: 'Title' },
  { name: 'description' },
  { name: 'date', required: true, label: 'Date' },
  { name: 'time', required: true, label: 'Time' },
  { name: 'priority' },
  { name: 'completed' }
];

const routineFields = [
  { name: 'title', required: true, label: 'Title' },
  { name: 'description' },
  { name: 'time', required: true, label: 'Time' },
  { name: 'period' },
  { name: 'completed' }
];

const contactFields = [
  { name: 'name', required: true, label: 'Name' },
  { name: 'relationship' },
  { name: 'phone', required: true, label: 'Phone number' },
  { name: 'type' }
];

const eventFields = [
  { name: 'title', required: true, label: 'Title' },
  { name: 'description' },
  { name: 'date', required: true, label: 'Date' },
  { name: 'time', required: true, label: 'Time' },
  { name: 'location' }
];

// ---------- REST routes ----------
app.use('/api/memories', crud('memories', memoryFields, { orderBy: 'date DESC, id DESC' }));
app.use('/api/people', crud('people', peopleFields, { orderBy: 'name COLLATE NOCASE' }));
app.use('/api/reminders', crud('reminders', reminderFields, { orderBy: 'date, time' }));
app.use('/api/routines', crud('routines', routineFields, { orderBy: 'time' }));
app.use('/api/contacts', crud('contacts', contactFields, { orderBy: 'name COLLATE NOCASE' }));
app.use('/api/events', crud('events', eventFields, { orderBy: 'date, time' }));

// ---------- login (demo credentials, plain check) ----------
app.post('/api/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
  const user = db.prepare(
    `SELECT id, name, role, email FROM users WHERE lower(email) = lower(?) AND password = ?`
  ).get(String(email), String(password));
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  res.json(user);
});

// ---------- global search ----------
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toString().trim();
  if (!q) return res.json([]);
  try {
    res.json(dbHelpers.searchAll(q));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- AI assistant (rule-based, reads the DB) ----------
app.post('/api/assistant', (req, res) => {
  const { message } = req.body || {};
  if (!message || !String(message).trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  try {
    const answer = handleAssistant(db, dbHelpers, String(message));
    res.json({ reply: answer.reply, sources: answer.sources, mode: 'local' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- daily summary ----------
app.post('/api/summary', (req, res) => {
  try {
    const summary = handleSummary(db, dbHelpers);
    res.json({ summary, mode: 'local' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- health ----------
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ---------- reset demo data (prototype convenience) ----------
app.post('/api/reseed', (req, res) => {
  try {
    clearAll(db);
    seedDemoData(db);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ---------- 404 + error handling (always JSON so the UI can show a message) ----------
app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.originalUrl}` });
});

app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Memory Assistant backend listening on http://localhost:${PORT}`);
});
