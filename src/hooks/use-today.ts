import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { toDateKey } from '@/lib/habits';

/** Today's local date key; updates at midnight and when the app returns to the foreground. */
export function useToday(): string {
  const [today, setToday] = useState(() => toDateKey(new Date()));

  useEffect(() => {
    const refresh = () => setToday(toDateKey(new Date()));

    const now = new Date();
    const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const timer = setTimeout(refresh, nextMidnight.getTime() - now.getTime() + 1000);

    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      clearTimeout(timer);
      sub.remove();
    };
  }, [today]);

  return today;
}
