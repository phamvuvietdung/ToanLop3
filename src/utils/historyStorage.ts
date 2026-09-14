import { StudyRecord } from '../types';

const STORAGE_KEY = 'toan_lop3_study_history_v1';
const MAX_RECORDS = 100;

// Internal cache
let memoryHistoryCache: StudyRecord[] | null = null;

/**
 * Retrieve list of all past study sessions.
 * Synchronously reads from memory/localStorage for instant UI rendering.
 */
export function getStudyHistory(): StudyRecord[] {
  if (memoryHistoryCache !== null) {
    return memoryHistoryCache;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      memoryHistoryCache = [];
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      memoryHistoryCache = parsed.sort((a, b) => b.timestamp - a.timestamp);
      return memoryHistoryCache;
    }
    memoryHistoryCache = [];
    return [];
  } catch (err) {
    console.warn('Không thể đọc lịch sử học tập:', err);
    memoryHistoryCache = [];
    return [];
  }
}

/**
 * Syncs local history with the server (runs in background on app start or modal open)
 * Returns the merged history list.
 */
export async function syncHistoryWithServer(): Promise<StudyRecord[]> {
  try {
    const local = getStudyHistory();
    const res = await fetch('/api/history/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localHistory: local }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.history)) {
        memoryHistoryCache = data.history;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.history));
        return data.history;
      }
    }
  } catch (err) {
    console.debug('Background history sync offline/skipped:', err);
  }
  return getStudyHistory();
}

/**
 * Save a new completed lesson record:
 * 1. Saves immediately to localStorage and memory (instant UX)
 * 2. Asynchronously persists to the server so publish/push doesn't lose it
 */
export function saveStudyRecord(record: Omit<StudyRecord, 'id' | 'timestamp'>): StudyRecord {
  const currentHistory = getStudyHistory();
  const newRecord: StudyRecord = {
    ...record,
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: Date.now(),
  };

  const updated = [newRecord, ...currentHistory.filter((h) => h.id !== newRecord.id)].slice(0, MAX_RECORDS);
  memoryHistoryCache = updated;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Không thể ghi localStorage:', err);
  }

  // Push to server in background
  fetch('/api/history', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newRecord),
  }).catch((e) => console.debug('Server record backup skipped:', e));

  return newRecord;
}

/**
 * Export history as JSON file for manual backup
 */
export function exportHistoryAsJson(): void {
  const history = getStudyHistory();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `lich_su_hoc_toan_3_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Import history from JSON string or file
 */
export function importHistoryFromJson(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) return false;

    const validRecords: StudyRecord[] = parsed.filter(
      (item) => item && typeof item.lessonId === 'string' && typeof item.score === 'number'
    );

    if (validRecords.length === 0) return false;

    // Merge with current
    const current = getStudyHistory();
    const map = new Map<string, StudyRecord>();
    for (const r of current) map.set(r.id, r);
    for (const r of validRecords) {
      if (!map.has(r.id) || (r.timestamp || 0) > (map.get(r.id)!.timestamp || 0)) {
        map.set(r.id, r);
      }
    }

    const merged = Array.from(map.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_RECORDS);

    memoryHistoryCache = merged;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));

    // Send merged to server
    fetch('/api/history/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ localHistory: merged }),
    }).catch((e) => console.debug('Sync after import skipped:', e));

    return true;
  } catch (err) {
    console.warn('Lỗi import lịch sử:', err);
    return false;
  }
}

/**
 * Get map of highest score for each lessonId to render badges in TOC.
 */
export function getLessonProgressMap(): Record<
  string,
  {
    bestScore: number;
    bestPercentage: number;
    attemptsCount: number;
    lastPracticedAt: number;
  }
> {
  const history = getStudyHistory();
  const map: Record<
    string,
    {
      bestScore: number;
      bestPercentage: number;
      attemptsCount: number;
      lastPracticedAt: number;
    }
  > = {};

  for (const item of history) {
    const percentage =
      item.totalQuestions > 0
        ? Math.round((item.correctCount / item.totalQuestions) * 100)
        : 0;

    if (!map[item.lessonId]) {
      map[item.lessonId] = {
        bestScore: item.score,
        bestPercentage: percentage,
        attemptsCount: 1,
        lastPracticedAt: item.timestamp,
      };
    } else {
      map[item.lessonId].attemptsCount += 1;
      if (percentage > map[item.lessonId].bestPercentage) {
        map[item.lessonId].bestPercentage = percentage;
        map[item.lessonId].bestScore = item.score;
      }
      if (item.timestamp > map[item.lessonId].lastPracticedAt) {
        map[item.lessonId].lastPracticedAt = item.timestamp;
      }
    }
  }

  return map;
}

/**
 * Clear all study records from both local storage and server.
 */
export function clearStudyHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    memoryHistoryCache = [];
    fetch('/api/history', { method: 'DELETE' }).catch((e) => console.debug('Server clear skipped:', e));
  } catch (err) {
    console.warn('Không thể xóa lịch sử:', err);
  }
}
