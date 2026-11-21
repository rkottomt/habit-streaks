import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Habit, sanitizeHabits } from './habits';

const STORAGE_KEY = 'habits';

export class CorruptDataError extends Error {}

/** Loads habits. Throws on read failure; throws CorruptDataError if the stored data is unreadable. */
export async function loadHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  try {
    return sanitizeHabits(JSON.parse(raw));
  } catch (e) {
    throw new CorruptDataError(e instanceof Error ? e.message : 'Invalid data');
  }
}

export async function saveHabits(habits: Habit[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits));
}
