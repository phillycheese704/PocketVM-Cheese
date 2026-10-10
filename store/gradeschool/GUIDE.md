# Grade School

An original single-player classroom comedy game for PocketVM, inspired by the quick teacher-and-papers loop of [Papers Grade Please](https://www.yiv.com/Papers-Grade-Please). The class has learned everything from a suspicious pigeon. All artwork, characters, prompts, sound effects and code are original to this package.

**Pick green ink if the answer is correct, or red ink if it is nonsense. Draw your grade directly on the paper, then hand it back.** Write an A+, F, tick, cross or your own very serious doodle. Your chosen colour determines the judgement. Switching colour clears the previous drawing; Undo removes one stroke; Redo restores it; Clear starts again. Drawing works with a finger, stylus, Apple Pencil or mouse through pointer events. Completed strokes save with the unfinished paper and scale with its size after rotation or reload. Hand-in stays disabled until you actually draw a stroke.

The questions are deliberately daft. “What sound does a duck make?” might be answered with “Password123”. Other students believe bananas are phones, potatoes have wheels, and hamsters are lawyers. Eighty absurd prompts combine with generated Snack Maths and visual Suspicious Doodles. Twelve expressive students deliver their answers with completely undeserved confidence.

The six kinds of nonsense are **Snack Maths**, **Certified Nonsense**, **Weird Science**, **Where Even Am I?**, **Terrible Excuses** and **Suspicious Doodles**. All rounds use the same red/green drawing loop. There are no whole-worksheet grades or curriculum tests.

## Modes and rewards

- **Career:** six papers on days 1 and 2, then eight per day. New nonsense categories unlock through day 3. Every fifth day ends with three principal inspections; their optional 15-second limits can be switched off.
- **Bell Rush:** catch as much nonsense as possible in 60 seconds. Feedback uses time; menus, hidden tabs and focus loss pause the clock.
- **Class Marathon:** three mistakes end the run. A full run contains 150 papers.
- **Daily Class:** twelve papers generated from the local calendar date. The same date gives every player the same set, independent of career progress.

Correct decisions earn five coins plus bounded streak/inspection bonuses. A sneaky cheat-sheet peek earns one coin and does not count towards challenge records. Career days also award 10–25 bonus coins. Sixteen cosmetic purchases include four classroom colours, three desks, three pen styles and six decorations, including an entirely unqualified hamster. The two grading inks always remain red and green.

## Controls and saves

Use the on-screen ink buttons and draw directly on the paper. Keyboard: **R/F/Left** selects red, **G/A/Right** selects green, **Enter** hands back a drawn paper or continues feedback, **Ctrl/Cmd+Z** undoes a stroke, **Ctrl/Cmd+Shift+Z / Ctrl+Y** redoes it, **M** switches draw/scroll mode, and **Escape** pauses. Browser shortcuts keep their normal behavior. Handwriting itself requires a pointer. Laptop mouse and trackpad ink uses smoothed curves; pen pressure changes line weight. On phones and short landscape screens the ink controls form a separate bottom dock, leaving a scrolling reading area above. **Move** lets you swipe the paper without drawing; **Draw** or choosing ink restores drawing. The dock’s hand-back button becomes Next student during feedback. Fullscreen is available when supported. Phone safe areas and changing browser heights are respected. Rotations, resizing, menus and focus loss preserve completed ink and safely release an active stroke. Hidden tabs stop classroom rendering. Settings cover sound, motion, inspection timers and extra-large ink buttons.

Career, coins, purchases, settings, challenge records, unfinished papers and drawings save automatically in this browser or PocketVM profile. A reload does not repeat completed payouts. The first drawing-format update discards an unfinished older quiz while keeping career and purchases. PocketVM uses source-checked save messages with bounded drawing data. Uninstalling retains progress. A complete Store installation launches offline without a CDN or downloaded soundtrack.

## Verification

Run `node tests/grade-regression.cjs`, `node tests/grade-package.cjs` and `node tests/grade-render.cjs`. The checks cover generated snack questions, thirty career days, all-red/green marking rules, drawing sanitisation and reloads, timers, one-time rewards, purchases, source-checked sandbox saves, package failure recovery, offline launching and actual production pointer drawing/undo/hand-in handlers. Live browser and tablet layout results are recorded in `tests/GRADE.md`.
