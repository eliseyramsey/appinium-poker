---
created: 2026-02-16T22:21:00.037Z
title: Split game room page into components
area: ui
priority: warning
files:
  - app/game/[gameId]/page.tsx:1-1106
---

## Problem

Game room page is 1106 lines with multiple inline components:
- `PlayerSeat` (lines 905-986)
- `ConfidenceVoteModal` (lines 989-1105)

This makes the file hard to navigate, test, and maintain.

## Solution

Extract to separate component files:

1. `components/game/PlayerSeat.tsx`
2. `components/confidence/ConfidenceVoteModal.tsx`
3. Consider extracting header into `components/layout/GameHeader.tsx`
4. Consider extracting card selector into `components/game/CardSelector.tsx`

Main page should be ~300-400 lines max, orchestrating smaller components.
