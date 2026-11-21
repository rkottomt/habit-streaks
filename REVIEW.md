# Code Review: Habit Streaks vs. SPEC.md

**Reviewed:** 2026-11-21, commit `ef7fe2a` ("Raw agentic build output")
**Scope:** `src/app/`, `src/components/habit-card.tsx`, `src/context/`, `src/hooks/use-today.ts`, `src/lib/`, `src/constants/colors.ts`, `app.json`, `package.json`
**Method:** Static read of the code against each section of SPEC.md, plus tool checks. The app was not run on a device, so the PASS results below come from tracing the code, not from manual testing.

## Tool results

| Check | Result |
|---|---|
| `npx tsc --noEmit` | Clean, no errors |
| `npx expo lint` | **1 error**: `react-hooks/set-state-in-effect` in `src/hooks/use-color-scheme.web.ts:11`. This is a leftover template file the app never uses (see #24) |
| `npx expo-doctor` | 20/20 checks passed |

## Summary

| | Count |
|---|---|
| PASS | 17 |
| WARN | 11 |
| FAIL | 0 |

All 13 acceptance criteria are implemented. None of the findings is a spec violation. The most important warnings are #18 (screen flashes on delete), #19 (a failed save leaves the UI showing data that isn't stored), #20 (corrupt or partly malformed data is silently overwritten), and #24/#25 (leftover template code and dependencies, including the only lint error).

---

## Acceptance criteria

1. **[PASS] AC1: Empty state message.** `src/app/index.tsx:86` renders `ListEmptyComponent` with exactly "No habits yet. Add one above." It only appears once `status === 'ready'` (`index.tsx:67-90`); a spinner shows while loading, which is correct.

2. **[PASS] AC2: Adding "Read" shows it with streak 0 and clears the input.** `addHabit` (`src/context/habits-context.tsx:70-79`) appends `{ id, name: name.trim(), completedDates: [] }`. On success `handleAdd` clears the input (`index.tsx:21-23`). `currentStreak([] , today)` returns 0 (`src/lib/habits.ts:44-46`), and the card shows `🔥 0` (`src/components/habit-card.tsx:27`).

3. **[PASS] AC3: Blank name shows an error and adds nothing.** `validateHabitName` returns "Please enter a habit name." for empty or whitespace-only input (`habits.ts:72-73`). The error displays at `index.tsx:61-65` and nothing is committed.

4. **[PASS] AC4: Duplicate name, case-insensitive, shows an error.** `habits.ts:77-79` compares trimmed, `toLocaleLowerCase()` names, so "read" and " READ " are rejected when "Read" exists. It uses `habitsRef.current` (`habits-context.tsx:73`), so two fast taps can't both pass validation. *Minor:* `toLocaleLowerCase()` depends on the device locale (for example Turkish dotted/dotless I), and there is no Unicode normalization, so visually identical names in different forms (`é` vs `é`) are not caught. This is edge-case only.

5. **[PASS] AC5: Tapping the circle checks it and the streak goes 0 → 1 immediately.** `toggleDay` (`habits-context.tsx:81-98`) adds today to `completedDates`, and `commit` updates state synchronously before the async save (`habits-context.tsx:60-68`). The card recomputes the streak on render (`habit-card.tsx:15`).

6. **[PASS] AC6: Tapping again unchecks it and the streak goes down.** The same toggle removes the date when present (`habits-context.tsx:90-92`).

7. **[PASS] AC7: Tapping the habit opens the detail screen with the right name.** The name/streak area is a separate `Link`-wrapped `Pressable` (`habit-card.tsx:19-29`) from the circle (`habit-card.tsx:30-38`), so tapping the card doesn't toggle it. The detail screen finds the habit by `id` (`src/app/habit/[id].tsx:18`) and shows the name in the header and body (`[id].tsx:48`, `52-54`).

8. **[PASS] AC8: 7 circles, today on the right, filled when done.** `lastNDays(today, 7)` returns the dates oldest first with today last (`habits.ts:33-35`). Each circle is filled when its date is in `completedDates` (`[id].tsx:70-80`), and today is labelled "Today" (`[id].tsx:81-83`).

9. **[PASS] AC9: Checked yesterday but not today still shows streak 1.** `currentStreak` falls back to yesterday when today is missing, and returns 0 only when both are missing (`habits.ts:44-47`). This matches the spec's streak rules exactly.

10. **[PASS] AC10: Longest streak is never smaller than current.** `longestStreak` (`habits.ts:57-68`) finds the longest run of consecutive days, and the current streak is always one of those runs, so the property holds mathematically. `[id].tsx:29` also wraps it in `Math.max(..., current)` (see #26).

11. **[PASS] AC11: Delete asks for confirmation; Cancel keeps the habit; confirm deletes and goes home.** `confirmDestructive` (`src/lib/alert.ts:13-32`) shows Cancel and Delete. Cancel, or dismissing the dialog on Android, resolves `false`, and `handleDelete` returns early (`[id].tsx:39`). On confirm it navigates back (or replaces to `/` for deep links) and deletes (`[id].tsx:40-43`). The message starts with "Are you sure?" (`[id].tsx:36`). On web it uses `window.confirm` because `Alert.alert` does nothing there (`alert.ts:18-20`). See #18 for a visual problem in this flow.

12. **[PASS] AC12: Home shows the correct streaks after coming back, with no reload.** Both screens read from the same `HabitsProvider` context (`src/app/_layout.tsx:23`), so changes made on the detail screen show on home immediately.

13. **[PASS] AC13: Data survives a full close and reopen of Expo Go.** Every change is written to AsyncStorage under `"habits"` (`src/lib/storage.ts:5`, `20-22`) through a queue that keeps writes in order (`habits-context.tsx:63-67`), and it is loaded on mount (`habits-context.tsx:51-53`). The splash screen stays up until loading finishes (`_layout.tsx:12-18`). *Caveat:* a change made in the few milliseconds before the app is killed could be lost while its write is still queued. That's unavoidable with this storage layer, and fine in practice.

## Other spec requirements

14. **[PASS] Data model and local-time dates.** The `Habit` type matches the spec (`habits.ts:1-6`). `toDateKey` uses local `getFullYear/getMonth/getDate`, not `toISOString()` (`habits.ts:12-17`), so a check-off at 11:30 PM counts for that day. `fromDateKey` parses dates at midday so daylight-saving changes don't break day arithmetic (`habits.ts:20-23`). `useToday` rolls over at midnight and when the app returns to the foreground (`src/hooks/use-today.ts:10-24`).

15. **[PASS] Rule: load and save failures show an alert instead of crashing.** Load errors and corrupt data both show alerts (`habits-context.tsx:36-49`). Save errors are caught and show an alert (`habits-context.tsx:65-67`). A failed read blocks edits so a save can't overwrite data the app couldn't read (`habits-context.tsx:43-44`, `72`, `83`, `102`), and a Retry button is offered (`index.tsx:69-75`). This is good defensive design, but see #19 and #20.

16. **[PASS] Design colors, white rounded cards, safe areas.** `src/constants/colors.ts` has the exact spec colors (`#F7F7F2`, `#FF7A45`, `#2B2B2B`, `#D64545`). Cards are white with `borderRadius: 16` (`habit-card.tsx:44-54`). Home uses `SafeAreaView` on the top, left and right edges (`index.tsx:28`), with list bottom padding of 40 (`index.tsx:146`). The detail screen sits under a native header and adds the bottom inset (`[id].tsx:51`). Body text is 15–18pt and the delete button is red at the bottom (`[id].tsx:90-97`).

17. **[PASS] Error message clears as the user types.** `index.tsx:37-40`. It's not required by the spec, but it makes the "short error message" rule feel right.

## Bugs and logic issues

18. **[WARN] The detail screen flashes "Habit not found." during the back animation after delete.** `[id].tsx:41-43` calls `router.back()` and then `deleteHabit()` right away. The detail screen stays mounted during the pop transition, re-renders with `habit === undefined`, and shows the `missing` view (`[id].tsx:20-26`). The header title also snaps back from the habit name to "Habit" (`_layout.tsx:35`). Users will likely see this briefly on iOS. Fix options: keep a snapshot of the last-seen habit for rendering, or delete after the transition ends.

19. **[WARN] A failed save leaves the UI showing a change that isn't stored.** `commit` updates `habitsRef` and React state before the save, and the `.catch` only alerts (`habits-context.tsx:60-68`). It never rolls back. After a failed save the screen shows a check-off or new habit that will be gone on the next launch, unless a later save succeeds (each save writes the full list, so the next successful one does fix it). The alert text ("may not be saved") admits this. Also, several quick taps that all fail will show one alert per tap.

20. **[WARN] Corrupt or partly malformed stored data is silently overwritten for good.** On `CorruptDataError` the app resets to `[]` (`habits-context.tsx:38-41`), and the next save replaces the original raw value. `sanitizeHabits` also silently drops individual malformed habits and dates (`habits.ts:93-103`) with **no** alert, and the next save deletes them from storage. The spec only asks for "alert instead of crashing", so this meets it, but backing up the raw value (for example to `habits.corrupt`) before overwriting would avoid permanent loss.

21. **[WARN] "Habit not found." also shows when loading failed.** `[id].tsx:23` checks only for `'loading'`. With `status === 'error'` (for example opened by deep link) the user sees "Habit not found." when the real problem is a load failure.

22. **[WARN] The route parameter type is assumed to be a string.** `useLocalSearchParams<{ id: string }>()` (`[id].tsx:14`) is only a type assertion. A URL like `/habit/a?id=b` can make `id` a `string[]`. `find` then simply fails and shows "Habit not found.", so it won't crash, but normalizing it (`Array.isArray(id) ? id[0] : id`) would be more robust.

23. **[WARN] The screen-reader label for each day reads a raw ISO date.** `[id].tsx:79` produces labels like "2026-11-20: done", which VoiceOver/TalkBack read awkwardly. A weekday or `toLocaleDateString()` label would be clearer.

## Code quality

24. **[WARN] Unused template code is still in the repo, and it causes the only lint error.** None of these are imported by app code; they only reference each other: `src/components/animated-icon.tsx`, `animated-icon.web.tsx`, `animated-icon.module.css`, `external-link.tsx`, `hint-row.tsx`, `themed-text.tsx`, `themed-view.tsx`, `web-badge.tsx`, `ui/collapsible.tsx`, `src/constants/theme.ts`, `src/hooks/use-color-scheme.ts`, `use-color-scheme.web.ts`, `use-theme.ts`. `use-color-scheme.web.ts:11` fails `npx expo lint`. `package.json:18` also still has the `reset-project` script.

25. **[WARN] Unused dependencies and template app config.**
    - `package.json` includes packages the habit app doesn't use (`@expo/ui`, `expo-glass-effect`, `expo-symbols`, `expo-image`, `expo-web-browser`, `expo-device`, probably `react-native-reanimated`/`worklets`, depending on what the template files above need). They add install size and native code.
    - `app.json:3-4`: the app `name`/`slug` are still `"my-app"`, not "Habit Streaks", which is what shows under the home-screen icon. `scheme` is `"myapp"` (`app.json:8`), and the Android adaptive icon background is the template's `#E6F4FE` (`app.json:15`).
    - `app.json:24` sets `web.output: "server"`, which needs a server runtime to deploy. For a local-only app with no API routes, `"static"` is a better fit.

26. **[WARN] Duplicated or redundant logic.**
    - `[id].tsx:72-73` parses `YYYY-MM-DD` again by hand to get the weekday, repeating the private `fromDateKey` in `habits.ts:20-23` (and without its midday safeguard). Exporting a helper such as `weekdayOf(key)` from `habits.ts` would remove the copy.
    - `Math.max(longestStreak(...), current)` (`[id].tsx:29`) is mathematically unnecessary (#10). If `longestStreak` ever had a bug, this would hide it instead of letting it show. Either remove it, or keep it with a comment and cover the property with a test (#28).
    - The `pressed: { opacity: 0.6 }` style and the white bold button-text style are repeated in `index.tsx:131-138`, `[id].tsx:192-199`, and `habit-card.tsx:86-88`.

27. **[WARN] Rendering patterns that are minor now but grow with list size.**
    - `ItemSeparatorComponent={() => <View .../>}` (`index.tsx:85`) creates a new component type on every render, and the `onToggle` arrow is new on every render (`index.tsx:81`). The React Compiler (`app.json:31`) probably memoizes these, but defining the separator outside the component is the usual pattern and doesn't rely on the compiler.
    - The context `value` object is rebuilt on every provider render (`habits-context.tsx:109`), so every consumer re-renders. Again, the compiler probably covers this.
    - `completedDates.includes(today)` (`habit-card.tsx:14`) and the `Set` rebuilds in `currentStreak`/`longestStreak` scan the whole history on each render. That's trivial for years of daily data, so no action is needed.
    - The Retry button reuses `styles.addButton` but has no pressed feedback, unlike every other button (`index.tsx:72`).

28. **[WARN] There are no tests for the streak and date logic.** `src/lib/habits.ts` holds pure functions (`currentStreak`, `longestStreak`, `lastNDays`, `shiftDateKey`, `validateHabitName`, `sanitizeHabits`) that are easy to unit-test and are the core of the app. ACs 4, 9 and 10, plus DST, month and year boundaries, can all be checked without a device. No test runner is configured in `package.json`.

## Spec gaps (not code issues)

- `SPEC.md:4` still says "Expo SDK [XX]". The project uses SDK 58 (`package.json:9`).
- The spec doesn't say whether stored names are trimmed or how long they can be. The code trims, caps names at 60 characters (`habits.ts:9`, `index.tsx:44`), and rejects whitespace-only names. These are reasonable choices, but worth writing into the spec.
