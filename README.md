# Leaf OS

A small desktop-style web app that feels like a mini operating system. It has a dock, floating windows, wallpaper switching, a browser, notes, settings, a clock, and a little dinosaur game.

This was built with plain HTML, CSS, and JavaScript. No backend, no framework, just a browser app that tries to feel like a real desktop.

Live demo: https://sanskarsingh100.github.io/webos/

## What this project does

- desktop shell with a top bar and app dock
- windows you can drag around and resize
- minimize, maximize, and close buttons
- wallpaper and theme switching
- built-in browser with pinned shortcuts
- notes app for quick writing
- settings panel
- tiny side-scrolling dinosaur game
- saved preferences using browser storage

## How it works

The app is built as a single-page front-end project.

- HTML sets up the desktop and app windows
- CSS handles the styling, layout, and theme look
- JavaScript controls the app behavior, window logic, theme switching, and browser/game interactions

The main logic is split across the desktop shell and a few asset files in the `assets/` folder.

## Project structure

- `index.html` — main desktop layout
- `style.css` — look and layout
- `script.js` — desktop behavior and app logic
- `assets/` — wallpapers, browser resources, and music player files
- `assets/player/music-player.js` — music player behavior
- `assets/browser/home.html` and `pins.json` — browser start page and shortcuts

## Why I built it

I wanted to make a tiny desktop interface in the browser and see how much personality you can get out of vanilla web tech. It turns out a lot.

## License

Open for personal and educational use.

