---
created: 2026-02-16T22:21:00.037Z
title: Add admin auth to DELETE /api/votes
area: api
priority: critical
files:
  - app/api/votes/route.ts:86-121
---

## Problem

Anyone can clear all votes for any issue by calling `DELETE /api/votes?issueId=xxx`. No authorization check. This should be admin-only operation since clearing votes resets the round.

Currently:
```typescript
export async function DELETE(request: NextRequest) {
  const issueId = searchParams.get("issueId");
  // No playerId or admin validation!
  await supabase.from("votes").delete().eq("issue_id", issueId);
}
```

## Solution

Add `adminPlayerId` query parameter and verify against game's `creator_id`:

1. Get issueId and adminPlayerId from query params
2. Lookup issue to get game_id
3. Lookup game to get creator_id
4. Verify adminPlayerId === creator_id
5. Return 403 if not admin
