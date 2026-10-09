# Wobble Bay and illustrated icons

Wobble Bay is an original single-player 3D sandbox, inspired by Wobbly Life's physics, jobs, vehicles and exploration. It includes eight repeatable jobs, seven vehicle types, ten-particle ragdolls, spring-held cargo, object and vehicle collisions, shops, seven hat choices, three homes, a dog and sixteen stars. The island, models and icons are original procedural artwork. There is no Xbox map, multiplayer or copied game asset.

The normal renderer is vendored Three.js r160. A software perspective renderer draws the same scene when WebGL is unavailable, using simpler meshes and no dynamic shadows. Rendering quality and speed depend on the device. All game logic uses the shared `engine.js` with fixed physics steps.

| Validation | Result |
|---|---|
| Wobble physics and save regression | 17 checks; all eight jobs completed through ordinary movement, grabbing, steering and flight inputs |
| Store package and sandbox | 10 checks; verified assets, offline boot, bounded saves, source checks, interrupted install rollback and old-package repair |
| Software rendering | 4 checks; production world boot and draw, Play action, instancing and perspective clipping |
| Update and cache coverage | 4 checks; versioned script/icon URLs, real byte counts and offline source files |
| Live tablet/phone layouts | 12 passes; Large and Extra large across six viewport sizes |
| Existing game regressions | PVZ 65, Deadwave/Penguin 24, Apex 22, Apex installer 4, Flappy 13 checks passed |

The live browser test starts through software graphics because WebGL is disabled in that environment. The real joystick moves the avatar; ACT enters the runabout; touch throttle raises the visible speedometer to 17 km/h. All eight jobs appear on the board, Parcel Run starts, and its destination appears on the island map. No runtime game state was changed to produce these browser results. WebGL output and physical Xbox/iPad hardware were not visually tested.

The default iPad action buttons are 72 × 72 px, with a 138 × 138 px joystick. Extra large uses 86 × 86 px actions and a 162 × 162 px joystick; ACT is double width. Phone and split-view layouts retain at least 54 × 54 px actions. Safe-area insets, multiple pointers, pointer cancellation, focus loss, orientation changes, scrolling panels and saved preferences are handled by the shipped game.

Every standalone game gets SVG and 32 px PNG favicons plus 180 and 512 px home-screen exports. Candy Clicker has matching variant artwork. PVZ's icon depicts a single Peashooter. PocketVM has new SVG, 32/48 px ICO and 180/192/512 px exports. The Store migrates installed `icon.png` files only after verifying their PNG signature and dimensions; it leaves custom names, saves, game files, mods and music intact, and retries failed refreshes when connected. Versioned URLs and matching service-worker entries keep updates coherent offline.

Run from the repository root:

```sh
node tests/wobble-regression.cjs
node tests/wobble-package.cjs
node tests/wobble-render.cjs
node tests/wobble-cache.cjs
```

Open `tests/wobble-touch-layout.html`, enable touch controls in the game, select each viewport and press **Check visible controls**. Results are stored in `wobble-touch-layout-results.json`. `build-icons.cjs` rebuilds the original vector artwork and PNG/ICO exports with `@napi-rs/canvas`.
