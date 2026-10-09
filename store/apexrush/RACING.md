# Apex Rush

A top-down arcade racer for PocketVM, with original Canvas cars and circuits. Install it from the Store or open `game.html` directly on GitHub Pages. The standalone game also saves locally.

## Build your race

- Five circuits: Harbour Run, Redrock Ring, Alpine Pass, Midnight Metro and Grand Prix Gardens.
- Four AI levels: Rookie, Club, Pro and Elite. Difficulty changes target pace, corner speed, steering variation and boost strategy. Every car uses the same driving and collision physics; there is no catch-up teleporting or hidden speed multiplier.
- One to eight laps and three, five or seven rivals.
- Dry roads or rain. Rain lowers lateral grip and changes AI corner speed.
- Independent body and stripe colours, six quick paint choices and a random paint button.
- Random options for the circuit, difficulty, laps, grid and weather. “Randomise all” keeps those choices random for subsequent races.
- Optional auto throttle, touch pedals, music volume and independent effects mute.

## iPad and touch

The `race-v2-ipad` update replaces the small single-row pedals with two spacious thumb groups. Large is the default; Extra large is available in the garage and saves with your settings. On tablet screens, Large steering and pedal targets are 88–112 pixels wide and Extra large targets are 100–128 pixels wide. Drift and nitro sit above the main controls. Phone and split-view layouts reduce the groups to fit while retaining generous targets.

The race HUD has an **AUTO** button to toggle auto acceleration immediately. When enabled, steer and use BRAKE for corners; GAS remains available for manual driving. Touch controls appear on touch-capable devices even with a connected trackpad, and **Always show touch controls** provides a manual override.

Multiple fingers work independently. You can hold GAS before lights out, slide from left to right or GAS to BRAKE without lifting, and slide outside the controls to release that finger. Pointer cancellation, focus loss, recovery and viewport resizing clear held controls. Rotating the device pauses an active race so you can adjust your grip before resuming. Safe-area padding keeps controls away from the home indicator and screen edges. Garage selectors, paint swatches, toggles and pause actions have larger touch targets; portrait garages scroll vertically.

`tests/apex-touch-layout.html` embeds the actual shipped game at iPad portrait, landscape, Pro, split-view and phone sizes. Its **Check visible controls** action verifies that all six driving controls fit inside the viewport, are at least 44 × 44 pixels, and do not overlap. It does not alter game state or simulate driving.

## Drive

| Action | Keyboard | Touch |
| --- | --- | --- |
| Accelerate | W / Up | GAS, or auto throttle |
| Brake / reverse | S / Down | BRAKE |
| Steer | A / D, Left / Right | Left / right buttons |
| Nitro | Shift | NITRO |
| Handbrake | Space | DRIFT |
| Pause | P / Escape | Pause button |
| Recover | R | R button |

Nitro consumes energy and replenishes when released. Handbraking reduces lateral grip for a drift. Recovery places the car just beyond its last validated sector, clears stuck controls and imposes a real two-second hold while the race continues.

Cars use oriented body collisions, momentum exchange, impact friction, rebound and angular motion. Barriers use the same track geometry as the rendered rails. Damage changes vehicle performance, adds visible body marks and smoke, and gradually repairs. Wet roads and grass shoulders have different grip and drag. A bounded fixed-step simulation runs at 120 Hz independently of rendering, accounting for frames up to 250 ms.

Each lap requires twelve sector gates in order, crossed in the forward direction. Reversing over the finish, missing a sector or recovering cannot award a free lap. Standings use validated sector progress; finishers sort by actual finish time. Unfinished rivals are honestly shown as “On track”. The minimap reflects the live car positions.

Finishes, wins, chosen setup and personal best laps save locally. Dry and wet best laps are separate for each circuit. Pausing, tab hiding or window focus loss freezes the race and clears held inputs. Restarting creates a new simulation without old callbacks.

## Music

The user-provided `kulakovka-racing-281126.mp3` is included unchanged as `music.mp3`: 3,387,141 bytes, stereo MP3, approximately 105.85 seconds. It loops during racing and pauses with the race. PocketVM installs the soundtrack into the virtual drive and verifies its byte length; an incomplete soundtrack download rolls back the package. Its credit appears in the garage.

## Validation

From the repository root:

```sh
node tests/apex-regression.cjs
node tests/apex-package.cjs
```

The engine suite uses `@napi-rs/canvas` (or `CODEX_PRIMARY_RUNTIME_NODE_MODULES` containing it), executes the shipped HTML and injects inspection hooks only in memory. The package suite executes the real Store installer and launcher with a disposable virtual drive; only SVG-to-PNG conversion is replaced in that harness.

Twenty-two gameplay checks cover geometry, random settings, saves, collisions, handling, nitro, ordered lap gates, recovery, pause, multi-touch and rendering, including sliding between buttons, countdown-held pedals, saved touch settings, rotation, viewport changes and the live AUTO toggle. AI completes every circuit on both dry and wet roads, all four levels finish three-lap races, and an eight-car Elite grid completes a wet circuit. Keyboard pilots complete real races on three circuits using ordinary gas, brake, steering and boost inputs, with no position, speed or lap overrides. Fixed-step timing agrees at 120, 60 and 10 FPS, including a 200 ms frame. Four package checks verify installation, sandbox save routing, incomplete-download rollback and the automatic update of an installed race-v1 package while preserving music and saved settings. Results are in `tests/apex-results.json` and `tests/apex-package-results.json`.

The original race-v1 GitHub Pages build was also checked in Chrome: garage settings, random choices, custom paint, race countdown, keyboard acceleration, pause/resume and recovery worked. The included music loaded with a 105.85-second duration, played during racing and paused with the race. The live Midnight Metro race is shown in [the original browser screenshot](../../tests/apex-rush-browser-1791577095456.jpg). All 59 checks across Apex Rush, its package installer and the existing Flappy Bird, Deadwave and Penguin regression suites passed before that publication.

The race-v2-ipad release passed all 22 engine, four package and 13 Flappy regression checks. Its published build was then inspected in Chrome using real iframe viewports: 1024 × 768, 768 × 1024, 1366 × 1024, 507 × 768, 390 × 844 and 740 × 390. All twelve combinations of those viewports and Large/Extra large passed the button-boundary, minimum-size and overlap checks. Extra large main buttons measured 123 × 113 pixels at 1024 × 768; default Large measured 102 × 92. Saved tablet settings loaded into a fresh game frame, and the live AUTO button accelerated the car. This verifies responsive browser layout and the actual game UI; it is not a physical iPad hardware test. Full layout measurements are in [the layout results](../../tests/apex-touch-layout-results.json), with [the large-button race screenshot](../../tests/apex-ipad-controls-1791579506566.jpg).
