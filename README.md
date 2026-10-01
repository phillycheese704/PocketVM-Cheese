# PocketVM

PocketVM is a touch-first browser desktop designed to feel at home on iPad. It is fully static, so it can be hosted on GitHub Pages with no backend.

## Features

- Windows-inspired desktop, taskbar and Start menu
- Draggable, resizable, minimizable and maximizable app windows
- Touch-friendly terminal with command history
- Local virtual filesystem persisted with `localStorage`
- Files, Notes, System Monitor, Settings and About apps
- PWA manifest + service worker for Home Screen installation/offline use
- `curl.exe ascii.live/rick` and `curl.exe ascii.live/parrot` built-in browser-safe animations
- Responsive layout for iPad, phones and desktop browsers

## Use
***The link is***: https://phillycheese704.github.io/PocketVM-Cheese/

## Terminal quick start

```text
help
neofetch
ls
cd Documents
cat ideas.txt
write hello.txt "Hello from iPad"
cat hello.txt
curl.exe ascii.live/rick
matrix
theme mint
```

## Important note

PocketVM 1.0 is a **browser-native virtual desktop/shell**, not a hardware/x86 virtual machine. That choice makes it fast, reliable, offline-capable and easy to host on GitHub Pages, including iPad Safari. The project is intentionally structured so a WebAssembly Linux/x86 backend can be added later without replacing the UI.

## Customisation

Most app definitions and terminal commands live in `app.js`. Search for `const apps` and `async function execute`.

Change colours in `styles.css` or add new accent pairs to the `themes` object in `app.js`.

## License

Use, modify and remix freely for personal projects.
