# Architecture

**Analysis Date:** 2026-02-16

## Pattern Overview

**Overall:** Client-driven real-time multiplayer architecture with server-side validation. Combines Next.js 16 App Router frontend with Supabase backend and Zustand state management.

**Key Characteristics:**
- Real-time Postgres replication via Supabase Realtime subscriptions
- Anonymous multiplayer (no authentication required)
- Admin-based game control (first player = creator)
- Optimistic client state with server validation
- Separation of concerns: UI layer, state layer, API layer, database layer

## Layers

**UI Layer:**
- Purpose: Render components and handle user interactions
- Location: `app/` (pages), `components/` (reusable components)
- Contains: Page components (`.tsx` pages), UI elements (Button, Input, Avatar), domain components (IssuesSidebar, ConfidenceVote modals)
- Depends on: Zustand stores, hooks (useGameRealtime), API routes
- Used by: End users via browser

**API Layer:**
- Purpose: Validate requests, enforce permissions, delegate to database
- Location: `app/api/`
- Contains: Route handlers for CRUD operations, admin permission checks, avatar uniqueness validation
- Depends on: Supabase client, type definitions
- Used by: UI layer via fetch calls, Realtime updates trigger store changes

**State Management Layer:**
- Purpose: Maintain game state and player session data
- Location: `lib/store/`
- Contains: `gameStore.ts` (Zustand for game/players/votes/issues), `playerStore.ts` (current player, vote, session persistence)
- Depends on: Supabase types
- Used by: All UI components via hooks (useGameStore, usePlayerStore)

**Data Access Layer:**
- Purpose: Connect to Supabase, handle real-time subscriptions
- Location: `lib/supabase/`, `lib/hooks/useGameRealtime.ts`
- Contains: Singleton Supabase client, Realtime channel setup, type definitions
- Depends on: Supabase SDK, environment variables
- Used by: API routes, hooks

**Utilities Layer:**
- Purpose: Pure functions for calculations and ID generation
- Location: `lib/utils/`
- Contains: Vote calculations (average, spread, consensus), meme category logic, ID generation via nanoid
- Depends on: Type definitions only
- Used by: API routes, components, stores

**Constants Layer:**
- Purpose: Centralized configuration and metadata
- Location: `lib/constants.ts`
- Contains: Voting cards (Fibonacci), confidence scale (hand emojis 1-5), team avatars with zoom/position, game settings defaults
- Depends on: None
- Used by: All layers for consistency

## Data Flow

**Game Creation Flow:**

1. User fills form on `/create` page
2. Client calls `POST /api/games` with game settings
3. API validates name, generates game ID (8 chars), inserts into `games` table with `creator_id: null`
4. API returns game ID
5. Client redirects to `/game/[gameId]/join?host=true`
6. Join page fetches game and checks for session
7. User selects name + avatar, clicks "Join"
8. Client calls `POST /api/players` with gameId, name, avatar
9. API validates avatar uniqueness (409 if taken), sets `creator_id = playerId` on first join, inserts player
10. Client saves session to localStorage (`appinium-poker-sessions[gameId] = playerId`)
11. Client redirects to `/game/[gameId]`
12. Game room subscribes to realtime changes, stores sync via Zustand

**Voting Flow:**

1. Admin selects issue from sidebar
2. Admin calls `PATCH /api/games/[gameId]` with `currentIssueId` and `status: "voting"`, includes `playerId` for auth
3. API validates admin permission (checks `creator_id`), updates game
4. All clients receive UPDATE event on `games` table
5. `useGameRealtime` hook updates store with new issue and status
6. All players see voting cards for new issue
7. Player clicks card, client calls `POST /api/votes` with issueId, playerId, value
8. API upserts vote (update if exists, insert if not)
9. Realtime UPDATE on `votes` table triggers all clients to fetch new votes
10. Store updates votes array, UI shows "You voted" indicator
11. If `autoReveal: true` and all players voted, `useGameStore` selector triggers reveal

**Reveal Flow:**

1. Admin clicks "Reveal" or auto-reveal condition met
2. Client calls `PATCH /api/games/[gameId]` with `status: "revealed"`
3. API updates game status
4. All clients receive UPDATE event
5. Store sets `isRevealed = true`
6. If `showCountdown: true`, UI shows 3-2-1 animation via `countdown` state
7. After countdown, cards flip, showing all votes
8. Meme displays based on vote pattern (consensus/chaos/confused/break/random)
9. Average shown if `showAverage: true`

**Confidence Vote Flow:**

1. Admin enables confidence vote (button visible when all issues estimated)
2. Admin clicks "Start Confidence Vote"
3. Client calls `PATCH /api/games/[gameId]` with `confidence_status: "voting"`
4. All clients see confidence modal with hand emojis (1-5)
5. Each player selects hand
6. Client calls `POST /api/confidence` (upsert based on game_id + player_id)
7. Realtime INSERT/UPDATE on `confidence_votes` table
8. All clients fetch votes, store syncs
9. Admin clicks "Reveal"
10. Client calls `PATCH /api/games/[gameId]` with `confidence_status: "revealed"`
11. Average calculated server-side selector: `averageConfidence()` in gameStore
12. All see average and individual votes

**Session Persistence Flow:**

1. User joins game, client saves `localStorage['appinium-poker-sessions'][gameId] = playerId`
2. User closes tab/browser
3. User returns to share link or opens `/game/[gameId]/join`
4. Join page checks `getSession(gameId)` from playerStore
5. If session exists, fetches game data to verify player still in game
6. If player exists, redirects directly to `/game/[gameId]`
7. Game room restores player from session on load
8. If player clicked "Leave Game", `clearSession(gameId)` removes session, redirects to landing

**State Management:**

- `gameStore`: Single source of truth for game state (game, players, issues, votes, confidence votes)
- `playerStore`: Maintains current player and my vote, separate from Zustand persist to avoid race conditions
- `playerStore` localStorage: Direct localStorage access for session management (outside Zustand)
- Realtime subscriptions update stores, which trigger component re-renders
- Components read from stores and dispatch actions

## Key Abstractions

**Game Entity:**
- Purpose: Represents a poker session with settings and current state
- Examples: `lib/supabase/types.ts` Game interface, `app/api/games/route.ts` POST handler
- Pattern: Database row + client-side projection in Zustand store, computed properties like `currentIssue`

**Player Entity:**
- Purpose: Anonymous participant with name, avatar, spectator flag, admin status (implicit via `creator_id`)
- Examples: `lib/supabase/types.ts` Player interface, `app/api/players/route.ts` POST handler
- Pattern: Unique per game+session, stored in localStorage for auto-rejoin

**Vote Entity:**
- Purpose: Individual player estimate on single issue
- Examples: Fibonacci values 0-89, special values "?", "☕"
- Pattern: Upsert pattern (check-then-insert or update), cleared when game status changes to "voting"

**Issue Entity:**
- Purpose: Backlog item to estimate
- Examples: Story title, description, final score after estimation
- Pattern: Created by admin, sorted by `sort_order`, status tracks estimation progress

**Confidence Vote Entity:**
- Purpose: Team confidence assessment on sprint estimates
- Examples: Hand emoji 1-5 (Fist of Five), one per player per game
- Pattern: Unique constraint (game_id, player_id), cleared independently from voting

## Entry Points

**Landing Page:**
- Location: `app/page.tsx`
- Triggers: User navigates to `/`
- Responsibilities: Display title, brand, floating cards animation, "Start New Game" CTA button

**Create Game Page:**
- Location: `app/create/page.tsx`
- Triggers: User clicks "Start New Game"
- Responsibilities: Form for game name and settings (voting system, auto-reveal, show average, etc.), POST to `/api/games`, redirect to join page

**Join Game Page:**
- Location: `app/game/[gameId]/join/page.tsx`
- Triggers: User receives share link or is redirected from create page
- Responsibilities: Check session, input player name, select avatar (filter taken ones), toggle spectator, POST to `/api/players`, save session, redirect to game room

**Game Room Page:**
- Location: `app/game/[gameId]/page.tsx`
- Triggers: Player joins game or returns to existing session
- Responsibilities: Initialize realtime subscription, render poker table with player seats, voting cards, issues sidebar, confidence modal, header with admin controls

## Error Handling

**Strategy:** Try-catch blocks in async operations, validation at both client and server, graceful fallbacks

**Patterns:**
- API routes return status codes: 400 (validation), 403 (permission denied), 404 (not found), 409 (conflict - avatar taken), 500 (server error)
- Client catches fetch errors, logs to console (dev only), shows error toast (TODO in create page)
- Supabase errors caught in API routes, wrapped in NextResponse.json
- UI disables buttons during loading, prevents duplicate submissions
- Realtime subscription failures degrade gracefully (partial UI updates, manual refresh works)

## Cross-Cutting Concerns

**Logging:**
- Development: console methods (no console.log in production)
- Production: Silent by default, error messages only
- Realtime subscription logs connection status (dev)

**Validation:**
- Client-side: Form validation (name not empty, game name not empty), UI prevents invalid interactions (no vote before issue selected)
- Server-side: Admin permission check (creator_id matches playerId), avatar uniqueness query, game existence check, required field validation

**Authentication:**
- Anonymous by default (no user accounts)
- Admin status derived from `creator_id` (first player who joined sets this)
- Permission checks in API routes before CRUD operations
- Session stored in localStorage (game_id -> player_id mapping)

---

*Architecture analysis: 2026-02-16*
