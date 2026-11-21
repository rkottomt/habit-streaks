# Prompt Log

**Tools used:** Claude (claude.ai chat) for planning, ideas, and the spec draft. Claude Code in the terminal for building, reviewing, fixing, and explaining code.

---

## Orientation (Claude Code)

> I'm brand new to React Native. I'm on Expo SDK 58 with Expo Router. Read package.json, src/app/index.tsx, and src/app/_layout.tsx. Explain at a high level how these files create a working app, how a file in src/app/ becomes a screen, and what _layout.tsx is for. Also tell me if there's an AGENTS.md, CLAUDE.md, or .claude/settings.json in this project and what it tells AI tools to do. Don't change any files.

Learned that each file in src/app/ is a screen and _layout.tsx sets up the navigator. There was an AGENTS.md in the project.

> Explain with a tiny example each: how a View is different from a div, what useState does, and how to add a Button and a TextInput to a screen. Then change the welcome text in index.tsx to "Hello from Rohit" so I can see hot reload work.

Learned that useState re-renders the screen when the value changes. The text updated on my phone right after saving.

> Create an empty file called SPEC.md at the root of this project and open it in VS Code with `code SPEC.md`. Don't write anything in it. I'll paste my spec in myself.

Made the empty file. The `code` command wasn't installed, so it opened VS Code a different way.

## Build (Claude Code, fresh session)

> /clear

> Read SPEC.md in this project. Implement the full mobile app exactly as specified.
> This is an Expo project using Expo Router, so screens belong in src/app/.
> Check package.json for the exact Expo SDK version (58) and write code for that version.
> Use npx expo install for any packages (like @react-native-async-storage/async-storage) so versions match the SDK.
> Create all necessary files, components, and navigation. Make sure that appropriate data is persistent.
> Avoid security risks for sensitive data. Include proper error handling.
> Make sure the app starts without errors and displays the home screen correctly. Run npx tsc --noEmit to check for type errors before finishing.

It built the home and detail screens, storage code, and a habits context. It also ran type checks and lint.

> Commit everything "Raw agentic build output"

## Review (Claude Code, fresh session)

> /clear

> Review the React Native/Expo code in this project against the spec in SPEC.md.
> For each acceptance criterion in the spec, verify whether the code actually implements it correctly.
> Also check for:
> - Bugs or logic errors
> - Missing error handling
> - Code quality issues (unclear naming, repeated code, etc.)
> - Best practices for React Native or other technologies
>
> Format your review as a numbered list of findings, each marked as [PASS], [FAIL], or [WARN].
> Be specific. Reference file names and line numbers.
> Do not fix anything in this session. Report only.
> Export the review as REVIEW.md at the root of the project.

Got 28 findings: 17 PASS, 11 WARN, 0 FAIL.

> Commit "Add REVIEW.md"

## Fixes (Claude Code)

> Read Review.MD. Fix findings #18, #19, #20, #24, #25. Don't edit REVIEW.md. For each fix, explain in 1-2 sentences what was wrong and why the change fixes it.

Fixed the delete screen flash, rollback when a save fails, backup of broken data, and leftover template files and packages.

> Commit "Fixes after AI review"

## Learning (Claude Code)

> Walk me through src/app/index.tsx and src/app/habit/[id].tsx at a beginner level. Explain: how habits are loaded from and saved to AsyncStorage, why useEffect or useFocusEffect is used, what SafeAreaView does, how the [id] in the filename works, and how the streak is calculated.

Learned that AsyncStorage only stores strings, so the list is saved as JSON. Also learned that [id] in the filename makes a dynamic route.

## Polish (Claude Code)

> Polish the visuals to match the Design section of SPEC.md: consistent colors, clear titles on every screen, buttons that look tappable with a pressed state, readable text, good spacing, and a nice empty state. Don't change any functionality. Then give me every acceptance criterion as a checklist I can test on my phone.

Restyled the screens and added a shared Button component. I used the checklist to test on my phone.

## Documentation (Claude Code)

> I'm going to handwrite my README.md and prompt_log.md myself, so DO NOT write either file. Instead, gather the raw information I need and print it in the terminal as plain notes. Don't create or edit any files.
>
> 1. Project facts: Expo SDK version and key package versions from package.json, Node version (run node --version), every screen file in src/app/ and what each one shows and lets the user do, the AsyncStorage key and data shape used, and the exact commands to install and run.
>
> 2. Git history: run git log --oneline and list each commit with its message and date.
>
> 3. Review results: from REVIEW.md, list every finding number with its [PASS]/[FAIL]/[WARN] tag and a one-line summary. Then check the current code and tell me which [FAIL]/[WARN] items look fixed now and which don't.
>
> 4. My prompts: look in ~/.claude/projects/ for the session history files for this project folder. Extract every message I (the user) typed, in order, VERBATIM. Don't summarize, reword, or fix typos. For each, include the timestamp and a one-line note of what you did in response. Leave out tool output and your own replies.
>
> 5. Things that might surprise a beginner: list 5 short facts about how this app works that differ from web development (e.g. View vs div, how Expo Go loads code, file-based routing). Just facts, no full sentences written for me.
>
> Format everything as plain bullet notes under those 5 headings.

Got notes on versions, commits, review status, and my prompts to use for the README and this log.

## Manual interventions
- I accidentally ran `mkdir habit` and started Expo in an empty folder, so I deleted it and used `my-app` instead.
- I set the SDK in the spec to 58 and pasted it into SPEC.md myself.
- I picked which review findings to fix and which to skip.