import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const HISTORY_FILE = path.join(DATA_DIR, 'study_history.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    } catch (e) {
      console.warn('Could not create data dir:', e);
    }
  }
}

export interface ServerStudyRecord {
  id: string;
  lessonId: string;
  lessonTitle: string;
  score: number;
  totalScore: number;
  correctCount: number;
  totalQuestions: number;
  timestamp: number;
  source: 'ai' | 'smart_standard';
}

export function readServerHistory(): ServerStudyRecord[] {
  try {
    ensureDataDir();
    if (!fs.existsSync(HISTORY_FILE)) {
      return [];
    }
    const content = fs.readFileSync(HISTORY_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }
    return [];
  } catch (err) {
    console.warn('Error reading server history file:', err);
    return [];
  }
}

export function writeServerHistory(records: ServerStudyRecord[]): void {
  try {
    ensureDataDir();
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(records, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing server history file:', err);
  }
}
