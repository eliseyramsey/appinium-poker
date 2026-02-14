# PLANNING.md
# Appinium Poker — Architecture & Technical Plan

---

## 1. Vision

Lightweight, real-time Planning Poker app with team personality. Fast to join, fun to use, zero friction.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| **Framework** | Next.js 14 (App Router) | SSR, API routes, Vercel-native |
| **Language** | TypeScript | Type safety, better DX |
| **Styling** | Tailwind CSS | Rapid UI development, light theme |
| **Database** | Supabase PostgreSQL | Free tier, realtime, auth-ready |
| **Realtime** | Supabase Realtime | WebSocket subscriptions |
| **State** | Zustand | Lightweight, simple API |
| **Hosting** | Vercel | Free tier, instant deploys |
| **Icons** | Lucide React | Clean, consistent icons |
| **Animations** | Framer Motion | Card flips, reveals |

---

## 3. Project Structure

```
/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Landing page
│   ├── create/
│   │   └── page.tsx            # Game creation form
│   ├── game/
│   │   └── [gameId]/
│   │       ├── page.tsx        # Main game room
│   │       └── join/
│   │           └── page.tsx    # Name entry for joining
│   └── api/
│       ├── games/
│       │   ├── route.ts        # POST: create game
│       │   └── [gameId]/
│       │       └── route.ts    # GET: game info
│       ├── players/
│       │   └── route.ts        # POST: join game
│       ├── votes/
│       │   └── route.ts        # POST: submit vote
│       └── issues/
│           └── route.ts        # CRUD: issues
│
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Toggle.tsx
│   │   ├── Select.tsx
│   │   └── Modal.tsx
│   ├── game/
│   │   ├── PokerTable.tsx      # Central table with players
│   │   ├── PlayerSeat.tsx      # Player avatar + card
│   │   ├── CardSelector.tsx    # Bottom card selection
│   │   ├── PokerCard.tsx       # Individual card component
│   │   ├── RevealButton.tsx    # Reveal cards CTA
│   │   └── ResultsDisplay.tsx  # Post-reveal stats
│   ├── issues/
│   │   ├── IssuesSidebar.tsx   # Right panel
│   │   ├── IssueCard.tsx       # Single issue item
│   │   └── AddIssueForm.tsx    # Quick add form
│   ├── confidence/
│   │   ├── ConfidenceVote.tsx  # Fist of Five modal
│   │   └── FistSelector.tsx    # 1-5 hand selection
│   ├── memes/
│   │   ├── MemeOverlay.tsx     # Reveal meme display
│   │   └── memeData.ts         # Hardcoded meme library
│   └── layout/
│       ├── Header.tsx          # Top navigation
│       ├── Footer.tsx          # Landing footer
│       └── InviteModal.tsx     # Share link modal
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client
│   │   └── types.ts            # Generated DB types
│   ├── store/
│   │   ├── gameStore.ts        # Zustand game state
│   │   └── playerStore.ts      # Current player state
│   ├── hooks/
│   │   ├── useGame.ts          # Game subscription
│   │   ├── usePlayers.ts       # Players subscription
│   │   ├── useVotes.ts         # Votes subscription
│   │   └── useIssues.ts        # Issues subscription
│   ├── utils/
│   │   ├── fibonacci.ts        # Card values
│   │   ├── calculations.ts     # Average, consensus
│   │   └── gameId.ts           # ID generation
│   └── constants.ts            # App-wide constants
│
├── public/
│   ├── memes/                  # Team meme images
│   ├── avatars/                # Team avatar images
│   └── logo.svg                # Appinium Poker logo
│
├── styles/
│   └── globals.css             # Tailwind + custom styles
│
└── supabase/
    ├── migrations/             # DB migrations
    └── seed.sql                # Test data
```

---

## 4. Database Schema

### 4.1 Tables

```sql
-- Games table
CREATE TABLE games (
  id TEXT PRIMARY KEY,                    -- nanoid, e.g. "abc123"
  name TEXT NOT NULL,
  voting_system TEXT DEFAULT 'fibonacci',
  who_can_reveal TEXT DEFAULT 'all',      -- 'all' | 'moderator'
  who_can_manage TEXT DEFAULT 'all',      -- 'all' | 'moderator'
  auto_reveal BOOLEAN DEFAULT false,
  fun_features BOOLEAN DEFAULT true,
  show_average BOOLEAN DEFAULT true,
  show_countdown BOOLEAN DEFAULT true,
  host_player_id TEXT,                    -- FK to players
  current_issue_id TEXT,                  -- FK to issues
  status TEXT DEFAULT 'voting',           -- 'voting' | 'revealed'
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Players table
CREATE TABLE players (
  id TEXT PRIMARY KEY,                    -- nanoid
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  avatar TEXT,                            -- avatar identifier
  is_spectator BOOLEAN DEFAULT false,
  is_online BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Issues table
CREATE TABLE issues (
  id TEXT PRIMARY KEY,                    -- nanoid
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',          -- 'pending' | 'voting' | 'voted'
  final_score NUMERIC,
  sort_order INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Votes table
CREATE TABLE votes (
  id TEXT PRIMARY KEY,                    -- nanoid
  issue_id TEXT REFERENCES issues(id) ON DELETE CASCADE,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  value TEXT NOT NULL,                    -- '0', '1', '?', 'coffee', etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(issue_id, player_id)
);

-- Confidence votes table
CREATE TABLE confidence_votes (
  id TEXT PRIMARY KEY,
  game_id TEXT REFERENCES games(id) ON DELETE CASCADE,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  value INTEGER CHECK (value >= 1 AND value <= 5),
  session_name TEXT,                      -- e.g. "Sprint 42"
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_players_game ON players(game_id);
CREATE INDEX idx_issues_game ON issues(game_id);
CREATE INDEX idx_votes_issue ON votes(issue_id);
CREATE INDEX idx_confidence_game ON confidence_votes(game_id);
```

### 4.2 Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE confidence_votes ENABLE ROW LEVEL SECURITY;

-- Public read/write for anonymous access
CREATE POLICY "Public access" ON games FOR ALL USING (true);
CREATE POLICY "Public access" ON players FOR ALL USING (true);
CREATE POLICY "Public access" ON issues FOR ALL USING (true);
CREATE POLICY "Public access" ON votes FOR ALL USING (true);
CREATE POLICY "Public access" ON confidence_votes FOR ALL USING (true);
```

### 4.3 Realtime Subscriptions

Enable realtime for:
- `players` — join/leave detection
- `votes` — live vote counting
- `issues` — issue changes
- `games` — status changes (reveal)

---

## 5. Key Flows

### 5.1 Create Game
```
Landing → Create Page → Fill Form → POST /api/games → Redirect to /game/[id]/join
```

### 5.2 Join Game
```
Shared Link → /game/[id]/join → Enter Name → POST /api/players → Redirect to /game/[id]
```

### 5.3 Vote Flow
```
Select Card → POST /api/votes → Realtime update → Others see "voted" status
```

### 5.4 Reveal Flow
```
Click Reveal → PATCH /api/games (status=revealed) → Realtime triggers → All clients show cards + meme
```

### 5.5 New Round
```
Click "New Vote" → PATCH /api/games (status=voting) → DELETE votes for issue → Reset UI
```

---

## 6. State Management

### 6.1 Zustand Stores

```typescript
// gameStore.ts
interface GameState {
  game: Game | null;
  players: Player[];
  issues: Issue[];
  votes: Vote[];
  currentIssue: Issue | null;
  isRevealed: boolean;

  // Actions
  setGame: (game: Game) => void;
  updatePlayers: (players: Player[]) => void;
  submitVote: (value: string) => Promise<void>;
  revealCards: () => Promise<void>;
  startNewRound: () => Promise<void>;
}

// playerStore.ts
interface PlayerState {
  currentPlayer: Player | null;
  myVote: string | null;

  setPlayer: (player: Player) => void;
  setMyVote: (value: string) => void;
}
```

### 6.2 Realtime Sync Pattern

```typescript
// useGame.ts hook
useEffect(() => {
  const channel = supabase
    .channel(`game:${gameId}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'players', filter: `game_id=eq.${gameId}` },
      (payload) => updatePlayers(payload)
    )
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'votes' },
      (payload) => updateVotes(payload)
    )
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}, [gameId]);
```

---

## 7. Component Architecture

### 7.1 Game Room Layout

```
┌────────────────────────────────────────────────────────────┐
│ Header (logo, game name, user menu, invite btn)            │
├────────────────────────────────────────┬───────────────────┤
│                                        │                   │
│                                        │   IssuesSidebar   │
│            PokerTable                  │   (collapsible)   │
│     (PlayerSeats around table)         │                   │
│            RevealButton                │                   │
│                                        │                   │
├────────────────────────────────────────┴───────────────────┤
│              CardSelector (fixed bottom)                   │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Player Positioning

Players arranged dynamically around oval table:
- 1-4 players: bottom row
- 5-6 players: bottom + top
- 7-10 players: all sides

---

## 8. Meme System

### 8.1 Triggers

| Condition | Meme Category |
|-----------|---------------|
| All same vote | `consensus` |
| Spread > 5 points | `chaos` |
| Someone voted `?` | `confused` |
| Someone voted `coffee` | `break` |
| First vote of day | `morning` |
| Default reveal | `random` |

### 8.2 Structure

```typescript
// memeData.ts
export const memes = {
  consensus: [
    { id: 'c1', src: '/memes/agreement.gif', alt: 'Team agrees!' },
    // ...
  ],
  chaos: [
    { id: 'ch1', src: '/memes/chaos.gif', alt: 'What is happening?!' },
    // ...
  ],
  // ...
};
```

---

## 9. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/games` | Create new game |
| GET | `/api/games/[id]` | Get game details |
| PATCH | `/api/games/[id]` | Update game (reveal, settings) |
| POST | `/api/players` | Join game |
| DELETE | `/api/players/[id]` | Leave game |
| GET | `/api/issues?game_id=` | List issues |
| POST | `/api/issues` | Create issue |
| PATCH | `/api/issues/[id]` | Update issue |
| DELETE | `/api/issues/[id]` | Delete issue |
| POST | `/api/votes` | Submit vote |
| DELETE | `/api/votes?issue_id=` | Clear votes (new round) |
| POST | `/api/confidence` | Submit confidence vote |

---

## 10. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 11. Performance Considerations

- **Optimistic UI**: Update local state before server confirms
- **Debounced votes**: Prevent spam clicks
- **Lazy load memes**: Load on reveal, not on mount
- **Connection pooling**: Supabase handles this
- **Bundle size**: Dynamic imports for heavy components

---

## 12. Security

- No auth = no user data to protect
- Game IDs are unguessable (nanoid)
- RLS ensures game isolation
- Input sanitization on all forms
- Rate limiting via Vercel Edge

---

## 13. Testing Strategy

| Type | Tool | Coverage |
|------|------|----------|
| Unit | Vitest | Utils, calculations |
| Component | React Testing Library | UI components |
| E2E | Playwright | Critical flows |
| Manual | — | Realtime sync, memes |

---

## 14. Design System

### 14.1 Theme
Light theme with Appinium corporate colors.

### 14.2 Colors
```css
:root {
  --primary: #5533ff;        /* Appinium purple */
  --primary-hover: #4422dd;
  --primary-light: #ebe7ff;
  --accent: #ffc107;         /* Yellow accent */
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
}
```

### 14.3 Typography
- **Headings**: Space Grotesk (Google Fonts)
- **Body/UI**: Space Grotesk
- **Code/Numbers**: JetBrains Mono

### 14.4 Layout Decisions
| Screen | Header | Notes |
|--------|--------|-------|
| Landing | None | Minimal: badge + title + CTA only |
| Create Game | None | Form with back link |
| Join Game | None | Name input + avatar selection |
| Game Room | Full header | Logo, game name, invite, confidence vote, user menu |

### 14.5 Avatars
Avatar selection uses team member photos (placeholder: randomuser.me API).
8 avatar options displayed in a grid.

### 14.6 Prototype Reference
Interactive HTML prototype: `prototypes/prototype-appinium-light.html`

---

## 15. Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Auto-deploy on push to `main`

### Supabase Setup
1. Create project at supabase.com
2. Run migrations
3. Enable Realtime on tables
4. Copy keys to Vercel env
