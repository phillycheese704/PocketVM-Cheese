# PVZ Adventure v13 verification

Run the production simulation and Canvas renderer regression suite:

```sh
npm install --no-save @napi-rs/canvas
node tests/pvz-regression.cjs
```

Set `PVZ_QA_DIR` to also save a rendered Day lawn screenshot.

The suite executes the inline production JavaScript with a deterministic random
seed. Native Canvas performs real image decoding and rendering; DOM, audio and
browser scheduling are substituted for the test environment.

The 29 checks cover all 50 level configurations and startup renders, all 49 plant
and 25 zombie artwork mappings, a normal-resource 1-1 win, targeting, armor,
lobbed splash, homing shots, sleeping mushrooms, mines, two-cell Cob Cannons,
simulation-time queues, pause/restart, bowling, wave completion, resource
collection, terrain restrictions and Endless Day/Night transitions.

Peashooter now uses its verified normal animation and matching portrait, rather
than rendering Repeater-only layers from the shared reanimation file. The
regression suite pins the corrected atlas and portrait hashes separately from
Repeater. All 49 labeled plant portraits were visually checked for identity.

The live GitHub Pages v13 build was checked in Chrome: seed selection, the
correct normal Peashooter packet portrait and lawn animation, click planting,
and pause all worked.

![Live browser smoke check](pvz-peashooter-fixed-1791526699545.jpg)

The automated suite is not a browser interaction test or a complete
playthrough of all 50 levels. Boss phase choreography, exact wave rosters,
animation timing, every special zombie interaction and full original-game
balance still need comparative playtesting.

## Update delivery

The package marker and Store revision are `adventure-v13`. Store download size
comes from the final UTF-8 game file size. Shell cache `pocketvm-shell-v72`
refreshes the hosted engine; an installed game migrates when it next opens.
Existing game saves, unlocks and imported music files are retained.
