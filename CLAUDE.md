# CLAUDE.md
# Appinium Poker — Project Instructions

## Quick Start
```bash
npm run dev    # Start development server
npm run build  # Production build
npm run test   # Run tests
```

## Project Overview
Real-time Planning Poker app for Scrum estimation with team memes and Appinium branding.
Anonymous play — no registration required.

**Key Docs:**
- `docs/PRD.md` — Full product requirements
- `PLANNING.md` — Architecture, database schema, API
- `TASKS.md` — Development tasks by milestone

**Design Prototype:** `prototypes/prototype-appinium-light.html`

---

## Tech Stack
| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL + Realtime) |
| State | Zustand |
| Hosting | Vercel |
| Icons | Lucide React |
| Animations | Framer Motion |

---

## Design System

### Theme
**Light theme** — clean, professional, playful.

### Colors (Appinium)
```css
--primary: #5533ff;        /* Purple — buttons, links */
--primary-hover: #4422dd;
--primary-light: #ebe7ff;  /* Purple tint for backgrounds */
--accent: #ffc107;         /* Yellow — highlights, badges */
--accent-hover: #e6ad00;
--bg-page: #ffffff;
--bg-surface: #f5f7fa;
--bg-card: #ffffff;
--text-primary: #1a1a2e;
--text-secondary: #4e5b73;
--border: #e2e8f0;
--success: #28a745;
--warning: #ffc107;
--danger: #dc3545;
```

### Typography
- **Font Family:** Space Grotesk (headings + body)
- **Monospace:** JetBrains Mono (numbers, code)
- Load via Google Fonts CDN

### Layout Rules
| Screen | Header | Content |
|--------|--------|---------|
| Landing (`/`) | None | Minimal: badge + title + "Start Game" button |
| Create (`/create`) | None | Form with settings, back link |
| Join (`/game/[id]/join`) | None | Name input, avatar grid, spectator toggle |
| Game Room (`/game/[id]`) | Full | Logo, game name, invite, confidence, user menu |

### Avatars
- 26 team member photos in `public/avatars/`
- Each avatar has custom zoom and position for face centering
- Grid layout for selection (4 columns)
- Taken avatars hidden from selection (unique per game)
- Use `public/avatar-picker.html` to adjust face positioning

---

## Database Schema

### Tables
```
games          — Game sessions with settings
players        — Participants (anonymous)
issues         — Backlog items for estimation
votes          — Story point votes per issue
confidence_votes — Fist of Five votes per sprint
```

### Key Fields
- `games.status`: `'voting'` | `'revealed'`
- `games.creator_id`: player ID of admin (first to join)
- `games.confidence_status`: `'idle'` | `'voting'` | `'revealed'`
- `votes.value`: `'0'` | `'1'` | `'2'` | ... | `'?'` | `'coffee'`
- `confidence_votes.value`: `1-5`
- `confidence_votes`: UNIQUE(game_id, player_id)

### Relationships
```
games 1--* players
games 1--* issues
issues 1--* votes
games 1--* confidence_votes
```

---

## Project Structure
```
app/
├── page.tsx                    # Landing
├── create/page.tsx             # Game creation
├── game/[gameId]/
│   ├── page.tsx                # Game room
│   └── join/page.tsx           # Join flow
└── api/                        # API routes

components/
├── ui/                         # Button, Input, Toggle, Modal
├── game/                       # PokerTable, PlayerSeat, CardSelector
├── issues/                     # IssuesSidebar, IssueCard
├── confidence/                 # ConfidenceVote modal
├── memes/                      # MemeOverlay, memeData.ts
└── layout/                     # Header (game room only)

lib/
├── supabase/                   # Client, types
├── store/                      # Zustand stores
├── hooks/                      # Realtime subscriptions
└── utils/                      # Helpers, constants

public/
├── memes/                      # Team meme images
└── avatars/                    # Team photos
```

---

## Realtime Subscriptions

Use Supabase Realtime for live updates:
```typescript
// Subscribe to game changes
supabase.channel(`game:${gameId}`)
  .on('postgres_changes', { table: 'players', filter: `game_id=eq.${gameId}` }, ...)
  .on('postgres_changes', { table: 'votes' }, ...)
  .subscribe();
```

Custom hooks in `lib/hooks/`:
- `useGame` — Game status, settings
- `usePlayers` — Join/leave detection
- `useVotes` — Vote updates
- `useIssues` — Issue changes

---

## API Routes

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/games` | POST | Create game |
| `/api/games/[id]` | GET | Get game details |
| `/api/games/[id]` | PATCH | Update (reveal, settings) — admin only |
| `/api/players` | POST | Join game (first player = admin) |
| `/api/votes` | POST | Submit vote |
| `/api/votes` | DELETE | Clear votes (new round) |
| `/api/issues` | CRUD | Manage issues (admin only) |
| `/api/confidence` | GET | Get confidence votes for game |
| `/api/confidence` | POST | Submit confidence vote |
| `/api/confidence` | DELETE | Clear all votes (admin only) |

---

## Core Flows

### Create Game
```
Landing → /create → Fill form → POST /api/games → Redirect /game/[id]/join
```

### Join Game
```
Shared link → /game/[id]/join → Enter name → POST /api/players → Redirect /game/[id]
```

### Voting
```
Select card → POST /api/votes → Realtime sync → All see "voted" status
```

### Reveal
```
Click "Reveal" → PATCH /api/games → status='revealed' → Cards flip + meme shows
```

---

## Meme System

### Triggers
| Condition | Category |
|-----------|----------|
| All same vote | `consensus` |
| Spread > 5 points | `chaos` |
| Someone voted `?` | `confused` |
| Someone voted `coffee` | `break` |
| Default | `random` |

### Adding Memes
1. Add image to `public/memes/`
2. Update `components/memes/memeData.ts`

---

## Voting Cards

Fibonacci sequence + special cards:
```
0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, ?, ☕
```

Defined in `lib/constants.ts`

---

## Important Constraints

### DO
- Use TypeScript strictly
- Follow existing component patterns
- Use Zustand for client state
- Use Supabase Realtime for sync
- Keep functions ≤ 20 lines
- Write tests before implementation (TDD)

### DO NOT
- Add authentication (intentionally anonymous)
- Use `console.log` in production
- Push directly to main
- Create files outside structure
- Add unnecessary dependencies
- Over-engineer simple features

---

## Testing
```bash
npm run test          # Vitest — unit tests
npm run test:e2e      # Playwright — E2E tests
```

Test priorities:
1. Vote calculation utils
2. Realtime sync (2 browser windows)
3. Full flow: create → join → vote → reveal

---

## Common Tasks

### Change brand colors
Edit `styles/globals.css` or `tailwind.config.ts`

### Add new avatar
1. Add image to `public/avatars/`
2. Open `public/avatar-picker.html` to set zoom/position
3. Add entry to `TEAM_AVATARS` in `lib/constants.ts`

### Change voting scale
Edit `lib/constants.ts` → `VOTING_CARDS`

### Add new meme category
1. Add images to `public/memes/[category]/`
2. Update `memeData.ts` with trigger logic

---

## Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Session Log

### 2026-02-14: Initial Setup & Core UI

**Completed:**
- Created PRD, PLANNING.md, TASKS.md documentation
- Built HTML prototype (`prototypes/prototype-appinium-light.html`)
- Initialized Next.js 16 project with TypeScript + Tailwind
- Configured Appinium brand colors (light theme)
- Set up Space Grotesk + JetBrains Mono fonts
- Created base UI components: Button, Input, Toggle
- Created Zustand stores: gameStore, playerStore
- Created utility functions: gameId, calculations
- Built all core pages:
  - Landing (`/`) — badge, title, Start Game CTA
  - Create (`/create`) — game settings form
  - Join (`/game/[id]/join`) — name input, avatar selection
  - Game Room (`/game/[id]`) — poker table, cards, reveal, invite
- Created SQL migrations for Supabase
- Fixed Next.js Image config for randomuser.me avatars

**Current State:**
- UI fully functional (local state only)
- No backend connected yet
- Mock players in game room for demo

---

### 2026-02-14: Backend & Realtime Sync (Session 2)

**Completed:**
- Created Supabase project and configured credentials
- Ran database migrations in Supabase SQL Editor
- Implemented all API routes:
  - `POST /api/games` — create game
  - `GET/PATCH /api/games/[id]` — get/update game
  - `POST /api/players` — join game
  - `POST/DELETE /api/votes` — submit/clear votes
  - `GET/POST /api/issues` — list/create issues
  - `GET/PATCH/DELETE /api/issues/[id]` — manage issues
- Created `useGameRealtime` hook for live multiplayer sync
- Updated all pages to use Supabase API instead of local state
- Fixed WebSocket issues (StrictMode race condition)
- Implemented auto-reveal when all players voted
- Added countdown animation (3-2-1) before reveal
- Fixed "Start New Round" to sync across all clients
- Fixed UI flicker between countdown and reveal
- Created GitHub repo and pushed code

**Technical Notes:**
- Supabase client uses singleton pattern (`getSupabase()`)
- Realtime callbacks use `useGameStore.getState()` for fresh state
- `isRevealing` state prevents UI flash after countdown
- Delay subscription by 100ms to avoid StrictMode unmount issues

**Current State:**
- Multiplayer works! Real-time sync between tabs/devices
- GitHub: https://github.com/eliseyramsey/appinium-poker
- Milestones 2, 7, 8 complete

**Next Steps:**
1. Milestone 9: Issues Sidebar
2. Milestone 11: Confidence Vote API
3. Milestone 12: Meme System
4. Deploy to Vercel

---

### 2026-02-14: Admin Permissions & Confidence Vote (Session 3)

**Completed:**
- Implemented Admin Permissions (Milestone 11.5):
  - Added `creator_id` field to games table (first player = admin)
  - Added `confidence_status` field for confidence vote state
  - Admin-only actions: reveal, new round, select issue, add/edit/delete issues
  - Admin badge (👑) shown next to creator's avatar and in header
  - API validates admin permissions, returns 403 for unauthorized
  - Removed Permissions section from game creation form (automatic)

- Implemented Confidence Vote (Milestone 11):
  - Button in Issues Sidebar (disabled until all issues estimated)
  - Modal appears for ALL players when admin starts vote
  - Hand emojis for voting: ☝️✌️🤟🖖🖐️ (1-5)
  - Can change vote before reveal
  - Votes hidden until admin reveals
  - Average shown only after reveal
  - Realtime sync via confidence_votes table subscription

**Database Migration (002_add_creator_id.sql):**
```sql
ALTER TABLE games ADD COLUMN creator_id TEXT;
ALTER TABLE games ADD COLUMN confidence_status TEXT DEFAULT 'idle';
ALTER TABLE confidence_votes ADD CONSTRAINT confidence_votes_unique UNIQUE (game_id, player_id);
ALTER PUBLICATION supabase_realtime ADD TABLE confidence_votes;
```

**API Changes:**
- `POST /api/confidence` — submit confidence vote (upsert)
- `GET /api/confidence?gameId=` — get votes for game
- `DELETE /api/confidence` — clear all votes (admin only)
- `PATCH /api/games/[id]` — checks playerId for admin actions

**Technical Notes:**
- `hideConfidence` state allows users to hide modal locally
- `useEffect` on `isConfidenceVoting` reopens modal for all when new vote starts
- Confidence emojis stored in `CONFIDENCE_EMOJIS` constant
- `allIssuesEstimated()` selector in gameStore checks if button should be enabled

**Current State:**
- Milestones 11, 11.5 complete
- Admin system working
- Confidence vote fully functional with realtime sync

**Next Steps:**
1. Milestone 12: Meme System
2. Milestone 13: Polish & UX
3. Deploy to Vercel

---

### 2026-02-16: Team Avatars System (Session 4)

**Completed:**
- Replaced placeholder avatars with 26 real team member photos
- Created avatar picker tool (`public/avatar-picker.html`) for face positioning
- Each avatar supports: zoom (100-400%), x position, y position
- Created `Avatar` component using `background-image` approach for proper cropping
- Converted HEIC files to JPG for browser compatibility
- Renamed problematic files (emoji in filenames, long names)

**Unique Avatar Selection:**
- Join page fetches existing players and filters out taken avatars
- Shows count: "Choose Avatar (X available)"
- Server-side validation in `POST /api/players`:
  - Returns 409 with `code: "AVATAR_TAKEN"` if avatar already in use
  - Client shows error message and refreshes available avatars
- Prevents race condition when two players select same avatar

**UI Improvements:**
- Player seats repositioned: avatars always outside table, cards closer to table
- Added `position` prop to `PlayerSeat` component ("top" | "bottom")
- Top row: avatar above card; Bottom row: card above avatar
- Increased avatar size to 40px for better visibility
- Increased gap between players and table (-top-28, -bottom-28)

**New Files:**
- `components/ui/Avatar.tsx` — reusable avatar with zoom/position
- `public/avatar-picker.html` — tool for adjusting face center
- `public/avatars/` — 26 team photos (JPG/PNG)

**Constants Update (`lib/constants.ts`):**
```typescript
export const TEAM_AVATARS = [
  { src: "/avatars/IMG_2292.PNG", zoom: 180, x: 45, y: 37 },
  // ... 26 avatars with custom positioning
] as const;

export function getAvatarStyle(src: string | null): {
  backgroundSize: string;
  backgroundPosition: string;
}
```

**PR:** https://github.com/eliseyramsey/appinium-poker/pull/1

---

### 2026-02-16: Bug Fixes, Session Persistence & Profile Menu (Session 5)

**Completed:**

- **Milestone 12: Bug Fixes** — Fixed Issues edit/delete not working
  - Problem: Supabase Realtime DELETE events don't include `payload.old.id`
  - Solution: Update Zustand store directly after successful API call

- **Milestone 15: Session Persistence** — Prevent duplicate players on rejoin
  - Created separate localStorage key `appinium-poker-sessions` (outside Zustand persist)
  - Join page checks for saved session and auto-redirects to game room
  - Game room restores player from saved session on load
  - "Leave Game" button clears session and redirects to landing
  - Admin returns as admin (creator_id preserved in DB)

- **Milestone 13: Landing Floating Cards** — Animated cards and avatars
  - Created `FloatingCards` component with 4 Fibonacci cards (5, 8, 13, 21)
  - Added 3 floating team avatars for fun
  - CSS keyframes injected via useEffect (Tailwind v4 compatibility)
  - 8s float animation with staggered delays
  - pointer-events: none (don't block clicks)

- **Milestone 14: Player Profile Menu** — Change name/avatar in-game
  - Dropdown menu on avatar click in header (ChevronDown indicator)
  - "Change Name" modal with input and Enter key support
  - "Change Avatar" modal with grid (taken avatars hidden, current marked ✓)
  - Created `PATCH /api/players/[playerId]` for updates
  - Avatar uniqueness validated server-side (409 if taken)
  - Fixed avatar selection ring UI (ring-offset for proper spacing)

**New Files:**
- `app/api/players/[playerId]/route.ts` — PATCH endpoint for player updates
- `components/landing/FloatingCards.tsx` — Animated landing decoration

**API Updates:**
- `GET /api/games/[id]` — Now returns players array for session checking
- `PATCH /api/players/[id]` — Update name/avatar with validation

**Technical Notes:**
- Zustand persist has race condition on fast redirects — use direct localStorage
- Tailwind v4 custom keyframes need inline styles or useEffect injection
- ring-offset-2 creates proper spacing for selection indicators

**Current State:**
- Milestones 12, 13, 14, 15 complete
- Profile menu fully functional
- Session persistence working

**Next Steps:**
1. Milestone 16: Admin Player Management (right-click context menu)
2. Milestone 17: Meme System
3. Deploy to Vercel

---

### 2026-02-16: Admin Management & Meme System (Session 6)

**GSD Planning System:**
- Initialized `.planning/` directory with PROJECT.md, REQUIREMENTS.md, ROADMAP.md
- Created config.json (YOLO mode, quick depth, parallel execution)
- Structured approach with phases instead of milestones

**Completed:**

- **Phase 1: Admin Player Management** — Right-click context menu
  - Created `ContextMenu` component with three actions
  - Kick player: DELETE /api/players/[id] with admin validation
  - Make spectator: PATCH is_spectator with admin validation
  - Transfer admin: PATCH creator_id on games table
  - "Kicked" modal shows when player is removed from game
  - Spectator indicator on player name ("player (spectator)")

- **Phase 2: Meme System** — Show memes after reveal
  - Created `memeData.ts` with category logic:
    - consensus: all votes identical
    - chaos: vote spread > 5 points
    - confused: someone voted "?"
    - break: someone voted "☕"
    - random: default fallback
  - Created `MemeOverlay` component with 5s auto-close countdown
  - Graceful fallback when images not found (shows caption)
  - TODO: Add actual meme images to public/memes/

- **Phase 3: Deploy** — Instructions created
  - Created `.planning/phases/3/DEPLOY.md` with step-by-step guide
  - Requires `npx vercel login` for authentication
  - Environment variables: SUPABASE_URL, SUPABASE_ANON_KEY, APP_URL

**New Files:**
- `components/ui/ContextMenu.tsx` — Right-click player management
- `components/memes/memeData.ts` — Meme selection logic
- `components/memes/MemeOverlay.tsx` — Meme display modal
- `.planning/` — Project planning structure

**API Updates:**
- `PATCH /api/players/[id]` — Added is_spectator with admin check
- `DELETE /api/players/[id]` — Kick player (admin only)
- `PATCH /api/games/[id]` — Added newCreatorId for admin transfer

**Current State:**
- Phase 1 ✓ complete
- Phase 2 ✓ complete (needs meme images)
- Phase 3 ◆ in progress — deployed but needs env vars

**Production URL:** https://appinium-poker-rw1g.vercel.app/

**BLOCKER — Environment Variables not set:**
App returns 503 because Supabase credentials missing in Vercel.

**Fix:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Redeploy (Deployments → ... → Redeploy)

**Remaining Tasks:**
1. ⚠️ **Set Vercel env vars** ← do this first!
2. Add ~50 Russian meme images to `public/memes/[category]/`
3. Test multiplayer on production
