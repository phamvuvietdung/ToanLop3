import { StudyRecord } from '../types';

const STORAGE_KEY = 'toan_lop3_study_history_v1';
const MAX_RECORDS = 100;

/**
 * Retrieve list of all past study sessions.
 */
export function getStudyHistory(): StudyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => b.timestamp - a.timestamp);
    }
    return [];
  } catch (err) {
    console.warn('Không thể đọc lịch sử học tập:', err);
    return [];
  }
}

/**
 * Save a new completed lesson record.
 */
export function saveStudyRecord(record: Omit<StudyRecord, 'id' | 'timestamp'>): StudyRecord {
  try {
    const history = getStudyHistory();
    const newRecord: StudyRecord = {
      ...record,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };

    const updated = [newRecord, ...history].slice(0, MAX_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return newRecord;
  } catch (err) {
    console.warn('Không thể lưu lịch sử học tập:', err);
    return {
      ...record,
      id: `${Date.now()}`,
      timestamp: Date.now(),
    };
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
 * Clear all study records.
 */
export function clearStudyHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('Không thể xóa lịch sử:', err);
  }
}
