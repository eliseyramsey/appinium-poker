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
- 8 team member photos (placeholder: randomuser.me)
- Grid layout for selection
- Replace with actual team photos later

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
- `votes.value`: `'0'` | `'1'` | `'2'` | ... | `'?'` | `'coffee'`
- `confidence_votes.value`: `1-5`

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
| `/api/games/[id]` | PATCH | Update (reveal, settings) |
| `/api/players` | POST | Join game |
| `/api/votes` | POST | Submit vote |
| `/api/votes` | DELETE | Clear votes (new round) |
| `/api/issues` | CRUD | Manage issues |
| `/api/confidence` | POST | Submit confidence vote |

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
2. Update avatar list in `/game/[id]/join`

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

**Next Steps:**
1. Create Supabase project
2. Run migrations (`supabase/migrations/001_initial_schema.sql`)
3. Add `.env.local` with Supabase credentials
4. Implement API routes
5. Add Realtime subscriptions for multiplayer sync
