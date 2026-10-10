# Grade School

An original single-player classroom game for PocketVM, inspired by the quick teacher-and-papers loop of [Papers Grade Please](https://www.yiv.com/Papers-Grade-Please). All classroom artwork, characters, questions, audio and interface code in this package were created for this game.

Read a student's answer and stamp **A+** when it is correct or **F** when it is incorrect. Feedback explains every answer. Career starts with Maths and English; Science and Geography unlock on day 2, History and Art & logic on day 3. Whole worksheets and principal inspections start on day 5. Classroom incidents ask you to judge the evidence and pick a fair response.

Whole worksheets contain four independently marked answers: **4 correct = A+, 3 = B, 2 = C, 1 = D, 0 = F**. The rubric is printed on the paper. Maths, shape counts, star counts, paint swatches and number patterns are generated; the four other subjects use 68 curated questions. Twelve students have distinct original faces, outfits, personalities and reactions.

## Modes

- **Career:** six papers on the first two days, then eight rounds per day. Accuracy earns 0–3 stars and a 10–25-coin day bonus. Every fifth day ends with three inspected papers; optional 15-second timers can be switched off.
- **Bell Rush:** stamp as many answers as possible in 60 seconds. Reading feedback uses time, so continue promptly. Menus, hidden tabs and focus loss pause the clock.
- **Class Marathon:** three mistakes end the run. Marking all 150 papers completes a full marathon.
- **Daily Class:** twelve rounds generated from the local calendar date. The same date gives all players the same set, independent of their career day. Best unassisted score saves locally.

Fair marks earn five coins plus bounded streak/inspection bonuses. An answer-key-assisted correct stamp earns one coin and is excluded from challenge records. Wrong stamps earn no coins. Sixteen cosmetic purchases include four wall colours, three desks, three pens, a fern, globe, books, hamster, wall clock and bunting; they do not alter marking difficulty or payouts.

## Controls and saves

Use the large on-screen stamps with touch or a mouse. Keyboard: **Left/F** for F, **Right/A** for A+, **1–5** for worksheet grades, **1–3** for incident choices, **Enter/Space** to continue feedback, **Escape** for the pause menu. Settings include sound, animation, inspection timers and extra-large stamps. Modals support keyboard focus and scroll on small screens. Portrait, landscape and iPad split view use responsive layouts.

Career, coins, purchases, settings and unfinished rounds save in this browser or PocketVM profile. Reloading continues the next unmarked round; completed marks and bonuses are not paid twice. Saves inside PocketVM use a source-checked parent message bridge and bounded data. Uninstalling retains progress. Installed code and audio effects run offline, with no CDN or additional downloads; standalone offline play depends on the PocketVM service worker being installed and cached.

## Implementation and validation

`core.js` contains deterministic questions, marking, timers, progression and saves. `game.js` draws the original perspective classroom in Canvas 2D, renders the paper interface, handles controls and synthesises soft audio effects. It does not need WebGL. `game.html` provides the responsive layout. PNG/SVG icons are reproducible with `tests/build-grade-icon.cjs`.

Run `node tests/grade-regression.cjs`, `node tests/grade-package.cjs` and `node tests/grade-render.cjs`. They exercise generated question correctness, thirty career days, all worksheet grades, timers, challenge records, bounded saves, single settlement, reloads, purchases, actual Store installs/repair/offline launch and the production renderer/UI handlers. Browser layout verification is documented in `tests/GRADE.md`.
