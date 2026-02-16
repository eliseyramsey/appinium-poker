---
created: 2026-02-16T22:21:00.037Z
title: Add game ownership check to issues CRUD
area: api
priority: critical
files:
  - app/api/issues/[issueId]/route.ts:58-122
---

## Problem

PATCH and DELETE on `/api/issues/[issueId]` don't verify:
1. That the issue belongs to a specific game
2. That the requester is admin of that game

Anyone who knows an issue ID can modify or delete it, even across different games.

```typescript
// Current: No game validation
const { data, error } = await supabase
  .from("issues")
  .update(updateData)
  .eq("id", issueId);  // No game_id or admin check
```

## Solution

1. Add `gameId` and `playerId` to request body
2. Verify issue belongs to the specified game
3. Verify playerId is creator_id of that game
4. Return 403 if not authorized

Alternative: Join issues with games in single query to verify ownership.
