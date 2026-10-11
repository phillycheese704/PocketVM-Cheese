# PocketVM 2.1

PocketVM is a touch-first browser PC designed for iPad and static hosting on GitHub Pages. Everything runs client-side.

**Live:** https://phillycheese704.github.io/PocketVM-Cheese/

## What it includes

- Local account, password lockout and puzzle-based recovery
- 1 GB IndexedDB virtual drive
- Files with folders, grid/list views, sorting, multi-select, import/export, copy/cut/paste and properties
- Text/HTML editor with sandboxed HTML preview, plus Pocket Code for Python, HTML, Java, CSS, C# and JSON
- PNG, JPG/JPEG, WebP, GIF and SVG support
- Photos viewer and image wallpapers
- Draggable desktop icon grid with iPad long-press context menus
- Browser, Calculator, Notes, Terminal, System and Task Manager
- PocketVM Store with real virtual-drive installs; games include Snake, Deadwave, Block Blast, Crumb Clicker, Plants vs Zombies, Flappy Bird, Penguin Pull, Apex Rush, Wobble Bay, Grade School and Ball vs Ball, with local `.pvmod` support
- Themes, wallpaper presets, avatar borders and desktop customization
- Installable/offline-capable PWA

## Project layout

```text
/
├── index.html              PocketVM shell markup
├── styles.css              Desktop and app styling
├── app.js                  Desktop shell, account, browser and settings
├── storage.js              IndexedDB virtual drive
├── files.js                Files, Editor, HTML Preview and Photos
├── system.js               System and Task Manager
├── store.js                Store, installs, Mods Hub and game launchers
├── code.js                 Pocket Code editor
├── store/                   Store package sources for all eleven games
├── sw.js                   PWA service worker
├── manifest.webmanifest    PWA manifest
├── icons/                  Canonical app/PWA icons
├── LICENSE
└── .nojekyll
```

The repository intentionally stays build-free so GitHub Pages can serve it directly.

## Storage

PocketVM enforces a **1 GB maximum virtual drive**. Safari or another browser may impose a smaller real IndexedDB quota, so 1 GB is PocketVM's maximum rather than a guarantee that every device grants the full amount.

Files and images live in IndexedDB. Small UI preferences and the local account record live in localStorage.

## Terminal

The terminal intentionally has one command:

```text
null.user
```

It erases both localStorage and the IndexedDB virtual drive, then returns PocketVM to first-time account setup.

## Security

PocketVM is a browser desktop, not a hardware VM or operating-system security boundary. Local HTML runs sandboxed and cannot directly access PocketVM storage.

## License

MIT.



Wobble Bay adds an original single-player 3D physics island with eight paid jobs, seven vehicles, grab-and-throw cargo, ragdolls, hats, three purchasable homes, a dog and sixteen hidden stars. It supports large iPad controls, keyboard and Xbox controllers. Install it from the Store or play `store/wobblebay/game.html`; see [the guide](store/wobblebay/GUIDE.md). The original nine games and PocketVM now use a matching illustrated icon family, with SVG, small PNG favicons and iPad home-screen exports. Installed game artwork refreshes while retaining saves, names and music.

Grade School is an original classroom comedy inspired by mobile teacher-and-papers games. Choose red or green ink, draw your grade directly on a paper, then hand it back. Eighty absurd prompts, generated snack maths, suspicious doodles, twelve animated students and four modes keep the class chaotic. Buy classroom upgrades with earned coins. Unfinished papers and drawings save automatically; controls support finger, stylus and mouse. See [the guide](store/gradeschool/GUIDE.md).

Ball vs Ball replaces the cancelled Fisch game with a physics auto-battler inspired by Roblox Ball VS Ball. Choose one of three balls, lock a launch direction, and watch its automatic ability fight for three-heart matches. There are 60 balls, AI 1v1/2v2/4v4, local two-player duels, six arenas, unlocks, capsules and saved progression. The supplied first track is menu music; the second plays during matches. See [the guide](store/ballvsball/GUIDE.md).

Boost League adds original 3D car football inspired by Rocket League: local 1v1, 2v2 and 3v3, jumps and dodges, aerial boost, banked walls, boost pads, demolitions and sudden-death overtime. Customize paint, body and decals, or practice with unlimited boost. Keyboard, touch and gamepad support; install it from Store. See [the guide](store/boostleague/README.md).

## Knockout
New penguin ice survival game: secret aim/power, simultaneous launches, 8–16 AI penguins, shrinking floes, collision knockouts, three arenas, three difficulties, Random, practice and earned cosmetics. Touch and keyboard controls; saved career and offline Store installation. [Play Knockout](./store/knockout/game.html).

## New arcade series

Shoot is an original movement FPS inspired by Krunker: six classes, three block-world maps, free-for-all, team deathmatch and rotating hardpoint against configurable AI. Sliding, jump momentum, headshots, cover, respawns, career records, mouse or touch aiming and three native mods. [Play Shoot](./store/shoot/game.html).

Match Survival is an original Gridland-inspired match-three survival game. Gather resources and automatically build six workshop chains by day; equip shields and swords, summon creatures and defeat bosses by night. Twelve successful swaps per day, resumable cascades and expeditions, magic, potions, bombs, three difficulties, twenty-five-night completion followed by endless play, and three native mods. Store banner: **Grid- Match- Survive**. [Play Match Survival](./store/matchsurvival/game.html).

Subway Surfers is an original fan-inspired three-lane railway runner. Four original worlds, rooftop ramps, stationary/oncoming trains, jumps/rolls, guard pursuit, hoverboards, four power-ups, earned cosmetic unlocks, mission multipliers and seeded daily routes. Large touch buttons, swipes and keyboard inputs. Career currency banks without duplication after a key continuation. Three native mods and offline installation. [Play Subway Surfers](./store/subwaysurfers/game.html).

Avenge FPS is an original hero arena inspired by Venge.io: four heroes, eight weapons, twelve spell cards, four maps and Point, Black Coin, Gun Game or three-versus-three Payload. Projectile grenades, shurikens, axes, explosive traps, close combat, wall-safe dashes and surface grapples. AI opponents, keyboard/mouse/touch, career XP and three native mods. [Play Avenge FPS](./store/avengefps/game.html).
