import { openDb } from './db.js';

const db = openDb();

export const dbHelpers = {
  // ----- generic search across tables -----
  searchAll(q) {
    const like = `%${q}%`;
    const out = [];
    const push = (rows, type) => rows.forEach(r => out.push({ type, ...r }));

    push(db.prepare(`SELECT id, title, description, category, date, location FROM memories
        WHERE title LIKE ? OR description LIKE ? OR location LIKE ? OR person LIKE ? OR IFNULL(tags,'') LIKE ? OR category LIKE ?`)
      .all(like, like, like, like, like, like), 'memory');
    push(db.prepare(`SELECT id, name AS title, relationship AS subtitle, description FROM people
        WHERE name LIKE ? OR IFNULL(relationship,'') LIKE ? OR IFNULL(description,'') LIKE ?`)
      .all(like, like, like), 'person');
    push(db.prepare(`SELECT id, title, description, date, time, location FROM events
        WHERE title LIKE ? OR IFNULL(description,'') LIKE ? OR IFNULL(location,'') LIKE ?`)
      .all(like, like, like), 'event');
    push(db.prepare(`SELECT id, title, description, date, time, priority, completed FROM reminders
        WHERE title LIKE ? OR IFNULL(description,'') LIKE ?`)
      .all(like, like), 'reminder');
    push(db.prepare(`SELECT id, name AS title, relationship AS subtitle, phone, type FROM contacts
        WHERE name LIKE ? OR IFNULL(relationship,'') LIKE ? OR IFNULL(phone,'') LIKE ?`)
      .all(like, like, like), 'contact');
    return out;
  },

  getPeople() {
    return db.prepare(`SELECT * FROM people ORDER BY name COLLATE NOCASE`).all();
  },

  findPersonByName(name) {
    return db.prepare(`SELECT * FROM people WHERE lower(name) = lower(?)`).get(name);
  },

  getToday(key) {
    return db.prepare(`SELECT * FROM ${key} WHERE date = date('now','localtime') ORDER BY time`).all();
  },

  getTodayReminders() {
    return db.prepare(`SELECT * FROM reminders WHERE date = date('now','localtime') ORDER BY time`).all();
  },

  getUpcoming(key) {
    return db.prepare(`SELECT * FROM ${key} WHERE date >= date('now','localtime') ORDER BY date, time LIMIT 10`).all();
  },

  getRecentMemories(limit = 5) {
    return db.prepare(`SELECT * FROM memories ORDER BY date DESC, id DESC LIMIT ?`).all(limit);
  },

  getRecentEvents(limit = 10) {
    return db.prepare(`SELECT * FROM events ORDER BY date DESC, time DESC LIMIT ?`).all(limit);
  },

  getRoutines() {
    return db.prepare(`SELECT * FROM routines ORDER BY time`).all();
  },

  getContacts() {
    return db.prepare(`SELECT * FROM contacts ORDER BY name COLLATE NOCASE`).all();
  },

  getMemoriesByCategory(category) {
    return db.prepare(`SELECT * FROM memories WHERE category = ? ORDER BY date DESC`).all(category);
  },

  getMemoryStats() {
    const row = db.prepare(`SELECT COUNT(*) AS count FROM memories`).get();
    return row.count;
  },

  getTodayString() {
    return db.prepare(`SELECT date('now','localtime') AS d`).get().d;
  }
};
