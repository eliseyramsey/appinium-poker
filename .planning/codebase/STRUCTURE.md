# Codebase Structure

**Analysis Date:** 2026-02-16

## Directory Layout

```
/Users/eliseyramsey/Desktop/Claude Apps/Planning Poker/
├── app/                           # Next.js App Router (server + client routes)
│   ├── page.tsx                   # Landing page (/)
│   ├── layout.tsx                 # Root layout with fonts
│   ├── create/
│   │   └── page.tsx               # Create game page (/create)
│   ├── game/
│   │   └── [gameId]/
│   │       ├── page.tsx           # Game room (/game/[gameId])
│   │       └── join/
│   │           └── page.tsx       # Join game page (/game/[gameId]/join)
│   └── api/                       # API routes
│       ├── games/
│       │   ├── route.ts           # POST create, GET game detail
│       │   └── [gameId]/route.ts  # GET/PATCH game update
│       ├── players/
│       │   ├── route.ts           # POST join game
│       │   └── [playerId]/route.ts # PATCH update player name/avatar
│       ├── votes/
│       │   └── route.ts           # POST submit vote, DELETE clear votes
│       ├── issues/
│       │   ├── route.ts           # GET list, POST create (admin only)
│       │   └── [issueId]/route.ts # PATCH update, DELETE issue (admin only)
│       └── confidence/
│           └── route.ts           # GET votes, POST submit, DELETE clear (admin only)
│
├── components/                    # Reusable React components
│   ├── ui/                        # Base UI primitives
│   │   ├── Button.tsx             # Primary button component with variants
│   │   ├── Input.tsx              # Text input with label
│   │   ├── Toggle.tsx             # Checkbox toggle with label
│   │   └── Avatar.tsx             # Team avatar with zoom/position cropping
│   ├── landing/
│   │   └── FloatingCards.tsx      # Animated cards and avatars (homepage)
│   ├── issues/
│   │   └── IssuesSidebar.tsx      # Issue list, add/edit/delete, confidence button
│   ├── confidence/                # (Empty, placeholders for future components)
│   ├── game/                      # (Empty, placeholder for game components)
│   ├── memes/                     # (Empty, placeholder for meme overlay)
│   └── layout/                    # (Empty, placeholder for layout components)
│
├── lib/                           # Shared utilities and state
│   ├── supabase/
│   │   ├── client.ts              # Singleton Supabase client with isSupabaseConfigured()
│   │   └── types.ts               # Database types (Game, Player, Issue, Vote, ConfidenceVote)
│   ├── store/
│   │   ├── gameStore.ts           # Zustand store for game, players, issues, votes
│   │   └── playerStore.ts         # Zustand store for current player, session persistence
│   ├── hooks/
│   │   └── useGameRealtime.ts     # Realtime subscription setup and sync
│   ├── utils/
│   │   ├── gameId.ts              # ID generation (nanoid-based)
│   │   └── calculations.ts        # Vote calculations (average, spread, consensus, meme category)
│   └── constants.ts               # VOTING_CARDS, CONFIDENCE_SCALE, TEAM_AVATARS, defaults
│
├── public/                        # Static assets
│   ├── avatars/                   # 26 team member photos (JPG/PNG)
│   ├── memes/                     # (Placeholder for meme images)
│   └── favicon.svg
│
├── app/globals.css                # Global styles and CSS variables (Appinium theme)
├── tailwind.config.ts             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies (Next.js, React, Zustand, Supabase)
├── next.config.ts                 # Next.js configuration
├── supabase/
│   └── migrations/                # SQL migrations for database schema
├── docs/                          # Project documentation
│   └── PRD.md                     # Product requirements document
├── PLANNING.md                    # Architecture and schema docs
├── TASKS.md                       # Development tasks by milestone
└── CLAUDE.md                      # Project instructions (in CLAUDE.md summary)
```

## Directory Purposes

**app/ (Next.js App Router):**
- Purpose: All page routes and API routes for the application
- Contains: `.tsx` page components (server/client), `route.ts` API handlers
- Key files: `page.tsx` for public routes, `[gameId]` for dynamic game sessions, `api/*` for backend

**components/ (React Components):**
- Purpose: Reusable and page-specific UI components
- Contains: UI primitives (Button, Input, Avatar), domain components (IssuesSidebar)
- Key files: `components/ui/` for base components used everywhere, domain folders for feature-specific components

**lib/ (Business Logic & State):**
- Purpose: Shared utilities, state management, database access
- Contains: Zustand stores, Supabase client, calculations, ID generation, hooks
- Key files: `store/` for state, `supabase/` for database, `utils/` for pure functions

**public/ (Static Assets):**
- Purpose: Images and static files served directly
- Contains: Team avatar photos (26 images), meme images (future)
- Key files: `/avatars/` for player selection, `/memes/` for reveal animations

**supabase/ (Database):**
- Purpose: Database schema and migrations
- Contains: SQL migration files
- Key files: `migrations/` for schema creation, constraints, realtime configuration

**docs/ (Documentation):**
- Purpose: Project specifications and requirements
- Contains: PRD, architecture docs, task tracking
- Key files: `PRD.md` for feature specs, `PLANNING.md` for tech architecture

## Key File Locations

**Entry Points:**
- `app/page.tsx`: Landing page (/) - displays brand, title, "Start Game" button
- `app/create/page.tsx`: Game creation form (/create)
- `app/game/[gameId]/join/page.tsx`: Join flow with name + avatar selection
- `app/game/[gameId]/page.tsx`: Main game room with poker table

**Configuration:**
- `package.json`: Dependencies (Next.js 16, React 19, Zustand, Supabase)
- `tsconfig.json`: TypeScript strict mode, path aliases (`@/*`)
- `tailwind.config.ts`: Tailwind CSS (v4) configuration
- `app/globals.css`: CSS variables for Appinium theme colors

**Core Logic:**
- `lib/store/gameStore.ts`: Zustand store for game state (players, votes, issues, confidence)
- `lib/store/playerStore.ts`: Current player state + session persistence
- `lib/hooks/useGameRealtime.ts`: Real-time subscription setup for all tables
- `lib/utils/calculations.ts`: Vote average, spread, consensus, meme category logic
- `lib/supabase/client.ts`: Singleton Supabase client instance
- `lib/constants.ts`: Game settings, voting cards, team avatars with positions

**Testing:**
- Not currently implemented (tests folder does not exist)

**API Routes:**
- `app/api/games/route.ts`: POST create game, GET all games (future)
- `app/api/games/[gameId]/route.ts`: GET game details, PATCH update (reveal, new round, select issue)
- `app/api/players/route.ts`: POST join game
- `app/api/players/[playerId]/route.ts`: PATCH update player name/avatar
- `app/api/votes/route.ts`: POST submit vote, DELETE clear votes
- `app/api/issues/route.ts`: GET list, POST create issue
- `app/api/issues/[issueId]/route.ts`: PATCH edit, DELETE issue
- `app/api/confidence/route.ts`: GET votes, POST submit, DELETE clear (admin only)

## Naming Conventions

**Files:**
- Pages: `page.tsx` (Next.js convention, location determines route)
- API routes: `route.ts` (Next.js convention, HTTP method exported as function)
- Components: PascalCase + `.tsx` (e.g., `Button.tsx`, `IssuesSidebar.tsx`)
- Utilities/hooks: camelCase + `.ts` (e.g., `gameId.ts`, `useGameRealtime.ts`)
- Stores: `[entity]Store.ts` (e.g., `gameStore.ts`, `playerStore.ts`)

**Directories:**
- Feature folders: lowercase with hyphens if multiple words (e.g., `confidence/`, `landing/`)
- Index folders: `[param]/` for dynamic routes in Next.js App Router
- Type/util folders: Descriptive `lib/` subfolders (`supabase/`, `store/`, `utils/`, `hooks/`)

**Components:**
- UI primitives: `Button.tsx`, `Input.tsx`, `Toggle.tsx`, `Avatar.tsx`
- Features: `IssuesSidebar.tsx`, `FloatingCards.tsx`, `ConfidenceVote.tsx`, `PlayerSeat.tsx`
- Exports: Named exports (`export function Button() {}` or `export const Button = () => {}`)

**Functions:**
- Utilities: camelCase, pure functions (e.g., `calculateAverage()`, `createGameId()`)
- Handlers: `handle[Action]()` (e.g., `handleSubmit()`, `handleAddIssue()`)
- Selectors: action verbs or nouns (e.g., `allIssuesEstimated()`, `averageConfidence()`)
- Hooks: `use[Feature]()` (e.g., `useGameRealtime()`, `useGameStore()`)

**Types:**
- Types: PascalCase suffixed with type purpose (e.g., `GameStatus`, `VotingSystem`, `Permission`)
- Interfaces: PascalCase prefix with context (e.g., `ButtonProps`, `GameState`, `CreateGameBody`)
- Enums: CamelCase (not used, prefer union types like `type GameStatus = "voting" | "revealed"`)

**Constants:**
- Global constants: UPPERCASE_WITH_UNDERSCORES (e.g., `VOTING_CARDS`, `GAME_ID_LENGTH`)
- Color constants: CSS variables in `:root` (e.g., `--primary`, `--accent`, `--bg-surface`)
- Default objects: camelCase prefixed with DEFAULT_ (e.g., `DEFAULT_GAME_SETTINGS`)

## Where to Add New Code

**New Feature (e.g., Chat, Notifications):**
- Primary code: Create feature folder in `app/` (if page-level) or `components/` (if component-level)
- State: Add selectors/actions to `lib/store/gameStore.ts` if global, or component-level useState if local
- API: Add route file in `app/api/[feature]/`
- Tests: Create `[feature].test.ts` alongside component (folder structure mirrors src)

**New Component/Module:**
- Base UI component: `components/ui/[ComponentName].tsx` (exported, reusable)
- Feature component: `components/[feature]/[ComponentName].tsx` (feature-specific)
- Export via barrel file: Create `components/[feature]/index.ts` exporting main component
- Implementation: Follow Button.tsx pattern (TypeScript, forwardRef for DOM components, CSS Modules or Tailwind)

**Utilities:**
- Pure calculations: `lib/utils/[domain].ts` (e.g., `calculations.ts`, `gameId.ts`)
- Hooks: `lib/hooks/use[Feature].ts` (follows React naming convention)
- Constants: Add to `lib/constants.ts` at top level, or domain-specific file if large
- Re-export from barrel file: Update `lib/index.ts` if created

**Database Layer:**
- New table: Create SQL migration in `supabase/migrations/[date]_[description].sql`
- New type: Add to `lib/supabase/types.ts` (interface for row, insert type with optionals, update type)
- Validation: Add to relevant API route

## Special Directories

**node_modules/:**
- Purpose: Installed dependencies (Next.js, React, Zustand, Supabase, Tailwind, etc.)
- Generated: Yes (by npm install)
- Committed: No (.gitignore)

**.next/:**
- Purpose: Next.js build output and cache
- Generated: Yes (by npm run build or dev server)
- Committed: No (.gitignore)

**public/:**
- Purpose: Static assets served at root URL (avatars, memes, favicon)
- Generated: No (manually added images)
- Committed: Yes (must commit for deployment)

**supabase/migrations/:**
- Purpose: Database schema versioning
- Generated: No (manually created SQL files)
- Committed: Yes (required for database setup)

## Import Patterns

**Path Aliases:**
- Use `@/` prefix for absolute imports from project root
- Examples: `import { Button } from "@/components/ui/Button"`, `import { useGameStore } from "@/lib/store/gameStore"`
- Configured in `tsconfig.json`: `"paths": { "@/*": ["./*"] }`

**Module Exports:**
- Prefer named exports for utilities and types: `export function calculateAverage() {}`, `export type GameStatus = ...`
- Prefer default export for page components: `export default function LandingPage() {}`
- Barrel files (index.ts): Re-export related items for cleaner imports

## Configuration Files

**tsconfig.json:**
- TypeScript strict mode enabled
- Target ES2017, JSX react-jsx
- Path alias `@/*` for absolute imports
- Includes Next.js types automatically

**tailwind.config.ts:**
- Tailwind v4 (new syntax)
- Dark mode support (currently light-only)
- Custom theme colors defined as CSS variables

**app/globals.css:**
- CSS variables for Appinium brand colors
- Google Fonts imports (Space Grotesk, JetBrains Mono)
- Global resets and base styles

**next.config.ts:**
- Image optimization (for future image components)
- Typescript strict mode

---

*Structure analysis: 2026-02-16*
