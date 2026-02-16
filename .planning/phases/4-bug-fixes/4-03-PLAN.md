---
phase: 4-bug-fixes
plan: 03
type: execute
wave: 2
depends_on:
  - 4-01
  - 4-02
files_modified:
  - app/game/[gameId]/page.tsx
  - components/game/PlayerSeat.tsx
  - components/confidence/ConfidenceVoteModal.tsx
  - components/game/CardSelector.tsx
  - components/layout/GameHeader.tsx
autonomous: true
requirements:
  - BUGS-10

must_haves:
  truths:
    - "Game room page is under 400 lines"
    - "PlayerSeat is a standalone component"
    - "ConfidenceVoteModal is a standalone component"
    - "CardSelector is a standalone component"
    - "GameHeader is a standalone component"
  artifacts:
    - path: "app/game/[gameId]/page.tsx"
      provides: "Orchestration of sub-components"
      max_lines: 400
    - path: "components/game/PlayerSeat.tsx"
      provides: "Player avatar + vote display"
      min_lines: 50
    - path: "components/confidence/ConfidenceVoteModal.tsx"
      provides: "Fist of Five voting modal"
      min_lines: 80
    - path: "components/game/CardSelector.tsx"
      provides: "Voting card picker"
      min_lines: 30
    - path: "components/layout/GameHeader.tsx"
      provides: "Game room header with admin controls"
      min_lines: 60
  key_links:
    - from: "app/game/[gameId]/page.tsx"
      to: "components/game/PlayerSeat.tsx"
      via: "import and render"
      pattern: "PlayerSeat"
    - from: "app/game/[gameId]/page.tsx"
      to: "components/confidence/ConfidenceVoteModal.tsx"
      via: "import and render"
      pattern: "ConfidenceVoteModal"
---

<objective>
Split the 1106-line game room page into focused, maintainable components.

Purpose: Improve code organization, testability, and developer experience.
Output: Game room page orchestrating smaller components, each ~50-150 lines.
</objective>

<execution_context>
@/Users/eliseyramsey/.claude/get-shit-done/workflows/execute-plan.md
@/Users/eliseyramsey/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/todos/pending/2026-02-16-split-game-room-page-into-components.md
@app/game/[gameId]/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extract PlayerSeat and CardSelector components</name>
  <files>components/game/PlayerSeat.tsx, components/game/CardSelector.tsx, app/game/[gameId]/page.tsx</files>
  <action>
**components/game/PlayerSeat.tsx:**
Extract the inline PlayerSeat function (currently lines ~905-986) into a standalone component:

```typescript
"use client";

import { Avatar } from "@/components/ui/Avatar";
import type { Player, Vote } from "@/lib/supabase/types";
import { VOTING_CARDS } from "@/lib/constants";

interface PlayerSeatProps {
  player: Player;
  position: "top" | "bottom";
  vote: Vote | undefined;
  isRevealed: boolean;
  isCurrentPlayer: boolean;
  isAdmin: boolean;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export function PlayerSeat({
  player,
  position,
  vote,
  isRevealed,
  isCurrentPlayer,
  isAdmin,
  onContextMenu,
}: PlayerSeatProps) {
  // ... move existing PlayerSeat implementation here ...
}
```

**components/game/CardSelector.tsx:**
Extract the card selection grid (search for VOTING_CARDS.map in the page):

```typescript
"use client";

import { VOTING_CARDS, type VoteValue } from "@/lib/constants";

interface CardSelectorProps {
  selectedValue: VoteValue | null;
  onSelect: (value: VoteValue) => void;
  disabled?: boolean;
}

export function CardSelector({ selectedValue, onSelect, disabled }: CardSelectorProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
      {VOTING_CARDS.map((card) => (
        <button
          key={card.value}
          onClick={() => onSelect(card.value)}
          disabled={disabled}
          className={`...`}
        >
          {card.label}
        </button>
      ))}
    </div>
  );
}
```

**app/game/[gameId]/page.tsx:**
1. Remove inline PlayerSeat and card selector code
2. Import from new component files
3. Pass required props
  </action>
  <verify>
- `npm run build` passes
- Both new component files exist and export correctly
- Game room still renders players and cards correctly
  </verify>
  <done>PlayerSeat and CardSelector extracted into standalone components</done>
</task>

<task type="auto">
  <name>Task 2: Extract ConfidenceVoteModal and GameHeader</name>
  <files>components/confidence/ConfidenceVoteModal.tsx, components/layout/GameHeader.tsx, app/game/[gameId]/page.tsx</files>
  <action>
**components/confidence/ConfidenceVoteModal.tsx:**
Extract the confidence voting modal (currently lines ~989-1105):

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { CONFIDENCE_SCALE } from "@/lib/constants";

interface ConfidenceVoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVote: (value: number) => void;
  currentVote: number | null;
  isRevealed: boolean;
  votes: { player_id: string; value: number }[];
  players: { id: string; name: string }[];
  averageConfidence: number | null;
  isAdmin: boolean;
  onReveal: () => void;
  onReset: () => void;
}

export function ConfidenceVoteModal({
  isOpen,
  onClose,
  onVote,
  currentVote,
  isRevealed,
  votes,
  players,
  averageConfidence,
  isAdmin,
  onReveal,
  onReset,
}: ConfidenceVoteModalProps) {
  // ... move existing modal implementation ...
}
```

**components/layout/GameHeader.tsx:**
Extract the header section (logo, game name, invite button, profile menu):

```typescript
"use client";

import Image from "next/image";
import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import type { Player, Game } from "@/lib/supabase/types";

interface GameHeaderProps {
  game: Game | null;
  currentPlayer: Player | null;
  isAdmin: boolean;
  onCopyInvite: () => void;
  onUpdateName: (name: string) => void;
  onUpdateAvatar: (avatar: string) => void;
  onLeaveGame: () => void;
  onStartConfidence: () => void;
  allIssuesEstimated: boolean;
}

export function GameHeader({ ... }: GameHeaderProps) {
  // ... move header implementation ...
}
```

**app/game/[gameId]/page.tsx:**
1. Remove inline modal and header code
2. Import from new components
3. Wire up callbacks
  </action>
  <verify>
- `npm run build` passes
- New components exist and export correctly
- Header and confidence modal work correctly
  </verify>
  <done>ConfidenceVoteModal and GameHeader extracted into standalone components</done>
</task>

<task type="auto">
  <name>Task 3: Clean up game room page orchestration</name>
  <files>app/game/[gameId]/page.tsx</files>
  <action>
After extracting components, clean up the main page:

1. Remove any dead code or unused imports
2. Organize imports: React first, then external, then internal
3. Group handler functions logically
4. Add section comments for clarity:
   ```typescript
   // ─── State ────────────────────────────────────────────
   // ─── Handlers ─────────────────────────────────────────
   // ─── Effects ──────────────────────────────────────────
   // ─── Render ───────────────────────────────────────────
   ```

5. Verify page is now ~300-400 lines (orchestration only)

6. Ensure all component props are correctly typed and passed

The page should now:
- Import extracted components
- Manage state and business logic
- Pass data and callbacks to child components
- Handle routing and realtime subscriptions
  </action>
  <verify>
- `npm run build` passes
- `wc -l app/game/[gameId]/page.tsx` shows ~300-400 lines
- All game room functionality still works
  </verify>
  <done>Game room page is clean orchestration layer under 400 lines</done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Run `npm run build` - should pass
2. Test full game flow: create game, join, vote, reveal
3. Test confidence voting
4. Test admin actions (kick, spectator, transfer)
5. Verify all UI renders correctly
</verification>

<success_criteria>
1. BUGS-10 fixed - game room page split into components
2. Main page under 400 lines
3. 4+ new component files created
4. All functionality preserved
5. No TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/phases/4-bug-fixes/4-03-SUMMARY.md`
</output>
