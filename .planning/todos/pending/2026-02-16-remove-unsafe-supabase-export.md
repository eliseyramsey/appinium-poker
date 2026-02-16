---
created: 2026-02-16T22:21:00.037Z
title: Remove unsafe supabase export
area: api
priority: warning
files:
  - lib/supabase/client.ts:32
---

## Problem

Module-level export `supabase` is evaluated at module load time, before environment variables may be fully loaded in some SSR scenarios:

```typescript
export const supabase = isSupabaseConfigured()
  ? getSupabase()
  : (null as unknown as SupabaseClient<Database>);
```

The `null as unknown as SupabaseClient` cast is dangerous — calling methods on it will throw confusing errors.

## Solution

1. Remove the `export const supabase` line entirely
2. Update all imports to use `getSupabase()` function instead
3. Search codebase for `import { supabase }` and replace with `import { getSupabase }`
