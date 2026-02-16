---
created: 2026-02-16T22:21:00.037Z
title: Fix race condition in vote upsert
area: api
priority: critical
files:
  - app/api/votes/route.ts:37-57
---

## Problem

TOCTOU (Time-of-Check to Time-of-Use) vulnerability in vote submission. Current code does SELECT to check if vote exists, then INSERT or UPDATE separately. If two players submit votes simultaneously, both SELECTs may return "not found", leading to duplicate vote records.

```typescript
// Current problematic code:
const { data: existingVote } = await supabase
  .from("votes")
  .select("id")
  .eq("issue_id", body.issueId)
  .eq("player_id", body.playerId)
  .single();

if (existingVote) {
  // UPDATE
} else {
  // INSERT — race condition window here
}
```

## Solution

Use Supabase upsert with `onConflict` parameter (same pattern as `/api/confidence` route):

```typescript
const { data, error } = await supabase
  .from("votes")
  .upsert(voteData, {
    onConflict: "issue_id,player_id",
    ignoreDuplicates: false
  })
  .select()
  .single();
```

Requires adding UNIQUE constraint on `(issue_id, player_id)` in database if not exists.
