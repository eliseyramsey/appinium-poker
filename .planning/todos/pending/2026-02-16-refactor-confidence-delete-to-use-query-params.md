---
created: 2026-02-16T22:21:00.037Z
title: Refactor confidence DELETE to use query params
area: api
priority: warning
files:
  - app/api/confidence/route.ts:80-141
---

## Problem

DELETE endpoint uses JSON body which is non-standard according to HTTP spec:

```typescript
const body = (await request.json()) as ClearConfidenceBody;
```

Most HTTP clients and proxies expect DELETE to have no body. This can cause issues with caching, proxies, and some HTTP libraries.

## Solution

Refactor to use query parameters like `/api/votes` DELETE does:

```typescript
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  const playerId = searchParams.get("playerId");
  // ...
}
```

Update frontend call accordingly.
