# PocketVM 2.1

PocketVM is a touch-first browser PC designed for iPad and static hosting on GitHub Pages. Everything runs client-side.

## Live site

https://phillycheese704.github.io/PocketVM-Cheese/

## 2.1 — Files, storage and polish

- **1 GB PocketVM virtual drive** backed by IndexedDB
- Existing legacy TXT/HTML files are migrated into the virtual drive
- Standard Home folders: Desktop, Documents, Downloads and Pictures
- Rebuilt Files app with grid/list views, breadcrumbs, sorting and multi-select
- Copy, cut, paste, rename, delete, download, properties and file importing
- iPad-friendly single-tap open and long-press context menus
- Image support for PNG, JPG/JPEG, WebP, GIF and SVG
- Image thumbnails directly inside Files
- Photos/Image Viewer with zoom, fit, download and Set as Wallpaper
- Custom wallpapers are saved into Pictures on the virtual drive
- Draggable desktop app icons that snap to a persistent grid
- Built-in apps can be removed from / restored to the desktop from Settings
- Desktop long-press acts like PocketVM's right-click menu on iPad
- New Task Manager with running processes and End Task
- Rebuilt System app with real browser-exposed device and storage information
- Storage Settings show virtual capacity, free space and browser quota
- More accent themes and preset wallpapers
- Custom profile borders: none, ring, double or glow
- Custom profile border colours
- Desktop icon size controls

## Storage model

PocketVM enforces a **1 GB maximum virtual drive**. The browser or iPad may impose a smaller real IndexedDB quota, so 1 GB is PocketVM's maximum rather than a promise that every browser will grant the full amount.

Files and images live in IndexedDB. Small preferences, the local account hash and UI settings remain in localStorage.

## Terminal

The terminal intentionally has exactly one command:

```text
null.user
```

It erases both localStorage and the IndexedDB virtual drive, then returns PocketVM to first-time account setup.

## Security

PocketVM is a browser desktop, not a hardware VM or operating-system security boundary. Local HTML files run sandboxed and cannot directly access PocketVM storage.

## License

MIT.
