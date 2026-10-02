import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// The SQL lives in schema.sql so there is a single, readable source of truth.
const SCHEMA = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

export function runSchema(db) {
  db.exec(SCHEMA);
}

export default runSchema;
