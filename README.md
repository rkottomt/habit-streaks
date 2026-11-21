# Habit Streaks

## What it does and why
Habit Streaks lets you add daily habits, check them off each day, and see how many days in a row you've kept them up. I picked it because I always forget my habits after a few days, and seeing a streak number makes me want to keep it going.

## Screens
**Home:** Shows today's date, a text box to add a habit, and your habits as cards with a 🔥 streak count. Tap the circle to check off today, or tap the card to open its details.

**Habit details:** Shows the current streak, the longest streak, and the last 7 days as circles. You can also delete the habit here after confirming.

## Setup and running
1. Install Node.js 22.13 or newer (I used Node 24.13.0).
2. Clone the repo, then run:
   ```
   npm install
   npx expo login
   npx expo start
   ```
3. Install Expo Go on your phone and sign in with the same Expo account as the CLI.
4. Connect your phone to the same Wi-Fi as your computer, then scan the QR code (iPhone: Camera app, Android: inside Expo Go). If it won't connect, use `npx expo start --tunnel`.

Built with **Expo SDK 58** and Expo Router. Tested on my iPhone using Expo Go.

## What surprised me
I was surprised that the phone just downloads the code from my laptop over Wi-Fi and updates as soon as I save a file. I also didn't expect that each file in `src/app/` automatically becomes its own screen.

## Review findings I didn't fix
- **#21, #22:** "Habit not found" showing on a load error, and the id possibly being an array, are edge cases I couldn't trigger in normal use.
- **#23:** Screen reader labels using raw dates is a fair point, but accessibility was out of scope for this version.
- **#26, #27:** These were partly fixed in polish. The leftover parts are small code style issues that don't change how the app works.
- **#28:** I tested the streak logic by hand on my phone instead of adding a test framework, to keep the project small.