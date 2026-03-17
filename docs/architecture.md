---
summary: Runtime architecture for redirects, shared utilities, popup state, and site controllers.
read_when:
  - changing manifest permissions or matches
  - refactoring the background worker
  - editing popup settings behavior
  - adding another supported site
---

# Architecture

## Runtime split

The extension is organized around four layers:

1. `manifest.json`
   - host permissions
   - content script registration per site
   - popup entrypoint
   - background service worker
2. `shared-config.js`
   - default settings
   - site registry
   - route classification helpers
3. `shared-content.js`
   - storage reads
   - storage change listeners
   - SPA navigation hooks
   - DOM observation
   - blocked-panel rendering
   - hide/unhide helpers
4. site-specific controllers
   - `youtube-content.js`
   - `instagram-content.js`

## Background worker

`background.js` does two things:

- seeds `chrome.storage.sync` with default settings on install
- intercepts top-level navigation events and redirects only when the active site's focus mode is enabled

Redirect logic is route-driven, not selector-driven. The background script asks `shared-config.js` for:

- which site a URL belongs to
- whether that route has a `redirectTarget`

## Popup

`popup.html` + `popup.js` are intentionally minimal:

- two checkboxes
- no save button
- writes happen immediately on change

Content scripts subscribe to `chrome.storage.onChanged`, so toggle flips should re-apply behavior without reloading the extension.

## Content lifecycle

Each site controller follows the same pattern:

- read current settings
- install SPA navigation hooks
- install a mutation observer
- schedule route re-application
- clean up hidden state when disabled

The blocked overlay is shared and created lazily per site with a unique panel id.

## Adding another site

To add another platform, keep the same shape:

- add a site entry in `shared-config.js`
- extend `manifest.json` matches and host permissions
- create a new content controller and optional site CSS
- wire popup state only if the site needs a user-facing toggle
