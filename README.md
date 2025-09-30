# Colorful Snake PWA

A modern, browser-based take on the classic snake arcade game. Built with vanilla HTML, CSS, and JavaScript, the app runs entirely client-side and is installable as a Progressive Web App (PWA) for offline play on desktop or mobile.

## Features

- **Classic gameplay**: steer the snake with arrow keys or WASD, collect food, and avoid collisions.
- **Adaptive board**: the playfield resizes with the browser window while maintaining responsive controls and UI.
- **Speed control**: choose between slow, normal, or fast update rates.
- **Offline-ready**: the service worker caches core assets so the game runs without a network connection.
- **Installable PWA**: includes manifest, icons, and `beforeinstallprompt` handling for “Add to Home Screen”.

## Getting Started

1. **Install dependencies**: none required—everything runs in the browser.
2. **Serve locally** (recommended for testing service workers):
   ```bash
   npx serve .
   ```
   or use any static web server that serves the project root over `http://localhost` or HTTPS.
3. **Play**: open the served URL, press any arrow key to start, and enjoy.

## Project Structure

```
.
+-- index.html          # Main entry point
+-- styles.css          # Layout and theme
+-- game.js             # Game logic and rendering
+-- pwa.js              # Service worker registration & install UI tweaks
+-- sw.js               # Service worker with offline cache
+-- manifest.webmanifest# PWA metadata
+-- icons/              # App icons (192 & 512 px)
+-- product.md          # Product brief / planning
```

## Deployment Notes

- Host the directory on any static site provider (GitHub Pages, Netlify, Vercel, etc.).
- Ensure the site is served over HTTPS (required for PWA install prompts outside `localhost`).
- After deployment, run a Lighthouse audit in Chrome to verify PWA criteria (installable + offline).

## License

Add your preferred license here (e.g., MIT, Apache-2.0). If you need guidance, see [choosealicense.com](https://choosealicense.com).
