// Auto-seed demo data on first boot if the database is empty.
import { seedDemoData } from './demoData.js';

export default function seedIfEmpty(db) {
  const row = db.prepare(
    `SELECT (SELECT COUNT(*) FROM users) + (SELECT COUNT(*) FROM memories) + (SELECT COUNT(*) FROM people) AS n`
  ).get();
  if (row.n > 0) return false;

  console.log('ℹ️  Database empty — seeding demo data...');
  seedDemoData(db);
  console.log('✅ Demo data created.');
  return true;
}
