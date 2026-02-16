---
created: 2026-02-16T22:21:00.037Z
title: Generate Supabase types to remove as never
area: api
priority: suggestion
files:
  - app/api/games/route.ts:62
  - app/api/votes/route.ts:50
  - lib/supabase/types.ts
---

## Problem

Multiple API routes use `as never` type assertion to bypass TypeScript:

```typescript
.insert(gameData as never)
.update({ value: body.value } as never)
```

This defeats type safety and could hide bugs where data shape is wrong.

## Solution

1. Install Supabase CLI if not present
2. Generate types from database:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/supabase/database.types.ts
   ```
3. Update `lib/supabase/types.ts` to use generated types
4. Remove all `as never` casts
5. Fix any type errors that surface (these are likely real bugs)
