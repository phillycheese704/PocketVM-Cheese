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
- PocketVM Store with real virtual-drive installs; games include Snake, Deadwave, Block Blast, Crumb Clicker, Plants vs Zombies, Flappy Bird, Penguin Pull, Apex Rush, Wobble Bay and Grade School, with local `.pvmod` support
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
├── store/                   Store package sources for all ten games
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

Grade School is an original classroom grading game inspired by the teacher-and-papers loop in mobile ad games. Six subjects, twelve animated students, generated maths and visual questions, four-answer worksheets, classroom incidents, sixteen cosmetic upgrades and four modes are included. Career days unlock new subjects and principal inspections; Bell Rush, Class Marathon and Daily Class provide quick challenges. Progress and unfinished classes save automatically. See [the guide](store/gradeschool/GUIDE.md).
