---
created: 2026-02-16T22:21:00.037Z
title: Document useEffect deps limitation
area: general
priority: suggestion
files:
  - lib/hooks/useGameRealtime.ts:184
---

## Problem

useEffect dependency array is `[gameId]` only, but callbacks use `store` methods inside:

```typescript
useEffect(() => {
  // ...uses store.setGame, store.setPlayers etc...
}, [gameId]); // Only re-run when gameId changes
```

This is intentional (to avoid re-subscribing on every store update) but undocumented. ESLint exhaustive-deps rule would flag this.

## Solution

Add explanatory comment:

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
// Intentionally limited to [gameId] — store methods are stable and
// we don't want to re-subscribe on every state change
}, [gameId]);
```

Or use `useRef` pattern for store methods to make deps explicit.
