---
phase: 4-bug-fixes
plan: 01
subsystem: api-security
tags:
  - security
  - api
  - auth
  - votes
  - issues
dependency-graph:
  requires: []
  provides:
    - atomic-vote-upsert
    - admin-auth-votes
    - admin-auth-issues
    - vote-value-validation
    - cross-game-protection
  affects:
    - app/api/votes/route.ts
    - app/api/issues/route.ts
    - app/api/issues/[issueId]/route.ts
    - app/game/[gameId]/page.tsx
    - components/issues/IssuesSidebar.tsx
tech-stack:
  added: []
  patterns:
    - atomic-upsert
    - admin-verification
    - query-param-auth
key-files:
  created: []
  modified:
    - app/api/votes/route.ts
    - app/api/issues/route.ts
    - app/api/issues/[issueId]/route.ts
    - app/game/[gameId]/page.tsx
    - components/issues/IssuesSidebar.tsx
decisions:
  - Use atomic upsert instead of SELECT+INSERT/UPDATE to prevent race conditions
  - Validate vote values against VOTING_CARDS constants at API level
  - Require adminPlayerId query param for DELETE operations
  - Verify game ownership before issue CRUD to prevent cross-game manipulation
metrics:
  duration: 4m
  completed: 2026-02-16T22:41:00Z
---

# Phase 4 Plan 01: API Security Fixes Summary

Hardened API routes with atomic operations, admin auth checks, and input validation to fix 5 critical security vulnerabilities.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 2f54cc6 | fix | Atomic vote upsert + value validation |
| a155376 | fix | Add admin auth to DELETE /api/votes |
| 113e6d2 | fix | Add admin auth to issues CRUD |

## Changes

### Task 1: Fix vote upsert race condition + add value validation

**Files:** `app/api/votes/route.ts`

- Replaced SELECT+INSERT/UPDATE pattern with atomic `upsert({ onConflict: "issue_id,player_id" })`
- Added vote value validation against `VOTING_CARDS` constants
- Returns 400 for invalid vote values (e.g., "999", "invalid")
- Eliminates TOCTOU race condition vulnerability

### Task 2: Add admin auth to DELETE /api/votes

**Files:** `app/api/votes/route.ts`, `app/game/[gameId]/page.tsx`

- Added `adminPlayerId` query parameter requirement
- Verify player is game creator before clearing votes
- Returns 403 for non-admin attempts
- Updated frontend `handleNewRound()` to pass adminPlayerId

### Task 3: Add admin auth to issues CRUD

**Files:** `app/api/issues/route.ts`, `app/api/issues/[issueId]/route.ts`, `components/issues/IssuesSidebar.tsx`

- POST /api/issues: Added `playerId` to body, verify admin before create
- PATCH /api/issues/[id]: Added `gameId` + `playerId` to body, verify issue ownership + admin
- DELETE /api/issues/[id]: Added `gameId` + `playerId` query params, verify ownership + admin
- Updated IssuesSidebar to pass playerId in all mutations
- Cross-game manipulation blocked (403 if issue doesn't belong to specified game)

## Deviations from Plan

None - plan executed exactly as written.

## Security Bugs Fixed

| ID | Priority | Description | Fix |
|----|----------|-------------|-----|
| BUGS-01 | Critical | Race condition in vote upsert (TOCTOU) | Atomic upsert |
| BUGS-02 | Critical | Anyone can clear votes (no auth) | Admin verification |
| BUGS-03 | Critical | Anyone can create issues (no auth) | Admin verification |
| BUGS-04 | Critical | Cross-game issue manipulation | Game ownership check |
| BUGS-07 | Warning | No vote value validation | Validate against VOTING_CARDS |

## Verification

- [x] `npm run build` passes
- [x] TypeScript compiles without errors
- [x] All 5 security vulnerabilities addressed
- [x] API routes validate admin permissions
- [x] Invalid input rejected with 400/403 status codes

## Self-Check: PASSED

All created/modified files verified to exist, all commits verified in git log.
