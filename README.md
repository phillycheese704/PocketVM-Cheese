# PocketVM 2.1

PocketVM is a touch-first browser PC designed for iPad and static hosting on GitHub Pages. Everything runs client-side.

**Live:** https://phillycheese704.github.io/PocketVM-Cheese/

## What it includes

- Local account, password lockout and puzzle-based recovery
- 1 GB IndexedDB virtual drive
- Files with folders, grid/list views, sorting, multi-select, import/export, copy/cut/paste and properties
- TXT and HTML editor with sandboxed HTML preview
- PNG, JPG/JPEG, WebP, GIF and SVG support
- Photos viewer and image wallpapers
- Draggable desktop icon grid with iPad long-press context menus
- Browser, Calculator, Notes, Terminal, System and Task Manager
- PocketVM Store with real virtual-drive installs; first title: Snake
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
├── store.js                Store, installs and game launcher
├── store/                   Store package sources
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
