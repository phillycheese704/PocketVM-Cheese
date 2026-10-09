# Flappy Bird flight update

Classic is still one life and one point per cleared pipe. Flight now runs at 120 simulation steps per second, independently of rendering speed. Pipe heights change within a bounded range, difficulty levels off after 40 points, and the visible pipe caps use the same rectangles as collisions. The bird has a forgiving body hitbox. The ceiling gently stops upward motion; the floor and pipes end a Classic flight.

Practice uses slower pipes, wider gaps and a checkpoint after every cleared pipe. Retry restores the last checkpoint's obstacles and score with a fresh flap. Practice has a separate best and does not unlock Classic rewards.

## Controls

| Action | Input |
| --- | --- |
| Flap / start / retry | Tap, click, Space or Arrow Up |
| Pause / resume | P, Escape or the pause button |
| Fresh flight | R |
| Soundtrack / effects | Separate top-right buttons |

Holding Space does not repeatedly flap. Leaving the tab or window pauses a flight. Retry animations use simulation time rather than delayed callbacks, so a restart cannot inherit the previous crash screen.

## Rewards and scenery

| Classic score | Reward |
| --- | --- |
| 0 | Sunny bird |
| 5 | Mint bird and Bronze medal |
| 10 | Berry bird and Silver medal |
| 20 | Azure bird |
| 25 | Gold medal |
| 35 | Midnight bird |
| 50 | Platinum medal |

A pass near the gap's centre adds to the clean streak. It still awards exactly one point. Morning, sunset and moonlight blend into one another every 12 pipes. The birds have articulated wings, feathers and reactive eyes; scenery uses parallax clouds, hills and a coastal skyline.

Best score, best clean streak, flights, total Classic pipes, selected bird, mode and separate audio preferences save locally. Existing best scores and soundtrack preferences migrate automatically. The supplied Main Theme remains the soundtrack. PocketVM refreshes previously installed copies when opening the game; package `flight-v2` and shell cache `v78` contain this update.

## Validation

Run `node tests/flappy-regression.cjs` from the repository root with `@napi-rs/canvas` available, or set `CODEX_PRIMARY_RUNTIME_NODE_MODULES` to a modules directory containing it. The harness executes the actual HTML engine, adding inspection hooks only in memory. No production test controls ship in the game.

The 13 checks cover old saves, controls, fixed-step timing at 120/60/10 FPS, a 200 ms frame, pipe geometry and 5,000 bounded layouts per mode, scoring, Practice restore, pause/blur, crash/restart, audio preferences, sprite rendering, rewards and package migration. Four pilots using only normal flaps each clear 100 consecutive Classic pipes across the full difficulty curve. Results are recorded in `tests/flappy-results.json`.
