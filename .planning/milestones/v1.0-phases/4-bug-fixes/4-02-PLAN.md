---
phase: 4-bug-fixes
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/supabase/client.ts
  - lib/utils/calculations.ts
  - app/api/confidence/route.ts
  - lib/constants.ts
  - app/create/page.tsx
  - app/game/[gameId]/join/page.tsx
  - app/game/[gameId]/page.tsx
  - lib/hooks/useGameRealtime.ts
autonomous: true
requirements:
  - BUGS-05
  - BUGS-08
  - BUGS-09
  - BUGS-12
  - BUGS-13

must_haves:
  truths:
    - "No unsafe supabase export exists"
    - "getMemeCategory exists in only one place"
    - "DELETE /api/confidence uses query params"
    - "DEFAULT_GAME_NAME constant exists and is used"
    - "useEffect deps limitation is documented"
  artifacts:
    - path: "lib/supabase/client.ts"
      provides: "Only getSupabase export, no module-level supabase"
      exports: ["getSupabase", "isSupabaseConfigured"]
    - path: "lib/utils/calculations.ts"
      provides: "No getMemeCategory (moved to memeData)"
    - path: "lib/constants.ts"
      provides: "DEFAULT_GAME_NAME constant"
      contains: "DEFAULT_GAME_NAME"
    - path: "lib/hooks/useGameRealtime.ts"
      provides: "Documented deps limitation"
      contains: "eslint-disable"
  key_links:
    - from: "app/create/page.tsx"
      to: "lib/constants.ts"
      via: "DEFAULT_GAME_NAME import"
      pattern: "DEFAULT_GAME_NAME"
---

<objective>
Clean up code quality issues: remove unsafe patterns, dedupe code, improve API design.

Purpose: Reduce tech debt and improve maintainability.
Output: Cleaner codebase with better patterns.
</objective>

<execution_context>
@/Users/eliseyramsey/.claude/get-shit-done/workflows/execute-plan.md
@/Users/eliseyramsey/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/todos/pending/2026-02-16-remove-unsafe-supabase-export.md
@.planning/todos/pending/2026-02-16-remove-duplicate-getmemecategory.md
@.planning/todos/pending/2026-02-16-refactor-confidence-delete-to-use-query-params.md
@.planning/todos/pending/2026-02-16-centralize-hardcoded-strings.md
@.planning/todos/pending/2026-02-16-document-useeffect-deps-limitation.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Remove unsafe supabase export + dedupe getMemeCategory</name>
  <files>lib/supabase/client.ts, lib/utils/calculations.ts</files>
  <action>
**lib/supabase/client.ts:**
1. Remove line 32: `export const supabase = ...`
2. Keep only `getSupabase()` and `isSupabaseConfigured()` exports
3. Search codebase for `import { supabase }` - all files should already use `getSupabase()`

**lib/utils/calculations.ts:**
1. Remove `getMemeCategory` function (lines 55-63)
2. Remove `MemeCategory` type export (line 55)
3. Keep other calculation functions (calculateAverage, getClosestFibonacci, hasConsensus, getVoteSpread)
4. Update any imports to use getMemeCategory from `components/memes/memeData.ts` instead

Check for usages:
```bash
grep -r "getMemeCategory" --include="*.ts" --include="*.tsx"
```

The game room page should already import from memeData.ts.
  </action>
  <verify>
- `npm run build` passes
- `grep "export const supabase" lib/supabase/client.ts` returns nothing
- `grep "getMemeCategory" lib/utils/calculations.ts` returns nothing
  </verify>
  <done>Unsafe supabase export removed, getMemeCategory exists only in memeData.ts</done>
</task>

<task type="auto">
  <name>Task 2: Refactor confidence DELETE to use query params + centralize strings</name>
  <files>app/api/confidence/route.ts, lib/constants.ts, app/create/page.tsx, app/game/[gameId]/join/page.tsx, app/game/[gameId]/page.tsx</files>
  <action>
**app/api/confidence/route.ts:**
1. Change DELETE to use query params instead of JSON body:

```typescript
export async function DELETE(request: NextRequest) {
  // ...
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");
  const playerId = searchParams.get("playerId");

  if (!gameId || !playerId) {
    return NextResponse.json(
      { error: "gameId and playerId query params are required" },
      { status: 400 }
    );
  }
  // ... rest of logic ...
}
```

2. Update frontend calls to use query params:
   `fetch(\`/api/confidence?gameId=${gameId}&playerId=${playerId}\`, { method: "DELETE" })`

**lib/constants.ts:**
Add at the end:
```typescript
// Default values
export const DEFAULT_GAME_NAME = "Planning Session";
```

**app/create/page.tsx:**
```typescript
import { DEFAULT_GAME_NAME } from "@/lib/constants";
// Replace "Planning Session" with DEFAULT_GAME_NAME
```

**app/game/[gameId]/join/page.tsx:**
```typescript
import { DEFAULT_GAME_NAME } from "@/lib/constants";
// Replace fallback "Planning Session" with DEFAULT_GAME_NAME
```

**app/game/[gameId]/page.tsx:**
```typescript
import { DEFAULT_GAME_NAME } from "@/lib/constants";
// Replace fallback "Planning Session" with DEFAULT_GAME_NAME
```
  </action>
  <verify>
- `npm run build` passes
- `grep -r '"Planning Session"' app/` returns nothing (all replaced)
- Test: confidence DELETE endpoint works with query params
  </verify>
  <done>DELETE /api/confidence uses query params, hardcoded strings centralized</done>
</task>

<task type="auto">
  <name>Task 3: Document useEffect deps limitation</name>
  <files>lib/hooks/useGameRealtime.ts</files>
  <action>
Add explanatory comment before the useEffect dependency array:

```typescript
    // ...cleanup function...
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Intentionally limited to [gameId] only:
    // - store methods (setGame, setPlayers, etc.) are stable refs from Zustand
    // - We don't want to re-subscribe on every state change
    // - Re-subscribing causes WebSocket churn and potential message loss
  }, [gameId]);
```

This documents the intentional choice for future maintainers.
  </action>
  <verify>
- `npm run build` passes
- Comment exists explaining deps limitation
  </verify>
  <done>useEffect deps limitation documented with clear reasoning</done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Run `npm run build` - should pass
2. Verify no TypeScript errors
3. Test confidence delete in browser - should work with new endpoint format
</verification>

<success_criteria>
1. All 5 quality bugs fixed (BUGS-05, 08, 09, 12, 13)
2. No unsafe exports
3. No duplicate code
4. Constants centralized
5. Code properly documented
</success_criteria>

<output>
After completion, create `.planning/phases/4-bug-fixes/4-02-SUMMARY.md`
</output>
