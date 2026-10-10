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

Ball vs Ball replaces the cancelled Fisch game with a physics auto-battler inspired by Roblox Ball VS Ball. Choose one of three balls, lock a launch direction, and watch its automatic ability fight for three-heart matches. There are 42 balls, AI 1v1/2v2, local two-player duels, four arenas, unlocks, capsules and saved progression. The supplied first track is menu music; the second plays during matches. See [the guide](store/ballvsball/GUIDE.md).
