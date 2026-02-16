---
created: 2026-02-16T22:21:00.037Z
title: Remove duplicate getMemeCategory
area: general
priority: warning
files:
  - lib/utils/calculations.ts:55-63
  - components/memes/memeData.ts:93-126
---

## Problem

`getMemeCategory` function is defined in two places with different implementations:

1. `lib/utils/calculations.ts:55-63` — takes `Vote[]` array
2. `components/memes/memeData.ts:93-126` — takes `string[]` array

They have similar logic but could diverge over time, causing inconsistent behavior.

## Solution

1. Keep only one implementation (prefer memeData.ts as it's the actual consumer)
2. Delete from calculations.ts
3. Update any imports that reference the deleted version
4. Alternatively, have calculations.ts re-export from memeData.ts
