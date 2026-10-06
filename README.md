# Leaf OS

A tiny desktop-style web app built with plain HTML, CSS, and JavaScript. It feels like a mini operating system, with a floating window layout, dock, wallpaper switching, browser, notes, settings, clock, and a simple dinosaur game.

Live demo: https://sanskarsingh100.github.io/webos/

This project is basically a browser-based desktop environment made without a framework. Just a few files, a little JS, and a lot of UI behavior. The goal was to make something lightweight and fun that feels like a desktop app without needing a backend or heavy setup.

## What’s inside

- desktop shell with a top bar and dock
- draggable windows with minimize, maximize, and close controls
- live clock and calendar
- wallpaper picker and theme switching
- built-in browser with pinned shortcuts
- notes app for quick text capture
- small dinosaur game
- settings panel for customization
- browser storage for theme and wallpaper preferences

## Project structure

- `index.html` — main desktop layout
- `style.css` — styling and UI look
- `script.js` — desktop logic, app behavior, theming, and window controls
- `assets/` — wallpapers, browser assets, and music player files
- `assets/player/music-player.js` — audio player logic
- `assets/browser/home.html` and `pins.json` — browser start page and quick links

## How it works

The app is built as a small front-end system.

HTML handles the desktop layout, dock, wallpaper modal, and app windows. CSS is responsible for the glassy look, responsive layout, and theme colors. JavaScript manages window stacking, dragging, maximizing, the clock, theme changes, and the browser/game interactions.

Most of the behavior is driven by a core `LeafOS` class that sets up the desktop, manages windows, loads apps, and handles state updates.

## License

This project is open for personal and educational use.

---

If you want to try the live version, check it out here: https://sanskarsingh100.github.io/webos/

