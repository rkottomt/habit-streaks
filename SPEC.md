# Habit Streaks

## What it is
An app where you add habits you want to do every day (like drinking water or reading), check them off each day, and see how many days in a row you've kept it up. Made with Expo SDK [XX] and Expo Router. Everything is saved on the phone, no login.

## Screens

**Home screen** (src/app/index.tsx)

At the top there's a title, "Habit Streaks", and a text box with an Add button to make a new habit. Below that is the list of habits. Each one shows its name, its streak (like 🔥 5), and a circle button you tap to check it off for today. Tapping it again unchecks it. Tapping the habit itself (not the circle) opens the detail screen. If there are no habits it should say "No habits yet. Add one above."

**Detail screen** (src/app/habit/[id].tsx)

Shows the habit name, the current streak, and the longest streak ever. Below that is a row of 7 circles for the last 7 days (today on the right), filled in if you did it that day. At the bottom is a red Delete button that asks "Are you sure?" before deleting and then goes back home.

## Saving data
Habits are saved in AsyncStorage under the key "habits" as a list. Each habit has:
- id
- name
- completedDates (a list of dates like "2026-11-21")

Dates should use the phone's local time so checking something off late at night still counts for that day.

## How streaks work
The streak is how many days in a row the habit was checked off, counting back from today. If you haven't checked it off today yet but did yesterday, the streak should still count from yesterday so it doesn't drop to 0 in the morning. If you missed both today and yesterday, it's 0.

Longest streak is the longest run of days in a row ever.

## Rules
- You can't add a habit with a blank name or the same name as one that already exists. Show a short error message if you try.
- If saving or loading breaks, show an alert instead of crashing.

## Design
Off-white background (#F7F7F2), orange for buttons and the streak (#FF7A45), dark gray text (#2B2B2B), and red for delete (#D64545). Habits are shown as white cards with rounded corners. Text should be easy to read and nothing should be hidden under the notch.

## Not doing
Notifications, accounts, syncing, editing old days, renaming habits.

## Acceptance criteria
1. With no habits, the home screen shows the empty message.
2. Typing "Read" and tapping Add puts "Read" in the list with a streak of 0 and clears the text box.
3. Tapping Add with nothing typed shows an error and doesn't add anything.
4. Adding a habit with a name that already exists (even with different capitalization) shows an error.
5. Tapping the circle checks off the habit and the streak goes from 0 to 1 right away.
6. Tapping the circle again unchecks it and the streak goes back down.
7. Tapping a habit opens its detail screen with the right name.
8. The detail screen shows 7 circles with today on the right, and today is filled in if it was checked off.
9. A habit checked off yesterday but not today still shows a streak of 1.
10. Longest streak is never smaller than the current streak.
11. Delete asks for confirmation. Cancel keeps the habit, and confirming removes it and goes back home.
12. After going back from the detail screen, the home screen shows the correct streaks without reloading.
13. After closing Expo Go completely and opening the app again, all habits and check-offs are still there.