---
phase: 4-bug-fixes
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - app/api/votes/route.ts
  - app/api/issues/route.ts
  - app/api/issues/[issueId]/route.ts
  - app/game/[gameId]/page.tsx
autonomous: true
requirements:
  - BUGS-01
  - BUGS-02
  - BUGS-03
  - BUGS-04
  - BUGS-07

must_haves:
  truths:
    - "Vote upsert is atomic (no race condition)"
    - "Only admin can clear votes"
    - "Only admin can create/edit/delete issues"
    - "Issues cannot be manipulated cross-game"
    - "Invalid vote values are rejected"
  artifacts:
    - path: "app/api/votes/route.ts"
      provides: "Atomic upsert + admin DELETE + value validation"
      contains: "upsert.*onConflict"
    - path: "app/api/issues/route.ts"
      provides: "Admin auth on POST"
      contains: "creator_id"
    - path: "app/api/issues/[issueId]/route.ts"
      provides: "Game ownership + admin check on PATCH/DELETE"
      contains: "403"
  key_links:
    - from: "app/api/votes/route.ts"
      to: "lib/constants.ts"
      via: "VOTING_CARDS validation"
      pattern: "VOTING_CARDS"
---

<objective>
Fix all 5 critical/high-priority API security vulnerabilities.

Purpose: Prevent unauthorized access to admin-only operations and ensure data integrity.
Output: Hardened API routes with proper auth checks and atomic operations.
</objective>

<execution_context>
@/Users/eliseyramsey/.claude/get-shit-done/workflows/execute-plan.md
@/Users/eliseyramsey/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/todos/pending/2026-02-16-fix-race-condition-in-vote-upsert.md
@.planning/todos/pending/2026-02-16-add-admin-auth-to-delete-votes.md
@.planning/todos/pending/2026-02-16-add-admin-auth-to-post-issues.md
@.planning/todos/pending/2026-02-16-add-game-ownership-check-to-issues-crud.md
@.planning/todos/pending/2026-02-16-validate-vote-values-in-api.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Fix vote upsert race condition + add value validation</name>
  <files>app/api/votes/route.ts</files>
  <action>
1. Replace SELECT+INSERT/UPDATE pattern with atomic upsert (same as /api/confidence):
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

2. Add vote value validation at the start of POST:
   ```typescript
   import { VOTING_CARDS } from "@/lib/constants";

   const validValues = VOTING_CARDS.map(c => c.value);
   if (!validValues.includes(body.value)) {
     return NextResponse.json(
       { error: "Invalid vote value" },
       { status: 400 }
     );
   }
   ```

3. Database already has UNIQUE constraint on (issue_id, player_id) from migrations.
  </action>
  <verify>
- `npm run build` passes
- Test invalid vote: `curl -X POST /api/votes -d '{"issueId":"x","playerId":"y","value":"999"}' -H "Content-Type: application/json"` returns 400
  </verify>
  <done>Vote submission uses atomic upsert, invalid values rejected with 400</done>
</task>

<task type="auto">
  <name>Task 2: Add admin auth to DELETE /api/votes</name>
  <files>app/api/votes/route.ts</files>
  <action>
1. Add `adminPlayerId` query parameter to DELETE endpoint
2. Look up issue to get game_id, then game to get creator_id
3. Verify adminPlayerId === creator_id before deleting

```typescript
export async function DELETE(request: NextRequest) {
  // ... existing config checks ...

  const { searchParams } = new URL(request.url);
  const issueId = searchParams.get("issueId");
  const adminPlayerId = searchParams.get("adminPlayerId");

  if (!issueId || !adminPlayerId) {
    return NextResponse.json(
      { error: "issueId and adminPlayerId are required" },
      { status: 400 }
    );
  }

  // Get issue to find game_id
  const { data: issue } = await supabase
    .from("issues")
    .select("game_id")
    .eq("id", issueId)
    .single();

  if (!issue) {
    return NextResponse.json({ error: "Issue not found" }, { status: 404 });
  }

  // Verify admin
  const { data: game } = await supabase
    .from("games")
    .select("creator_id")
    .eq("id", (issue as { game_id: string }).game_id)
    .single();

  if ((game as { creator_id: string })?.creator_id !== adminPlayerId) {
    return NextResponse.json(
      { error: "Only admin can clear votes" },
      { status: 403 }
    );
  }

  // ... delete votes ...
}
```

4. Update frontend call in game room page to pass `adminPlayerId` query param
  </action>
  <verify>
- `npm run build` passes
- Test non-admin clear: `curl -X DELETE "/api/votes?issueId=x&adminPlayerId=fake"` returns 403
  </verify>
  <done>DELETE /api/votes requires admin auth, returns 403 for non-admins</done>
</task>

<task type="auto">
  <name>Task 3: Add admin auth to issues CRUD</name>
  <files>app/api/issues/route.ts, app/api/issues/[issueId]/route.ts, app/game/[gameId]/page.tsx</files>
  <action>
**POST /api/issues:**
1. Add `playerId` to CreateIssueBody interface
2. Look up game to get creator_id
3. Verify playerId === creator_id
4. Return 403 if not admin

```typescript
interface CreateIssueBody {
  gameId: string;
  playerId: string;  // Add this
  title: string;
  description?: string | null;
}

// In POST handler after validation:
const { data: game } = await supabase
  .from("games")
  .select("creator_id")
  .eq("id", body.gameId)
  .single();

if ((game as { creator_id: string })?.creator_id !== body.playerId) {
  return NextResponse.json(
    { error: "Only admin can create issues" },
    { status: 403 }
  );
}
```

**PATCH /api/issues/[issueId]:**
1. Add `gameId` and `playerId` to UpdateIssueBody
2. Verify issue belongs to gameId
3. Verify playerId === game.creator_id

**DELETE /api/issues/[issueId]:**
1. Add query params: `?gameId=xxx&playerId=yyy`
2. Same verification as PATCH

**Frontend updates:**
In game room page, update all issue mutation calls to include playerId from currentPlayer.
  </action>
  <verify>
- `npm run build` passes
- Test non-admin create: POST with non-admin playerId returns 403
- Test cross-game edit: PATCH with wrong gameId returns 403/404
  </verify>
  <done>All issues CRUD requires admin auth, cross-game manipulation blocked</done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Run `npm run build` - should pass
2. Run `npm run test` if tests exist - should pass
3. Manual test: Open app, create game, verify:
   - Non-admin cannot clear votes (check network tab for 403)
   - Non-admin cannot create/edit/delete issues
   - Invalid vote values rejected
</verification>

<success_criteria>
1. All 5 security bugs fixed (BUGS-01, 02, 03, 04, 07)
2. API routes validate admin permissions
3. Invalid input rejected with appropriate status codes
4. Build passes, no TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/phases/4-bug-fixes/4-01-SUMMARY.md`
</output>
