# YTFocus

Chrome extension for focus-mode YouTube and Instagram.

## Behavior

- YouTube:
  - redirects home to subscriptions
  - blocks fallback to the default home feed
  - removes related/suggested UI on watch pages
  - blocks Shorts, Explore, Trending, and similar discovery routes
- Instagram:
  - redirects home to the following feed
  - blocks suggested feed/account surfaces and Reels
  - allows only following home, search, recent activity, create, and your own profile
- Popup:
  - simple toggles for YouTube focus and Instagram focus
  - both enabled by default

## Load In Chrome

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select this repo folder

## Files

- `manifest.json`: MV3 config
- `background.js`: top-level redirects + default settings seeding
- `shared-config.js`: site registry + route classification
- `shared-content.js`: storage, SPA hooks, blocked-panel helpers
- `youtube-content.js` / `instagram-content.js`: site-specific focus logic
- `popup.html` / `popup.js`: toggle UI
