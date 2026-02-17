---
status: resolved
trigger: "ghost-player-after-leave: When user clicks Leave Game and rejoins, their old session remains at the table as a ghost player"
created: 2026-02-17T10:00:00Z
updated: 2026-02-17T10:15:00Z
---

## Current Focus

hypothesis: CONFIRMED - handleLeaveGame only clears localStorage, does NOT call DELETE /api/players/[id]
test: Traced code path: handleLeaveGame -> clearSession -> only localStorage + Zustand state
expecting: Need to add DELETE API call before clearing local session
next_action: Implement fix - add DELETE call to handleLeaveGame

## Symptoms

expected: After Leave Game, old session is deleted from players table. On rejoin, user gets fresh session. If user was admin (creator_id), admin rights transfer or are maintained.
actual: Old player record stays in game (visible at table). New player record created on rejoin. Admin rights stuck on ghost player. Creates "dead user" that can't be removed.
errors: None reported
reproduction: 1) Join game as admin (first player) 2) Click Leave Game in profile menu 3) Rejoin same game via link 4) See: old session still at table + new session added
started: Likely always existed since session persistence was added

## Eliminated

## Evidence

- timestamp: 2026-02-17T10:05:00Z
  checked: app/game/[gameId]/page.tsx lines 192-195
  found: |
    handleLeaveGame only does:
    1. clearSession(gameId) - removes from localStorage
    2. router.push("/") - redirects to landing
    NO API call to delete player from database
  implication: Player record stays in players table, visible to all other users

- timestamp: 2026-02-17T10:06:00Z
  checked: lib/store/playerStore.ts clearSession function
  found: |
    clearSession only:
    1. Removes gameId from localStorage sessions object
    2. Sets currentPlayer and myVote to null in Zustand
    NO database interaction
  implication: This is purely client-side cleanup, database not touched

- timestamp: 2026-02-17T10:07:00Z
  checked: app/api/players/[playerId]/route.ts DELETE endpoint
  found: |
    DELETE endpoint exists and works correctly
    Requires adminPlayerId query param for authorization
    Problem: Leave Game is NOT an admin action - user is deleting themselves
  implication: Need separate self-delete logic OR skip admin check when deleting self

## Resolution

root_cause: handleLeaveGame function only clears localStorage session but does NOT call DELETE API to remove player from database. The DELETE /api/players/[id] endpoint exists but requires adminPlayerId (for kick functionality), so it needs modification to allow self-deletion.

fix:
1. Modified DELETE /api/players/[id] to support selfLeave=true query param
2. Updated handleLeaveGame to call DELETE API with selfLeave=true before clearing local session
3. Added admin transfer logic: if leaving player is admin, transfer to first other player

verification: Build passes. Manual testing required - rejoin same game after Leave Game to confirm ghost player no longer appears.
files_changed:
- app/api/players/[playerId]/route.ts
- app/game/[gameId]/page.tsx
