---
created: 2026-02-16T22:21:00.037Z
title: Add admin auth to POST /api/issues
area: api
priority: critical
files:
  - app/api/issues/route.ts:54-113
---

## Problem

Anyone can create issues in any game by calling `POST /api/issues` with any `gameId`. No authorization check. Creating issues should be admin-only according to the CLAUDE.md spec.

Currently only validates that gameId and title exist, not that the requester is allowed.

## Solution

Add `playerId` to request body and verify admin status:

1. Add `playerId` to CreateIssueBody interface
2. Lookup game to get creator_id
3. Verify playerId === creator_id
4. Return 403 if not admin
5. Update frontend to send playerId with issue creation requests
