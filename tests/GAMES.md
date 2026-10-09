# Deadwave / Penguin Pull verification — 9 October 2026

Run `node tests/games-regression.cjs` with Node and `@napi-rs/canvas`.

The test executes production HTML engines in a VM, with Canvas renderers and DOM/input stubs. Test accessors are added only in memory; shipped games do not expose debug or cheat APIs. `games-results.json` records the 24 checks. Generated model/theme images remain reproducible test output.

Three deterministic Deadwave runs reached wave 8 using ordinary health, the installed Auto Bot movement logic, and legal choices from three-card drafts. Tests also verify all 13 weapons, 136 cards, 27 enemy/boss models, five new boss phase transitions, boss victory gating, swept collisions and pause behavior.

All six Penguin Pull stages were cleared through the production pointer handlers using gradual outward pulls and water drops. A separate transition stress test continued for 105 towers (2,100 rescues), preserving the total and selecting a different adjacent stage every time. Collision, high-speed water contact, repeated rescue, momentum, pause and restart checks passed.

The deployed game was also played with real browser drag controls: twenty individual penguins scored, Aurora Fjord cleared, and the game continued into Bluewater Bay with the same score of 20 and a fresh tower. The attached browser screenshot records tower 2. Deadwave's deployed field guide was inspected for the complete weapon roster and all eight bosses.

Penguin Pull proof: `penguin-endless-browser-1791569202664.jpg`.
