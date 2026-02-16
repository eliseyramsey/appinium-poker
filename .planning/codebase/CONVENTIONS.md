# Coding Conventions

**Analysis Date:** 2025-02-16

## Naming Patterns

**Files:**
- React Components (Page Router): `PascalCase.tsx` for pages
- React Components (UI/Feature): `PascalCase.tsx` for exported components
- API Routes: `lowercase/[bracket]/route.ts` following Next.js App Router convention
- Utilities/Helpers: `camelCase.ts` for named exports
- Stores: `camelCaseStore.ts` for Zustand store files
- Hooks: `useHookName.ts` following React convention

Examples:
- `app/page.tsx` - Landing page
- `components/ui/Button.tsx` - Reusable UI component
- `lib/store/gameStore.ts` - Zustand state
- `lib/hooks/useGameRealtime.ts` - Custom hook
- `lib/utils/calculations.ts` - Utility functions

**Functions:**
- camelCase for all function names
- Prefix with `use` for React hooks (required)
- Prefix with `get` for getter functions (`getPlayerVote`, `getSupabase`)
- Prefix with `calculate` for computation functions (`calculateAverage`, `calculateVoteAverage`)
- Prefix with `is`/`has` for boolean checks (`isAdmin`, `hasConsensus`, `hasVoted`)
- Event handlers: `handle[Action]` pattern (e.g., `handleCardSelect`, `handleReveal`, `handleCopyLink`)

**Variables:**
- camelCase for all variables and parameters
- Boolean variables prefixed with `is`/`has` for clarity (`isAdmin`, `hasVotes`, `showConfidence`)
- State setters follow React convention: `set[PropertyName]` for useState
- Zustand actions follow convention: `set[PropertyName]` or action verb names
- Constants and config: `UPPER_SNAKE_CASE` (e.g., `VOTING_CARDS`, `CONFIDENCE_SCALE`, `TEAM_AVATARS`)
- IDs: `[entity]Id` pattern (e.g., `gameId`, `playerId`, `issueId`)

**Types:**
- PascalCase for all TypeScript types and interfaces
- Suffix with `Status` for status/state enums (`GameStatus`, `IssueStatus`, `ConfidenceStatus`)
- Suffix with `Insert`/`Update` for database operation types (`GameInsert`, `PlayerUpdate`)
- Suffix with `Props` for component prop interfaces (`ButtonProps`, `InputProps`)
- Union types inline where simple (e.g., `"voting" | "revealed"`)

Examples from codebase:
```typescript
// From lib/constants.ts
export type VoteValue = (typeof VOTING_CARDS)[number]["value"];
export type VotingSystem = "fibonacci";
export type Permission = "all" | "moderator";
export interface GameSettings { ... }

// From lib/supabase/types.ts
export type GameStatus = "voting" | "revealed";
export type IssueStatus = "pending" | "voting" | "voted";
export interface Game { ... }
export type GameInsert = { ... }
```

## Code Style

**Formatting:**
- Line length: No enforced limit, but keep functions ≤ 20 lines for readability
- Indentation: 2 spaces (configured in tsconfig)
- Trailing commas: Use in multi-line objects/arrays
- Semicolons: Always include
- Quotes: Double quotes for strings, backticks for template literals

**Linting:**
- ESLint (v9) with Next.js core-web-vitals and TypeScript config
- Config: `eslint.config.mjs` (ESLint flat config format)
- Rules from `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` applied
- Run: `npm run lint`

**TypeScript Strictness:**
- `strict: true` - All strict type checking enabled
- `noEmit: true` - Type-checking only, no emit during compile
- `esModuleInterop: true` - CommonJS/ES module compatibility
- `isolatedModules: true` - Each file compiled independently

## Import Organization

**Order:**
1. React and Next.js imports (`react`, `next/*`)
2. Third-party libraries (`zustand`, `@supabase/*`, etc.)
3. Internal utilities/types (`@/lib/*`, `@/components/*`)
4. Relative imports only when necessary within same directory

**Path Aliases:**
- `@/*` maps to project root (configured in `tsconfig.json`)
- Always use `@/` for absolute imports within the project
- Never use relative `../` imports

Examples from codebase:
```typescript
// Correct ordering in app/game/[gameId]/page.tsx
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Copy, Check, ... } from "lucide-react";
import { IssuesSidebar } from "@/components/issues/IssuesSidebar";
import { Button } from "@/components/ui/Button";
import { VOTING_CARDS, TEAM_AVATARS } from "@/lib/constants";
import { usePlayerStore } from "@/lib/store/playerStore";
import { useGameStore } from "@/lib/store/gameStore";
```

**Type imports:**
- Use `import type` for type-only imports to reduce bundle
- Example: `import type { Game, Player } from "@/lib/supabase/types"`

## Error Handling

**Patterns:**
- All async/await wrapped in `try-catch`
- Distinguish between handled and unhandled errors
- For API routes: catch errors and return appropriate HTTP status codes
- For client code: catch errors and either log silently or display to user

Example from `app/api/games/route.ts`:
```typescript
try {
  // Validate required fields
  if (!body.name || body.name.trim() === "") {
    return NextResponse.json(
      { error: "Game name is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase.from("games").insert(gameData).select().single();

  if (error) {
    if (error.message.includes("Invalid API key")) {
      return NextResponse.json(
        { error: "Database not configured. Please set up Supabase." },
        { status: 503 }
      );
    }
    throw error;
  }

  return NextResponse.json(data, { status: 201 });
} catch (error) {
  const message = error instanceof Error ? error.message : "Unknown error";
  return NextResponse.json(
    { error: `Failed to create game: ${message}` },
    { status: 500 }
  );
}
```

**Client-side error handling:**
- Silent error catching is acceptable when errors are non-critical (profile updates, vote submissions)
- Errors in critical paths should log to console or notify user
- Never swallow exceptions without understanding impact

Example from `app/game/[gameId]/page.tsx`:
```typescript
try {
  await fetch(`/api/players/${currentPlayer.id}`, { ... });
} catch (error) {
  // Silent error - user experience not impacted
}
```

**HTTP Status Codes Used:**
- `200` - Success
- `201` - Resource created
- `400` - Bad request (validation failure)
- `403` - Forbidden (admin permission denied)
- `404` - Not found
- `409` - Conflict (e.g., avatar already taken)
- `503` - Service unavailable (Supabase not configured)
- `500` - Server error

## Logging

**Framework:** No structured logging library; `console` methods avoided in production

**Patterns:**
- NO `console.log()` in production code (per CLAUDE.md global instructions)
- No debug output left in committed code
- Errors propagated via try-catch and HTTP responses
- Status indicators via UI state, not console

**When debugging locally:**
- Use browser DevTools console directly
- Temporary console statements must be removed before commit

## Comments

**When to Comment:**
- Complex algorithms or business logic requiring explanation
- Non-obvious reasons for code design choices
- JSDoc for exported functions and components
- Avoid obvious comments that restate code

**JSDoc/TSDoc:**
- Document exported functions with param and return types
- Document component props
- Include brief description of purpose

Example from `lib/utils/calculations.ts`:
```typescript
/**
 * Calculate average of numeric votes
 * Ignores ?, coffee, and other non-numeric values
 */
export function calculateAverage(votes: Vote[]): number | null { ... }

/**
 * Get closest Fibonacci number to the average
 */
export function getClosestFibonacci(average: number): number { ... }
```

## Function Design

**Size:** Maximum 20 lines (per CLAUDE.md global instructions)

**Parameters:**
- Limit to 4-5 parameters; use object destructuring for more
- Use type annotations for all parameters
- Provide default values where sensible

**Return Values:**
- Explicitly type return values (no implicit `any`)
- Return `null` for "no value" cases (not `undefined`)
- Use union types for conditional returns: `number | null`

Example from `lib/utils/calculations.ts`:
```typescript
export function calculateAverage(votes: Vote[]): number | null {
  const numericVotes = votes
    .map((v) => parseFloat(v.value))
    .filter((n) => !isNaN(n));

  if (numericVotes.length === 0) return null;

  const sum = numericVotes.reduce((acc, val) => acc + val, 0);
  return Math.round((sum / numericVotes.length) * 10) / 10;
}
```

**Arrow functions vs declarations:**
- Use arrow functions for exports where possible
- Use function declarations for internal helpers (less common)
- Use `forwardRef` for React components that accept refs

Example from `components/ui/Button.tsx`:
```typescript
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", ... }, ref) => {
    return <button ref={ref} ... />;
  }
);
Button.displayName = "Button";
```

## Module Design

**Exports:**
- Named exports for everything (no default exports in lib/)
- Exception: page components and layout files use default export (Next.js requirement)
- Type exports with `export type` for bundle optimization

**Barrel Files:**
- Not used in this codebase; import directly from source files
- Example: `import { Button } from "@/components/ui/Button"` (not from index)

**Store Structure (Zustand):**
- Single store per domain (`gameStore`, `playerStore`)
- State organized by concern: Data, Computed values, Actions, Selectors
- Actions mutate state via `set()`
- Selectors as methods that use `get()` for fresh state

Example from `lib/store/gameStore.ts`:
```typescript
interface GameState {
  // Data
  game: Game | null;
  players: Player[];
  issues: Issue[];

  // Computed
  currentIssue: Issue | null;
  isRevealed: boolean;

  // Actions
  setGame: (game: Game | null) => void;
  addPlayer: (player: Player) => void;

  // Selectors
  isAdmin: (playerId: string | null) => boolean;
  allIssuesEstimated: () => boolean;
}

export const useGameStore = create<GameState>((set, get) => ({
  // Implementation
}));
```

**API Route Structure:**
- One handler per HTTP method (GET, POST, PATCH, DELETE)
- Type request bodies explicitly
- Return `NextResponse` with appropriate status codes
- Check auth/permissions at start of PATCH routes

Example from `app/api/games/[gameId]/route.ts`:
```typescript
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    if (!isSupabaseConfigured()) return NextResponse.json({ ... }, { status: 503 });

    const { gameId } = await params;
    // ... fetch logic
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: ... }, { status: 500 });
  }
}
```

## React Component Patterns

**Client Components:**
- All interactive components marked with `"use client"` directive at file top
- Pages using hooks must be client components

**Hooks Usage:**
- `useState` for UI-local state (forms, modals, dropdowns)
- `useRef` for DOM refs and non-state values (timers, channels)
- `useEffect` for subscriptions and side effects
- Custom hooks for reusable logic (e.g., `useGameRealtime`)

Example from `app/game/[gameId]/page.tsx`:
```typescript
// UI state
const [showProfileMenu, setShowProfileMenu] = useState(false);
const [isLoading, setIsLoading] = useState(false);

// Refs for non-state values
const countdownStartedRef = useRef(false);
const profileMenuRef = useRef<HTMLDivElement>(null);

// Global state from Zustand
const currentPlayer = usePlayerStore((state) => state.currentPlayer);
const game = useGameStore((state) => state.game);
```

**Component Refs with forwardRef:**
- Used for UI primitives that need to expose DOM refs
- Always set `displayName` for debugging

```typescript
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    return <input ref={ref} ... />;
  }
);
Input.displayName = "Input";
```

## Tailwind CSS Usage

**Class Organization:**
- Use inline template literals for className
- Group related utilities logically
- Use CSS variables for theming: `bg-[var(--primary)]`, `text-[var(--text-secondary)]`

**CSS Variables (defined in styles/globals.css):**
- `--primary` / `--primary-hover` / `--primary-light` - Purple brand color
- `--accent` / `--accent-hover` - Yellow highlights
- `--bg-page` / `--bg-surface` / `--bg-card` - Backgrounds
- `--text-primary` / `--text-secondary` / `--text-muted` - Text colors
- `--border` / `--border-hover` - Borders
- `--success` / `--warning` / `--danger` - Semantic colors

Example from `app/page.tsx`:
```typescript
className="
  inline-flex items-center gap-2
  px-8 py-4
  bg-[var(--primary)] text-white
  text-lg font-semibold
  rounded-xl
  shadow-lg shadow-[var(--primary)]/25
  hover:bg-[var(--primary-hover)]
  hover:shadow-xl hover:shadow-[var(--primary)]/30
  hover:-translate-y-0.5
  transition-all duration-200
"
```

## Database Field Naming

**Convention:** `snake_case` for all database column names

Examples:
- `game_id` - Foreign key reference
- `player_id` - Foreign key reference
- `current_issue_id` - Referenced issue ID
- `is_spectator` - Boolean column
- `creator_id` - User who created record
- `confidence_status` - Enum-like status field
- `final_score` - Calculated result

---

*Convention analysis: 2025-02-16*
