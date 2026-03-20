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
  - blocks suggested feed/account surfaces
  - blocks Reels browsing routes
  - allows search, DMs, recent activity, create, login, profile pages, direct post links, and direct reel links
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
- `shared-content.js`: storage, SPA hooks, blocked-panel helpers, action navigation
- `youtube-content.js` / `instagram-content.js`: site-specific focus logic
- `popup.html` / `popup.js`: toggle UI

## Validation

```sh
python3 -m json.tool manifest.json
node --check background.js
node --check shared-config.js
node --check shared-content.js
node --check youtube-content.js
node --check instagram-content.js
node --check popup.js
```
