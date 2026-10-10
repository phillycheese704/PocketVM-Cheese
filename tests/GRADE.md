# Grade School verification

The game is an original classroom grading simulation inspired by the linked Yiv game's premise and short A+/F paper loop. It uses its own code, Canvas perspective classroom, characters, interface, audio and content; it does not reuse that game's binaries or art.

- `grade-regression.cjs`: 15 gameplay checks, including 2,320 generated Maths/Art questions, thirty complete career days, all five worksheet grades, principal timeouts, timers disabled, 60-second Rush, three-mistake Marathon, reproducible Daily Class, assistance excluded from records, once-only bonuses, save resumption and purchases.
- `grade-package.cjs`: 8 checks using the actual production Store functions and a disposable virtual disk. Covers installs, both embedded scripts, bounded source-checked saves, four truncated downloads, interrupted writes, repair preserving the name/progress, offline launching and progress retained after uninstall.
- `grade-render.cjs`: 6 checks using the actual production game scripts, DOM event handlers and native Canvas. Covers welcome startup, original classroom drawing, career start, answer key/stamp/feedback/next cycle, exact offline URLs and verified package byte sizes.
- `grade-touch-layout.html`: loads the actual game at iPad, split-view and phone sizes. Its button reports touch targets, horizontal bounds, non-scrolling vertical bounds, paper/action separation and visible runtime errors.

The test renderer supplies a small DOM adapter; it is not a full browser. Physical iPad touch hardware and audio playback require a device check. Browser results and a live gameplay screenshot are added after deployment.
