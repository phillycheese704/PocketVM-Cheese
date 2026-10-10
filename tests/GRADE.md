# Grade School verification

Grade School is an original classroom comedy inspired by the linked Yiv premise. The final interaction requires a real freehand drawing: choose red or green ink, draw on the paper and hand it back. Content consists of eighty absurd prompts, generated snack sums and simple suspicious doodles. It uses its own characters, Canvas artwork, UI, sound and code.

- `grade-regression.cjs`: 15 gameplay checks. Exercises 2,320 generated Snack Maths/Art prompts, thirty complete career days, deterministic daily papers, once-only settlement, timers and opt-out, challenge records, purchases, reloads and bounded red/green strokes cleared after hand-in.
- `grade-package.cjs`: 8 checks using actual production Store functions and a disposable virtual disk. Installs and embeds both scripts, carries an unfinished drawing into the sandbox, accepts only source-checked bounded saves, rejects four truncated downloads, rolls back interrupted writes, repairs while preserving progress, launches offline and keeps progress after uninstall.
- `grade-render.cjs`: 6 checks using actual production scripts, event handlers and native Canvas. Boots the welcome menu, draws the classroom, starts a career paper, draws pointer strokes in real Canvas pixels, saves/undoes strokes, switches colour and hands back a paper. Also checks exact offline URLs and package byte sizes.
- `grade-touch-layout.html`: loads the real game at seven iPad/phone/split-view sizes. Checks touch targets, horizontal bounds, vertical bounds when not scrolling, paper/control separation and visible errors.

The native render test supplies a small DOM adapter; live browser checks provide the full layout verification. Physical iPad/Apple Pencil hardware and audio playback have not been tested. Pointer support uses the standard browser APIs; a physical device check remains useful.
