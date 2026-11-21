import { createContext, type ReactNode, use, useCallback, useEffect, useRef, useState } from 'react';

import { showAlert } from '@/lib/alert';
import { createId, type Habit, validateHabitName } from '@/lib/habits';
import { loadHabits, type LoadResult, saveHabits } from '@/lib/storage';

type Status = 'loading' | 'ready' | 'error';

type HabitsContextValue = {
  habits: Habit[];
  status: Status;
  reload: () => void;
  /** Adds a habit. Returns an error message if the name is invalid, otherwise null. */
  addHabit: (name: string) => string | null;
  /** Checks or unchecks the habit for the given day. */
  toggleDay: (id: string, day: string) => void;
  deleteHabit: (id: string) => void;
};

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  // Source of truth for mutations so rapid taps never work from a stale snapshot.
  const habitsRef = useRef<Habit[]>([]);
  // The last list known to be in storage; what the UI rolls back to if a save fails.
  const persistedRef = useRef<Habit[]>([]);
  // Serializes writes so they land in the order they were made.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const handleLoaded = useCallback(({ habits: loaded, recovery }: LoadResult) => {
    habitsRef.current = loaded;
    persistedRef.current = loaded;
    setHabits(loaded);
    setStatus('ready');
    // In both recovery cases the original data was already backed up by loadHabits.
    if (recovery === 'reset') {
      showAlert(
        'Could not read saved habits',
        "Your saved data was damaged and couldn't be read, so your list was reset. A backup of the original data was kept on this device.",
      );
    } else if (recovery === 'partial') {
      showAlert(
        'Some habits could not be read',
        'Part of your saved data was damaged and was skipped. A backup of the original data was kept on this device.',
      );
    }
  }, []);

  const handleLoadError = useCallback(() => {
    // Don't allow edits: saving now would overwrite data we failed to read or back up.
    setStatus('error');
    showAlert('Could not load habits', 'Something went wrong loading your habits. Please try again.');
  }, []);

  useEffect(() => {
    loadHabits().then(handleLoaded, handleLoadError);
  }, [handleLoaded, handleLoadError]);

  const reload = useCallback(() => {
    setStatus('loading');
    loadHabits().then(handleLoaded, handleLoadError);
  }, [handleLoaded, handleLoadError]);

  const commit = useCallback((next: Habit[]) => {
    habitsRef.current = next;
    setHabits(next);
    saveQueue.current = saveQueue.current.then(async () => {
      try {
        await saveHabits(next);
        persistedRef.current = next;
      } catch {
        // If newer changes are queued they already include this one and will save it again,
        // so only the latest change decides. Rolling back then keeps the UI matching storage.
        if (habitsRef.current !== next) return;
        habitsRef.current = persistedRef.current;
        setHabits(persistedRef.current);
        showAlert('Could not save', "Your recent changes couldn't be saved and were undone. Please try again.");
      }
    });
  }, []);

  const addHabit = useCallback(
    (name: string) => {
      if (status !== 'ready') return 'Habits are still loading. Please try again.';
      const error = validateHabitName(name, habitsRef.current);
      if (error) return error;
      commit([...habitsRef.current, { id: createId(), name: name.trim(), completedDates: [] }]);
      return null;
    },
    [commit, status],
  );

  const toggleDay = useCallback(
    (id: string, day: string) => {
      if (status !== 'ready') return;
      commit(
        habitsRef.current.map((h) =>
          h.id !== id
            ? h
            : {
                ...h,
                completedDates: h.completedDates.includes(day)
                  ? h.completedDates.filter((d) => d !== day)
                  : [...h.completedDates, day],
              },
        ),
      );
    },
    [commit, status],
  );

  const deleteHabit = useCallback(
    (id: string) => {
      if (status !== 'ready') return;
      commit(habitsRef.current.filter((h) => h.id !== id));
    },
    [commit, status],
  );

  return (
    <HabitsContext value={{ habits, status, reload, addHabit, toggleDay, deleteHabit }}>
      {children}
    </HabitsContext>
  );
}

export function useHabits(): HabitsContextValue {
  const ctx = use(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used inside HabitsProvider');
  return ctx;
}
