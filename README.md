# YTFocus

Chrome extension for a subscriptions-first YouTube.

## Behavior

- Redirects YouTube home to subscriptions
- Blocks fallback to the default home feed
- Removes related/suggested UI on watch pages
- Blocks Shorts, Explore, Trending, and similar discovery routes

## Load In Chrome

1. Open `chrome://extensions`
2. Enable Developer mode
3. Click Load unpacked
4. Select this repo folder

## Files

- `manifest.json`: MV3 config
- `background.js`: top-level route redirects
- `shared-config.js`: route classification shared by worker + content script
- `content.js`: SPA handling, blocked-state UI
- `content.css`: YouTube UI suppression rules
