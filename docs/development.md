---
summary: Local validation, debugging workflow, and doc maintenance notes.
read_when:
  - validating a change before commit
  - debugging broken selectors or overlays
  - updating docs after behavior changes
---

# Development

## Local validation

Static checks currently used in this repo:

```sh
python3 -m json.tool manifest.json
node --check background.js
node --check shared-config.js
node --check shared-content.js
node --check youtube-content.js
node --check instagram-content.js
node --check popup.js
```

## Manual browser checks

Reload the unpacked extension in `chrome://extensions` after code changes, then verify:

### YouTube

- home redirects to subscriptions
- related videos stay hidden on watch pages
- discovery routes show the blocked overlay
- popup toggle disables and re-enables behavior without reinstalling

### Instagram

- home redirects to following mode
- Reels routes are blocked
- DMs remain reachable
- profile pages remain reachable
- suggestion-labeled feed/account modules disappear when present
- popup toggle disables and re-enables behavior without reinstalling

## Known weak points

- Instagram DOM and labels change often; suggestion hiding is text-heuristic based
- YouTube selectors for nav and watch-page cleanup may need periodic updates
- route redirects are more reliable than CSS-based cleanup

## Doc maintenance

This repo uses `list-docs.py` to scan `docs/*.md` front matter. Keep each doc updated when behavior changes:

- `summary`: one-line doc description
- `read_when`: short hints for when the doc should be opened before editing
