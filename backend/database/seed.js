import { openDb } from './db.js';
import { runSchema } from './schema.js';
import { seedDemoData, clearAll } from './demoData.js';

const db = openDb();
runSchema(db);
clearAll(db);
seedDemoData(db);

const counts = {};
for (const t of ['users', 'memories', 'people', 'reminders', 'routines', 'contacts', 'events']) {
  counts[t] = db.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get().n;
}
console.log('✅ Database reseeded:', counts);
db.close();
