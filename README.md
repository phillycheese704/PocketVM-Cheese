# PocketVM

PocketVM is a touch-first browser desktop designed for iPad and static hosting on GitHub Pages. Everything runs client-side.

## Use

**Live site:** https://phillycheese704.github.io/PocketVM-Cheese/

## PocketVM 1.2

- Local account setup on first launch
- Password login on every launch / lock
- Passwords stored as salted PBKDF2 hashes when Web Crypto is available
- Three wrong password attempts trigger a 60-second lockout
- **Forgot password?** opens a simple local puzzle that unlocks the desktop
- Settings → Password requires the current password before changing it
- User profile name and profile picture remain local
- Built-in and custom-uploaded wallpapers
- Empty personal Files area supporting `.txt` and `.html`
- HTML files can be edited and run in a sandboxed preview
- Terminal does not open automatically
- Terminal has exactly one command: `null.user`
- `null.user` calls `localStorage.clear()` and reloads PocketVM, deleting the local account, files, profile, wallpaper, settings and any other PocketVM local-storage data for this origin
- Installable PWA with offline caching

> **Security note:** PocketVM is a browser project, not an operating-system security boundary. The password screen is useful for casual local privacy, but anyone with access to browser developer tools or site data may be able to modify client-side state. The recovery puzzle is intentionally easy and is not strong identity verification.

## Terminal

PocketVM 1.2 deliberately resets the shell command set. The only accepted command is:

```text
null.user
```

That command erases all `localStorage` for the PocketVM site and reloads to first-time account setup.

## License

MIT.