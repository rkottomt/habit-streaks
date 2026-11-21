import { createContext, type ReactNode, use, useCallback, useEffect, useRef, useState } from 'react';

import { showAlert } from '@/lib/alert';
import { createId, type Habit, validateHabitName } from '@/lib/habits';
import { CorruptDataError, loadHabits, saveHabits } from '@/lib/storage';

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
  // Serializes writes so they land in the order they were made.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const applyLoaded = useCallback((loaded: Habit[]) => {
    habitsRef.current = loaded;
    setHabits(loaded);
    setStatus('ready');
  }, []);

  const handleLoadError = useCallback(
    (e: unknown) => {
      if (e instanceof CorruptDataError) {
        // Stored data can't be recovered; start fresh rather than leaving the app unusable.
        applyLoaded([]);
        showAlert('Could not read saved habits', 'Your saved data was damaged and has been reset.');
      } else {
        // Don't allow edits: saving now would overwrite data we failed to read.
        setStatus('error');
        showAlert('Could not load habits', 'Something went wrong loading your habits. Please try again.');
      }
    },
    [applyLoaded],
  );

  useEffect(() => {
    loadHabits().then(applyLoaded, handleLoadError);
  }, [applyLoaded, handleLoadError]);

  const reload = useCallback(() => {
    setStatus('loading');
    loadHabits().then(applyLoaded, handleLoadError);
  }, [applyLoaded, handleLoadError]);

  const commit = useCallback((next: Habit[]) => {
    habitsRef.current = next;
    setHabits(next);
    saveQueue.current = saveQueue.current
      .then(() => saveHabits(next))
      .catch(() => {
        showAlert('Could not save', 'Your latest change may not be saved. Please try again.');
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
