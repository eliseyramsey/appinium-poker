---
created: 2026-02-16T22:21:00.037Z
title: Fix join page error state bug
area: ui
priority: suggestion
files:
  - app/game/[gameId]/join/page.tsx:172-174
---

## Problem

Generic errors don't show any message to the user. Loading state is cleared but no error is displayed:

```typescript
} catch (error) {
  setIsLoading(false);
  // Missing: setError("Failed to join game")
}
```

User sees button become clickable again but has no idea what went wrong.

## Solution

```typescript
} catch (error) {
  setIsLoading(false);
  setError("Failed to join game. Please try again.");
}
```

Consider also logging error to console in development for debugging.
