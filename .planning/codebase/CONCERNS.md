# Codebase Concerns

**Analysis Date:** 2026-02-17

## Tech Debt

**Unhandled Error Toast in Game Creation:**
- Issue: `TODO: Show error toast` placeholder in create game form
- Files: `app/create/page.tsx` (line 46)
- Impact: Game creation errors silently fail without user feedback. Network failures or validation errors leave user confused
- Fix approach: Implement error toast notification (use existing pattern from join page error messages)

**Silent Error Handling Pattern:**
- Issue: Multiple API calls catch errors but silently ignore them with `// Silent error` or `// Error handled silently` comments
- Files:
  - `app/game/[gameId]/page.tsx` (lines 190-192, 212-214, 232-234, 262-263, 323-325, 337-339, 350-354)
  - `components/issues/IssuesSidebar.tsx` (lines 52-56, 71-73, 93-94, 113-114)
  - `app/game/[gameId]/join/page.tsx` (lines 62-65, 172-174)
- Impact: Bugs in API responses go unnoticed. Users can't debug why actions fail. Makes support difficult
- Fix approach: Log errors to console.error in development, show user-friendly messages in production

**Client-side Admin Check Not Validated Server-Side:**
- Issue: Players can submit admin-only requests; server validates but client doesn't prevent optimistic updates
- Files: `app/game/[gameId]/page.tsx` (lines 223-237, 239-267, 304-326)
- Impact: Non-admin players can trigger API calls that will be rejected, wasting bandwidth. If validation fails due to bugs, unauthorized actions might slip through
- Fix approach: Add optimistic update guard - check `isPlayerAdmin` before any API call on client

**Missing Request Body Validation in Some Routes:**
- Issue: `POST /api/issues` doesn't validate title length or content; `POST /api/players` doesn't validate name length
- Files:
  - `app/api/issues/route.ts` (no title length check)
  - `app/api/players/route.ts` (no name length validation)
- Impact: Database can be populated with empty or extremely long strings. UI may break with edge cases
- Fix approach: Add min/max length validation before database insert

## Known Bugs

**Realtime DELETE Event for Issues Missing Payload.old.id:**
- Symptoms: Issue deletion from sidebar doesn't sync properly to other clients sometimes
- Files: `lib/hooks/useGameRealtime.ts` (lines 141-143), documented workaround in `components/issues/IssuesSidebar.tsx` (line 110)
- Trigger: Delete issue via admin interface, watch another client's sidebar
- Workaround: Zustand store is updated directly after successful DELETE API call (redundant but necessary due to Supabase limitation)
- Note: This is a Supabase Realtime quirk, not a code bug, but affects data sync reliability

**Session Restoration Race Condition:**
- Symptoms: Fast page navigation can cause player to not be restored from saved session
- Files: `lib/store/playerStore.ts` (persist hook), `app/game/[gameId]/page.tsx` (session check)
- Trigger: Navigate quickly from join page to game room to landing and back
- Workaround: Use separate localStorage key `appinium-poker-sessions` outside Zustand persist to avoid race condition
- Impact: Low - user sees join page again instead of returning to game room

**Confidence Vote Modal Can Hide Permanently:**
- Symptoms: User can hide confidence vote modal with "Hide" button, but it won't reappear if admin starts new vote while player has it hidden
- Files: `app/game/[gameId]/page.tsx` (lines 42, 90-94, 587-600)
- Trigger: Player clicks "Hide" on confidence modal, admin clicks "Confidence Vote" button in sidebar
- Impact: Medium - player misses seeing confidence vote started, but can still see in modal if they scroll
- Fix approach: Ignore `hideConfidence` flag when confidence vote status changes to "voting"

## Security Considerations

**No Input Sanitization on Text Fields:**
- Risk: XSS via issue titles, player names, game names. If these are ever displayed in rich contexts (HTML, iframe, etc.)
- Files: `app/api/games/route.ts`, `app/api/players/route.ts`, `app/api/issues/route.ts`
- Current mitigation: React automatically escapes JSX text nodes. Game names/issue titles only displayed in text context, not HTML
- Recommendations:
  - Add length limits to all text fields (max 100 chars for names, 200 for titles)
  - Use DOMPurify if these fields are ever rendered as HTML

**No Rate Limiting on API Routes:**
- Risk: Malicious client can spam endpoints. Create thousands of games, players, votes, or issues
- Files: All `app/api/` routes
- Current mitigation: None
- Recommendations:
  - Add rate limiting middleware (per IP or user session)
  - Add per-game player limits (e.g., max 50 players)
  - Add per-issue vote count validation

**Anonymous Players Can Impersonate Others:**
- Risk: No authentication. Any player can claim to be another player by knowing their ID
- Files: `app/api/players/[playerId]/route.ts`, all vote/confidence submission endpoints
- Current mitigation: None - client sends playerId in request body
- Impact: Low in practice (game is ephemeral, single-session), but technically a vulnerability
- Recommendations:
  - Store player ID in secure HTTP-only cookie on join
  - Validate cookie matches request body on updates

**GameId Collision Risk:**
- Risk: `createGameId()` generates random short IDs. Collision is unlikely but possible
- Files: `lib/utils/gameId.ts` (probably using nanoid or similar)
- Current mitigation: Supabase PRIMARY KEY constraint will catch duplicates
- Recommendations: Accept current approach (very low collision risk with nanoid), but document this assumption

## Performance Bottlenecks

**Full Data Refetch on Every Realtime Change:**
- Problem: `useGameRealtime` hook fetches ALL issues, ALL votes, ALL confidence votes on page load, then patches store on individual updates
- Files: `lib/hooks/useGameRealtime.ts` (lines 20-77)
- Cause: Fetch pattern doesn't scale. With 50+ issues and 100+ votes, initial load becomes slow
- Improvement path:
  - Implement pagination for issues list
  - Use Supabase PostgREST limits on fetch (e.g., `.limit(100)`)
  - Lazy-load vote data only for current issue

**Large PlayerSeat Component Re-renders:**
- Problem: `PlayerSeat` component in game room renders for every player on every vote/reveal change
- Files: `app/game/[gameId]/page.tsx` (lines 522-551)
- Cause: Player positions array is recalculated every render, split on line 523/539
- Improvement path:
  - Memoize `PlayerSeat` components with React.memo
  - Cache split calculation with useMemo
  - Move player layout logic out of main component

**No Query Pagination on Issues/Players Lists:**
- Problem: If a game has 100+ players or issues, full list is fetched and rendered at once
- Files: `app/api/games/[gameId]/route.ts` (line 40-43 for players), `IssuesSidebar` rendering (line 184)
- Cause: No limit in Supabase queries
- Improvement path: Implement cursor-based pagination with `.limit(50)`

## Fragile Areas

**Issues Sidebar Complex Prop Drilling:**
- Files: `components/issues/IssuesSidebar.tsx` (IssueCard component has 8 callback props)
- Why fragile: Many state handlers for edit/delete/select. Easy to pass wrong callback. Hard to trace data flow
- Safe modification: Use composition pattern to split into smaller components (e.g., IssueEditForm, IssueDeleteConfirm)
- Test coverage: No tests exist for edit/delete workflows. Changes here break easily
- Risk: High - issue management is admin-only, but breaking admin UX breaks entire game session

**Realtime Subscription Cleanup Timing:**
- Files: `lib/hooks/useGameRealtime.ts` (lines 82-83, 100-101, 176-183)
- Why fragile: Timeout-based subscription delay (100ms) is arbitrary. Can race with component unmount in StrictMode
- Safe modification: Use ref to track mounted state, test with StrictMode enabled (currently enabled in dev)
- Test coverage: No tests for StrictMode re-render scenarios
- Risk: Medium - race condition is caught by existing `isMounted` flag, but timing is brittle

**Game Status State Machine Not Enforced:**
- Files: `app/api/games/route.ts`, `lib/store/gameStore.ts`
- Why fragile: Game can transition from any status to any other status without validation
- Current states: `"voting"`, `"revealed"`
- Confidence states: `"idle"`, `"voting"`, `"revealed"`
- Safe modification: Add validation in API route to check allowed transitions
- Test coverage: No tests for status transitions
- Risk: Low - only admin can change status, but bugs could leave game in invalid state

**Avatar Selection Race Condition:**
- Files: `app/game/[gameId]/join/page.tsx` (lines 93-105, 129-135)
- Why fragile: Two players can select same avatar simultaneously before server responds
- Current mitigation: Server-side check returns 409, client refreshes list
- Risk: Low - handled with error recovery, but UX shows error instead of graceful selection
- Safe modification: Use optimistic locking or implement avatar reservation on client

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: All calculation functions, vote averaging logic, confidence average calculation
- Files: `lib/utils/calculations.ts` (imported but never tested)
- Risk: High - averaging logic is core to app. Changes break silently
- Priority: High - add tests for `calculateAverage()` function

**No Realtime Sync Tests:**
- What's not tested: Subscription callbacks, vote sync between clients, issue deletion sync
- Files: `lib/hooks/useGameRealtime.ts` (no E2E tests for 2+ client sync)
- Risk: High - entire app depends on realtime sync working
- Priority: High - add E2E tests with Playwright for multiplayer scenarios

**No API Route Tests:**
- What's not tested: Admin permission checks, avatar uniqueness validation, error handling
- Files: All `app/api/` routes
- Risk: High - bugs in permission checks are security issues
- Priority: High - add integration tests for each API endpoint

**No Component Tests:**
- What's not tested: Profile menu, avatar modal, confidence vote modal interactions
- Files: `app/game/[gameId]/page.tsx` (embed multiple modals without isolated tests)
- Risk: Medium - UI bugs break game experience
- Priority: Medium - add React Testing Library tests for modals

**No Error Scenario Tests:**
- What's not tested: Network failures, game not found, player removed from game, avatar taken race condition
- Risk: High - users encounter edge cases but app behavior is untested
- Priority: Medium - add mock API tests for error paths

## Scaling Limits

**Single Supabase Client Singleton:**
- Current capacity: Single shared client for entire app
- Limit: May reach connection limits or auth issues if scaling to many concurrent connections
- Scaling path: Currently fine for MVP. If scaling beyond 100 concurrent users, consider connection pooling
- Files: `lib/supabase/client.ts` (line 13)

**No Database Indexes on Foreign Keys:**
- Current capacity: Queries work fine with <100 games
- Limit: Queries will slow down with 10,000+ games due to missing indexes on `game_id`, `player_id`, `issue_id`
- Scaling path: Add database indexes:
  ```sql
  CREATE INDEX idx_players_game_id ON players(game_id);
  CREATE INDEX idx_issues_game_id ON issues(game_id);
  CREATE INDEX idx_votes_issue_id ON votes(issue_id);
  CREATE INDEX idx_votes_player_id ON votes(player_id);
  CREATE INDEX idx_confidence_votes_game_id ON confidence_votes(game_id);
  ```

**Realtime Channel Limits:**
- Current capacity: Supabase free tier allows ~100 realtime connections per project
- Limit: App will slow down or disconnect if 100+ concurrent games
- Scaling path: Consider connection pooling or migrate to paid tier

**Client-Side Store Growth:**
- Current capacity: Zustand stores all votes, issues, players, confidence votes in memory
- Limit: With 50 issues × 50 players = 2,500 votes, plus metadata, can cause memory issues on low-end devices
- Scaling path: Implement virtual scrolling for issues list, paginate votes

## Dependencies at Risk

**Zustand Persist Plugin:**
- Risk: Using localStorage for session persistence outside Zustand's built-in persist (workaround for race condition)
- Impact: If localStorage is cleared or corrupted, session is lost
- Migration plan: If persist becomes unreliable, switch to URL-based state (game ID is already in URL)

**Supabase Realtime Events Incomplete:**
- Risk: DELETE events don't include `payload.old.id` - documented Supabase quirk
- Impact: Issue deletion sync requires manual refetch workaround
- Migration plan: Implement manual polling fallback if realtime becomes unreliable

**Next.js App Router Dynamic Params:**
- Risk: `params` in route handlers returns `Promise<>` in Next.js 15+. Code handles this but could break if pattern changes
- Impact: Game lookup by ID would break
- Migration plan: Already handled correctly with `await params` pattern

## Missing Critical Features

**No Persistent Storage Between Sessions:**
- Problem: Game sessions are ephemeral. Closing tab loses all data (by design), but no export functionality
- Blocks: Teams can't save sprint planning results for historical analysis
- Workaround: Take screenshot or manually record results
- Priority: Low (MVP feature, not required)

**No Real-Time Notifications:**
- Problem: Players don't know when admin reveals, changes issue, or starts confidence vote (must watch screen)
- Blocks: Desktop notifications would improve UX but not required for MVP
- Priority: Low - visible state changes are sufficient

**No Game Spectator Mode:**
- Problem: Spectators can join but can't see confidence votes or vote results in dedicated display
- Blocks: External observers (product owner, etc.) can watch but not see details
- Priority: Medium - affects observer experience but not core game flow

## Comments & Documentation

**Missing JSDoc on Complex Functions:**
- Files: `lib/utils/calculations.ts`, `lib/hooks/useGameRealtime.ts`, `app/api/games/[gameId]/route.ts`
- Impact: Future changes to vote calculation or realtime subscription logic are risky
- Fix: Add JSDoc comments explaining algorithm, expected inputs, and edge cases

**No Architecture Diagrams:**
- Impact: New developers must reverse-engineer data flow from code
- Fix: Add architectural docs showing: Create → Join → Vote → Reveal flow with state transitions

**Inconsistent Error Message Patterns:**
- Impact: Some errors are user-facing ("Avatar already taken"), others are technical ("Failed to submit vote: ...")
- Fix: Create error dictionary with consistent messaging

---

*Concerns audit: 2026-02-17*
