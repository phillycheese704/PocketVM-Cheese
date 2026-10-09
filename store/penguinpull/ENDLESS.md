# Penguin Pull — Endless v4

The game now continues after every cleared tower. Twenty rescues trigger a two-second fade into a randomly selected different stage; the total score stays intact. Six themes vary the palette, shelf width, penguin spacing, row offsets, ice friction and gentle wind: Bluewater Bay, Aurora Fjord, Coral Sunset, Crystal Glacier, Moonlit Lagoon and Mint Icefields. A shuffled stage pool prevents adjacent repeats.

The royal entering the sea still ends the run. Keeping the crown attached earns a crown-perfect tower. Existing saved best scores and perfect counts migrate; the installer now preserves endless scores above 20 and the best cleared-tower count.

The previous water check awarded points only to the last dragged penguin and marked all other falling penguins as lost. Every penguin now earns exactly one point when its rotated body touches the visible water. Swept water checks catch fast throws. Water beside the floe reacts at its shoreline. A held penguin can score as soon as it reaches the sea, without waiting for release. Splashes, a floating +1, flapping, brief swimming and bobbing make contact visible.

Physics runs at a fixed 120 Hz. Throws use recent pointer velocity rather than total drag distance; holding still before release removes stale momentum. Grab offsets prevent snapping. Exponential drag response, equal-mass loose-body impulses, wall rebounds, ordered shelf collisions and frame-independent friction improve movement. Tower stability integrates once per step. Pause freezes physics and stage transitions. Restart invalidates previous animation callbacks. Each new tower resets held pointers, loose bodies, collapse state, compression and crown state.

Validation: `node tests/games-regression.cjs` with Node and `@napi-rs/canvas`. Tests cover every-penguin scoring, idempotent rescues, high-speed water crossings, real drag/release/cancel input, throw momentum, collisions, all six full towers cleared through normal drag controls, score persistence through 105 cleared towers, different adjacent stages, pause and callback isolation. All themes and transition effects are rendered for inspection.
