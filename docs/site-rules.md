---
summary: Route and UI rules for YouTube and Instagram focus mode.
read_when:
  - changing allowed or blocked routes
  - debugging redirect behavior
  - updating content hiding rules
  - reviewing product behavior for each platform
---

# Site Rules

## YouTube

### Redirects

- `/` -> `/feed/subscriptions`
- `/feed/recommended` -> `/feed/subscriptions`

### Allowed routes

- subscriptions
- watch pages
- search results
- playlists
- channels and user pages
- history
- library
- notifications
- account pages

### Blocked or suppressed surfaces

- home recommendation feed
- Shorts
- Explore
- Trending
- discovery shelves
- watch-page related videos
- autoplay / secondary results
- end-screen recommendation UI

### Fallback behavior

If subscriptions are unavailable, the extension shows a blocked overlay with links for:

- Subscriptions
- Search
- Sign in

## Instagram

### Redirects

- `/` -> `/?variant=following`

### Allowed routes

- following home
- search
- DMs / direct inbox
- recent activity
- create
- login
- all profile pages
- direct post permalinks
- direct reel permalinks

### Blocked routes

- Reels browsing routes
- most non-allowlisted routes
- story routes and non-allowlisted media routes currently classified as `other`

### Suppressed surfaces inside allowed routes

- suggestion-labeled feed modules
- suggestion-labeled account modules
- Reels entrypoints caught by selector rules

### Fallback behavior

If the following feed appears unavailable, the extension blocks the page and shows allowed navigation links instead of allowing the suggested home feed through.

Blocked Instagram overlays currently expose links for:

- Following home
- Search
- DMs
- Recent activity
- Create
- My profile
- Sign in

## Notes on heuristics

Route classification is deterministic. DOM hiding is heuristic and currently depends on:

- known path patterns
- visible suggestion text
- nav/profile anchor detection

If a platform changes markup, route blocking usually keeps working before selector cleanup does.
