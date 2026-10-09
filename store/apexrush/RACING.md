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

Nineteen gameplay checks cover geometry, random settings, saves, collisions, handling, nitro, ordered lap gates, recovery, pause, multi-touch and rendering. AI completes every circuit on both dry and wet roads, all four levels finish three-lap races, and an eight-car Elite grid completes a wet circuit. Keyboard pilots complete real races on three circuits using ordinary gas, brake, steering and boost inputs, with no position, speed or lap overrides. Fixed-step timing agrees at 120, 60 and 10 FPS, including a 200 ms frame. Three package checks verify installation, sandbox save routing and incomplete-download rollback. Results are in `tests/apex-results.json` and `tests/apex-package-results.json`.
