# PVZ Adventure v14 verification

Run the production simulation and Canvas renderer regression suite:

```sh
npm install --no-save @napi-rs/canvas
node tests/pvz-regression.cjs
```

Set `PVZ_QA_DIR` to also save a rendered Day lawn screenshot.

The suite executes the inline production JavaScript with a deterministic random
seed. Native Canvas performs real image decoding and rendering; DOM, audio and
browser scheduling are substituted for the test environment.

The 64 checks cover all 50 level configurations and startup renders, all 49 plant
and 25 zombie artwork mappings, a normal-resource 1-1 win, targeting, armor,
lobbed splash, homing shots, sleeping mushrooms, mines, two-cell Cob Cannons,
simulation-time queues, pause/restart, bowling, wave completion, resource
collection, terrain restrictions and Endless Day/Night transitions.

`pvz-balance.cjs` extends the same production-engine harness with original wave
counts, enemy gates, all seed profiles, flag warnings, adaptive pacing, graves,
pool ambushes, conveyor supply, boss phases/counters, and special zombie balance.
It also clears 13 complete matches with their actual resources: 1-3, 1-9, 2-9,
3-9, 4-9, 5-9, 1-5, 2-5 and all five world finales. The player uses owned seeds,
normal costs and recharge, collected sun, or the real conveyor; it does not
grant itself sun, plants, packets, damage, or extra mowers. The fixed seeds and
results are recorded in `pvz-balance-matches.json`.

Optional `PVZ_BALANCE_STRESS=1` also runs exploratory Tiny/Bungee players. These
simple players may lose and are not counted as cleared levels. A bot win is a
repeatable strategy fixture, not proof of balance across every random seed.
See [`store/pvz/BALANCE.md`](../store/pvz/BALANCE.md) for the gameplay changes,
reference revision, and remaining differences from the original.

Peashooter now uses its verified normal animation and matching portrait, rather
than rendering Repeater-only layers from the shared reanimation file. The
regression suite pins the corrected atlas and portrait hashes separately from
Repeater. All 49 labeled plant portraits were visually checked for identity.

The previous live GitHub Pages v13 build was checked in Chrome: seed selection, the
correct normal Peashooter packet portrait and lawn animation, click planting,
and pause all worked.

![Live browser smoke check](pvz-peashooter-fixed-1791526699545.jpg)

The automated suite uses native Canvas for rendering with substituted DOM,
audio and browser scheduling. It is not a browser interaction test or a complete
playthrough of all 50 levels. Animation timing, complete boss choreography and
every special zombie state still need comparative playtesting.

## Update delivery

The package marker and Store revision are `adventure-v14`. Store download size
comes from the final UTF-8 game file size. Shell cache `pocketvm-shell-v73`
refreshes the hosted engine; an installed game migrates when it next opens.
Existing game saves, unlocks and imported music files are retained.
