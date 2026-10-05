# Leaf OS

A lightweight desktop-style web app built with HTML, CSS, and JavaScript. It recreates the feel of a mini operating system with a floating window UI, dock launcher, wallpaper switching, browser, notes, settings, clock, and a simple dinosaur game.

Live demo: https://sanskarsingh100.github.io/webos/

## Overview

Leaf OS is designed as a single-page desktop environment that runs directly in the browser. Instead of relying on a heavy framework, the project uses plain web technologies to make the experience fast, lightweight, and easy to customize.

The interface is built around a few core ideas:

- A desktop shell with a top bar and dock
- Draggable, closable, maximizable window apps
- Theme and wallpaper customization using CSS variables and local storage
- Lightweight app modules that behave like mini desktop tools
- Static hosting with no backend required

## How it is built

The app is structured as a small front-end system:

- HTML defines the desktop layout, dock, wallpaper modal, and app windows
- CSS handles the futuristic glassmorphism styling, responsive layout, and theme colors
- JavaScript manages app state, window behavior, local storage, wallpaper switching, and browser/game interactions

A core `LeafOS` class controls the whole desktop environment. It creates windows, manages their stacking order, handles dragging and maximizing, updates the clock, manages theme changes, and initializes the available apps.

The project also includes a custom music player script and several wallpaper HTML assets, which are loaded into the desktop and embedded through the browser UI.

## Features

- Desktop-style interface with launch dock
- Drag-and-drop window management
- Minimize, maximize, and close controls for each app
- Live clock and calendar
- Wallpaper picker with custom themes
- Built-in browser with pinned shortcuts and URL navigation
- Notes app for quick text capture
- Simple side-scrolling dinosaur game
- Settings panel for customization
- Local persistence using browser storage for theme and wallpaper preferences
- Static deployment ready for GitHub Pages

## Project structure

- `index.html` — main desktop shell and app layout
- `style.css` — visual design and desktop styling
- `script.js` — OS logic for windows, apps, theming, and desktop behavior
- `assets/` — wallpapers, browser resources, and music player assets
- `assets/player/music-player.js` — audio player logic
- `assets/browser/home.html` and `pins.json` — browser start page and quick links

## Run locally

Because this is a static web app, you can run it with any simple local web server.

### Option 1: Open directly

Open `index.html` in a browser.

### Option 2: Use a local server

```bash
cd /workspaces/webos
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000
```

## Deployment

This project is designed to be deployed as a static site. It is ready for GitHub Pages or any similar static hosting platform.

## Why this project is useful

This project is a great example of building a desktop-style interface without a framework. It demonstrates:

- component-like UI structure in vanilla JavaScript
- state handling with browser storage
- dynamic DOM updates
- app simulation patterns
- polished UI without external dependencies

## License

This project is open for personal and educational use.

---

If you want to explore the live version, visit: https://sanskarsingh100.github.io/webos/

