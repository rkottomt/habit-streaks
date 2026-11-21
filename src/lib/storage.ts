import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Habit, sanitizeHabits } from './habits';

const STORAGE_KEY = 'habits';
const BACKUP_KEY_PREFIX = 'habits.backup.';

export type LoadResult = {
  habits: Habit[];
  /**
   * 'ok': data loaded as stored.
   * 'partial': some entries were malformed and dropped.
   * 'reset': the stored data was unreadable and nothing could be recovered.
   * For 'partial' and 'reset', the original raw value was backed up first.
   */
  recovery: 'ok' | 'partial' | 'reset';
};

/** Copies the raw stored value to a timestamped key so later saves can't destroy it. */
async function backupRaw(raw: string): Promise<void> {
  await AsyncStorage.setItem(`${BACKUP_KEY_PREFIX}${Date.now()}`, raw);
}

/**
 * Loads habits. Throws if storage can't be read, or if damaged data couldn't be backed up.
 * In both cases the caller must not save, or it would overwrite data we couldn't preserve.
 */
export async function loadHabits(): Promise<LoadResult> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return { habits: [], recovery: 'ok' };

  let parsed: ReturnType<typeof sanitizeHabits> | null = null;
  try {
    parsed = sanitizeHabits(JSON.parse(raw));
  } catch {
    parsed = null;
  }

  if (parsed && !parsed.lossy) return { habits: parsed.habits, recovery: 'ok' };

  await backupRaw(raw);
  return parsed
    ? { habits: parsed.habits, recovery: 'partial' }
    : { habits: [], recovery: 'reset' };
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}
