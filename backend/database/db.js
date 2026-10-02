import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import DB_PATH from './dbPath.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function openDb() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  return db;
}

export { __dirname as dbDirname };
