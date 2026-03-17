---
summary: High-level product overview, supported sites, and extension defaults.
read_when:
  - onboarding to the repo
  - explaining what the extension does
  - checking default settings or allowed user flows
---

# Overview

## Purpose

YTFocus is a Chrome Manifest V3 extension that removes recommendation-heavy surfaces from:

- YouTube
- Instagram

The extension is designed around intent-first navigation:

- redirect home pages away from algorithmic feeds
- hide recommendation surfaces that still render inside allowed pages
- block disallowed routes with a small overlay and allowed navigation links

## Defaults

The popup exposes exactly two toggles:

- `youtubeEnabled`
- `instagramEnabled`

Both default to `true` and are stored in `chrome.storage.sync`.

## Supported user flows

### YouTube

- home redirects to subscriptions
- subscriptions, search, watch pages, playlists, channels, history, library, notifications, and account routes remain reachable
- watch pages keep the primary video flow while hiding related and recommendation-heavy UI

### Instagram

- home redirects to the following feed via `/?variant=following`
- search, DMs, recent activity, create, login, and profile pages remain reachable
- all profile pages are allowed
- Reels and non-allowlisted routes are blocked
- suggestion-labeled feed/account modules are hidden when detected

## Constraints

- desktop Chrome target
- MV3 service worker background script
- DOM heuristics are required because both sites are SPA-heavy and change markup frequently
- route enforcement is stronger than selector enforcement; hidden-content heuristics are best-effort
