---
created: 2026-02-16T22:21:00.037Z
title: Validate vote values in API
area: api
priority: warning
files:
  - app/api/votes/route.ts:14-32
  - lib/constants.ts:1-16
---

## Problem

`POST /api/votes` doesn't validate that `value` is a valid voting card. Currently only checks for existence:

```typescript
if (!body.issueId || !body.playerId || !body.value) {
  // Only checks existence, not valid values
}
```

This allows storing arbitrary strings like "999", "hello", or injection attempts.

## Solution

1. Import VOTING_CARDS from constants
2. Validate value against allowed values:
   ```typescript
   const validValues = VOTING_CARDS.map(c => c.value);
   if (!validValues.includes(body.value)) {
     return NextResponse.json(
       { error: "Invalid vote value" },
       { status: 400 }
     );
   }
   ```
