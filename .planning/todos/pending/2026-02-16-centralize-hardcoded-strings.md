---
created: 2026-02-16T22:21:00.037Z
title: Centralize hardcoded strings
area: general
priority: suggestion
files:
  - app/create/page.tsx:27
  - app/game/[gameId]/join/page.tsx:20
  - app/game/[gameId]/page.tsx:513
  - lib/constants.ts
---

## Problem

"Planning Session" string appears in multiple files:
- `app/create/page.tsx:27` — default game name
- `app/game/[gameId]/join/page.tsx:20` — fallback game name
- `app/game/[gameId]/page.tsx:513` — header fallback

Changing the default requires updating multiple files.

## Solution

1. Add to `lib/constants.ts`:
   ```typescript
   export const DEFAULT_GAME_NAME = "Planning Session";
   ```
2. Import and use in all three locations
3. Search for other hardcoded strings that should be centralized
