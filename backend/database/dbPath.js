import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..');
const DB_PATH = path.join(DATA_DIR, 'memory_assistant.db');

export default DB_PATH;
