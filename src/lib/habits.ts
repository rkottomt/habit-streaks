export type Habit = {
  id: string;
  name: string;
  /** Local calendar dates in YYYY-MM-DD format. */
  completedDates: string[];
};

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
export const MAX_NAME_LENGTH = 60;

/** Formats a Date as YYYY-MM-DD using the device's local time zone. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses a YYYY-MM-DD key into a local-time Date (midday, to stay clear of DST edges). */
function fromDateKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
}

/** Returns the key for the day `offset` days from `key` (negative = earlier). */
export function shiftDateKey(key: string, offset: number): string {
  const date = fromDateKey(key);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
}

/** Last `count` days ending with `today`, oldest first (today is last). */
export function lastNDays(today: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => shiftDateKey(today, i - (count - 1)));
}

/**
 * Consecutive days completed counting back from today. If today isn't done yet,
 * counts back from yesterday so the streak doesn't reset in the morning.
 */
export function currentStreak(completedDates: string[], today: string): number {
  const done = new Set(completedDates);
  let day = today;
  if (!done.has(day)) {
    day = shiftDateKey(today, -1);
    if (!done.has(day)) return 0;
  }
  let streak = 0;
  while (done.has(day)) {
    streak++;
    day = shiftDateKey(day, -1);
  }
  return streak;
}

/** Longest run of consecutive completed days ever. */
export function longestStreak(completedDates: string[]): number {
  const sorted = [...new Set(completedDates)].sort();
  let longest = 0;
  let run = 0;
  let prev: string | null = null;
  for (const day of sorted) {
    run = prev !== null && shiftDateKey(prev, 1) === day ? run + 1 : 1;
    longest = Math.max(longest, run);
    prev = day;
  }
  return longest;
}

/** Returns an error message if the name is invalid, otherwise null. */
export function validateHabitName(name: string, existing: Habit[]): string | null {
  const trimmed = name.trim();
  if (!trimmed) return 'Please enter a habit name.';
  if (trimmed.length > MAX_NAME_LENGTH) {
    return `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }
  const lower = trimmed.toLocaleLowerCase();
  if (existing.some((h) => h.name.trim().toLocaleLowerCase() === lower)) {
    return 'You already have a habit with that name.';
  }
  return null;
}

export function createId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export type SanitizeResult = {
  habits: Habit[];
  /** True if anything was dropped or altered, i.e. saving `habits` would lose stored data. */
  lossy: boolean;
};

/** Validates untrusted stored data, dropping anything malformed and reporting whether it did. */
export function sanitizeHabits(value: unknown): SanitizeResult {
  if (!Array.isArray(value)) throw new Error('Stored habits are not a list');
  const seenIds = new Set<string>();
  const habits: Habit[] = [];
  let lossy = false;
  for (const item of value) {
    if (typeof item !== 'object' || item === null) {
      lossy = true;
      continue;
    }
    const { id, name, completedDates } = item as Record<string, unknown>;
    if (typeof id !== 'string' || !id || seenIds.has(id) || typeof name !== 'string' || !name.trim()) {
      lossy = true;
      continue;
    }
    const rawDates = Array.isArray(completedDates) ? completedDates : [];
    if (!Array.isArray(completedDates)) lossy = true;
    const validDates = rawDates.filter((d): d is string => typeof d === 'string' && DATE_KEY_RE.test(d));
    if (validDates.length !== rawDates.length) lossy = true;
    const cleanName = name.trim().slice(0, MAX_NAME_LENGTH);
    if (cleanName.length < name.trim().length) lossy = true;
    seenIds.add(id);
    // Removing duplicate dates doesn't lose information, so it doesn't count as lossy.
    habits.push({ id, name: cleanName, completedDates: [...new Set(validDates)] });
  }
  return { habits, lossy };
}
