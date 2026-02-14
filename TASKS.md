# TASKS.md
# Appinium Poker — Development Tasks

---

## Milestone 0: Design & Prototyping ✅
> Visual design and UX decisions

- [x] Create interactive HTML prototype with all screens
- [x] Finalize color scheme (light theme with Appinium colors)
- [x] Define typography (Space Grotesk + JetBrains Mono)
- [x] Design landing page (minimal: badge, title, Start Game button)
- [x] Design game creation form with toggles
- [x] Design player join screen with avatar selection
- [x] Design game room layout (header, table, cards, sidebar)
- [x] Design confidence vote modal
- [x] Update PRD with prototype reference

**Prototype:** `prototypes/prototype-appinium-light.html`

---

## Milestone 1: Project Setup ✅
> Foundation — get the project running

- [x] Initialize Next.js 14 project with TypeScript
- [x] Configure Tailwind CSS with light theme (Appinium colors)
- [x] Set up project folder structure
- [ ] Create Supabase project and get credentials
- [x] Configure environment variables (.env.local.example)
- [x] Set up ESLint + Prettier
- [x] Create base layout component with Appinium colors
- [x] Add Zustand for state management
- [x] Install dependencies (nanoid, lucide-react, framer-motion)

---

## Milestone 2: Database & API
> Backend infrastructure

- [x] Write SQL migrations for all tables (games, players, issues, votes, confidence_votes)
- [ ] Run migrations in Supabase
- [x] Enable Row Level Security with public policies (in migration)
- [x] Enable Realtime on required tables (in migration)
- [x] Generate TypeScript types from Supabase schema (manual types)
- [x] Create Supabase client (browser + server)
- [ ] Implement API route: POST `/api/games` (create game)
- [ ] Implement API route: GET `/api/games/[id]` (get game)
- [ ] Implement API route: PATCH `/api/games/[id]` (update game status)
- [ ] Implement API route: POST `/api/players` (join game)
- [ ] Implement API route: POST `/api/votes` (submit vote)
- [ ] Implement API route: DELETE `/api/votes` (clear votes)
- [ ] Implement API routes for issues CRUD

---

## Milestone 3: Landing Page ✅
> First impression

- [x] Design landing page layout
- [x] Create Hero section with headline and CTA
- [x] Add "Start Game" button → navigates to /create
- [x] Create simple footer (minimal design, no footer needed per prototype)
- [x] Add Appinium branding/logo placeholder
- [x] Responsive design for mobile

---

## Milestone 4: Game Creation ✅
> Create and configure a game

- [x] Create `/create` page
- [x] Build game creation form:
  - [x] Game name input with emoji picker (optional)
  - [x] Voting system selector (Fibonacci default)
  - [x] Who can reveal dropdown
  - [x] Who can manage issues dropdown
  - [x] Auto-reveal toggle
  - [x] Fun features toggle
  - [x] Show average toggle
  - [x] Countdown animation toggle
- [x] Form validation
- [ ] Submit → create game in DB → redirect to join page
- [x] Generate unique game ID (nanoid)

---

## Milestone 5: Player Join Flow ✅
> Enter the game

- [x] Create `/game/[gameId]/join` page
- [ ] Check if game exists, show error if not
- [x] Display name input with emoji picker (optional)
- [x] Spectator mode toggle
- [x] Avatar selection (hardcoded team avatars)
- [x] "Continue to Game" button
- [x] Store player ID in localStorage for session persistence
- [x] Redirect to game room after joining

---

## Milestone 6: Game Room — Core UI ✅
> The main poker table

- [x] Create `/game/[gameId]` page
- [x] Build Header component (logo, game name, user dropdown, invite button)
- [x] Build PokerTable component (central oval/rectangle)
- [x] Build PlayerSeat component (avatar + name + card back/value)
- [ ] Position players dynamically around table (up to 10)
- [x] Build CardSelector component (Fibonacci cards at bottom)
- [x] Card selection interaction (click to select, click again to deselect)
- [x] Visual highlight for selected card
- [x] Build RevealButton component (center of table)
- [x] Show "Reveal Cards" only when at least 1 vote exists

---

## Milestone 7: Real-time Sync
> Live updates for all players

- [ ] Create useGame hook with Supabase Realtime subscription
- [ ] Subscribe to players table changes (join/leave)
- [ ] Subscribe to votes table changes (vote status)
- [ ] Subscribe to games table changes (reveal status)
- [ ] Subscribe to issues table changes
- [ ] Update Zustand store on realtime events
- [ ] Handle player disconnect/reconnect
- [ ] Show online/offline status for players

---

## Milestone 8: Voting Flow
> Cast and reveal votes

- [ ] Clicking card → POST vote to API
- [x] Show card back for players who voted
- [x] Show "waiting" state for players who haven't voted
- [ ] Auto-reveal option: trigger when all non-spectators voted
- [x] Manual reveal: click Reveal button
- [ ] Countdown animation before reveal (3-2-1)
- [x] Flip all cards simultaneously
- [x] Show vote values on player cards
- [x] Calculate and display average
- [x] "Start New Vote" button to reset

---

## Milestone 9: Issues Sidebar
> Manage backlog items

- [ ] Build IssuesSidebar component (collapsible right panel)
- [ ] Display list of issues with status badges
- [ ] Highlight current voting issue
- [ ] "Add Issue" quick form (title input)
- [ ] Issue card shows: ID, title, status, final score
- [ ] Click issue → set as current voting item
- [ ] Edit issue (inline or modal)
- [ ] Delete issue with confirmation
- [ ] Show total issues count and total points
- [ ] Drag-and-drop reordering (optional, can defer)

---

## Milestone 10: Invite Players ✅
> Share the game

- [x] Build InviteModal component (inline in header)
- [x] Display game URL
- [x] Copy link button (one-click copy)
- [x] Show "Copied!" confirmation
- [ ] QR code generation (optional, can defer)

---

## Milestone 11: Confidence Vote
> Fist of Five for sprint commitment

- [x] Create ConfidenceVote modal component
- [x] Add "Confidence Vote" button in header/menu
- [x] Build FistSelector (1-5 hands/numbers)
- [ ] Submit confidence vote to API
- [ ] Show all votes on reveal
- [ ] Calculate and display team average
- [ ] Distribution visualization (optional bar chart)
- [x] Separate from story point voting

---

## Milestone 12: Meme System
> Team personality

- [ ] Create memes folder structure in public/
- [ ] Add placeholder meme images (5-10)
- [ ] Create memeData.ts with categories
- [ ] Build MemeOverlay component
- [ ] Trigger meme on card reveal based on conditions:
  - [ ] Consensus (all same vote)
  - [ ] Chaos (high spread)
  - [ ] Coffee break
  - [ ] Question mark confusion
  - [ ] Random default
- [ ] Add custom team avatar images
- [ ] Custom card back designs (optional)

---

## Milestone 13: Polish & UX
> Make it feel good

- [ ] Loading states for all async operations
- [ ] Error handling with user-friendly messages
- [ ] Empty states (no issues, no players)
- [ ] Animations: card flip, player join, vote submit
- [ ] Sound effects (optional, toggle in settings)
- [ ] Mobile responsive adjustments
- [ ] Keyboard shortcuts (Enter to reveal, numbers to vote)
- [ ] Toast notifications for actions

---

## Milestone 14: History & Export
> Persist and share results

- [ ] Game session persists indefinitely
- [ ] Export session results to CSV
- [ ] Export button in header/menu
- [ ] Include: issue title, final score, individual votes
- [ ] Browse past games (optional, can defer)

---

## Milestone 15: Testing & QA
> Make sure it works

- [ ] Unit tests for utility functions (average calc, ID generation)
- [ ] Component tests for key UI elements
- [ ] E2E test: create game → join → vote → reveal
- [ ] E2E test: multiple players in same game
- [ ] Test realtime sync with 2 browser windows
- [ ] Test mobile experience
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Fix identified bugs

---

## Milestone 16: Deployment
> Ship it!

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Connect Vercel to repository
- [ ] Configure environment variables in Vercel
- [ ] Deploy to production
- [ ] Test production environment
- [ ] Custom domain setup (optional)
- [ ] Monitor for errors

---

## Backlog (Future)
> Nice to have, not MVP

- [ ] Jira integration (import issues)
- [ ] Slack notifications
- [ ] Timer for voting rounds
- [ ] Custom voting scales (T-shirt sizes)
- [ ] Persistent teams
- [ ] Admin panel for meme management
- [ ] Dark/light theme toggle
- [ ] Retrospective mode
- [ ] Player kick functionality
- [ ] Moderator transfer
