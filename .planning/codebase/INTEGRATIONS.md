# External Integrations

**Analysis Date:** 2026-02-16

## APIs & External Services

**None currently integrated.** The application is self-contained without third-party API integrations (payments, email, SMS, etc.).

## Data Storage

**Databases:**
- Supabase PostgreSQL (free tier)
  - Connection: Configured via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - Client: `@supabase/supabase-js` (browser client in `lib/supabase/client.ts`)
  - Singleton pattern: `getSupabase()` function ensures single client instance
  - Real-time subscriptions on: games, players, votes, issues, confidence_votes tables
  - All tables have Supabase Realtime enabled for live multiplayer sync

**File Storage:**
- Local filesystem only (`public/` directory)
  - Avatars: `public/avatars/` (26 team member photos, JPG/PNG)
  - Memes: `public/memes/` (category-based meme images)
  - Static assets: SVG icons, HTML tools (avatar-picker.html)

**Caching:**
- None - Client-side state management via Zustand with localStorage persistence
  - localStorage key: `appinium-poker-sessions` (session persistence, not Zustand persist)
  - Zustand state: `gameStore` and `playerStore` (in-memory, not persisted)

## Authentication & Identity

**Auth Provider:**
- Custom anonymous authentication
  - No user registration or login required
  - Players identified by: `player_id` (nanoid 12-char string), `name` (user-provided), `avatar` (from TEAM_AVATARS)
  - First player to join a game becomes `creator_id` (admin)
  - Session persistence via localStorage: saves `gameId`, `playerId`, `sessionName` for auto-rejoin

**Admin Identification:**
- `creator_id` field in games table identifies the game creator
- Admin badge displayed next to creator's avatar
- Admin-only actions validated server-side in API routes

## Monitoring & Observability

**Error Tracking:**
- Not detected - Console errors only during development

**Logs:**
- Console logging only (development use)
- No centralized logging service (per CLAUDE.md: "No console.log() in production")

## CI/CD & Deployment

**Hosting:**
- Vercel (primary deployment target, Next.js native)
- Deployment: `npm run build` → Vercel auto-deployment on git push

**CI Pipeline:**
- Not detected - No GitHub Actions or CI config found
- ESLint runs via `npm run lint` (local only, not enforced in CI)

## Environment Configuration

**Required env vars:**
```
NEXT_PUBLIC_SUPABASE_URL        # Supabase project URL (https://xxx.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY   # Supabase anonymous key (starts with eyJ...)
NEXT_PUBLIC_APP_URL             # Application URL (http://localhost:3000 or production domain)
```

**Secrets location:**
- `.env.local` (developer machine, not committed)
- Vercel environment settings (production secrets managed in Vercel dashboard)
- Template: `.env.local.example` (committed to repo, safe placeholders)

## Webhooks & Callbacks

**Incoming:**
- Not detected - No external webhooks configured

**Outgoing:**
- Not detected - No outbound webhook triggers

## Realtime Communication

**WebSocket:**
- Supabase Realtime (PostgreSQL CDC via WebSocket)
  - Configured in `lib/supabase/client.ts`: `eventsPerSecond: 10` rate limit
  - Subscribed channels: `game-${gameId}` pattern
  - Event types: INSERT, UPDATE, DELETE on game tables
  - Subscription hook: `useGameRealtime()` in `lib/hooks/useGameRealtime.ts`
  - Handles all real-time multiplayer sync: player joins, votes, reveals, confidence votes

**Implementation Details:**
- Realtime subscriptions delayed by 100ms to avoid React StrictMode race conditions
- Callbacks use `useGameStore.getState()` for accessing fresh state
- Unsubscription on component unmount via cleanup function

## Rate Limits & Quotas

**Supabase Free Tier:**
- Database: PostgreSQL 500MB storage
- Realtime: Connected clients and message volume (not enforced for free tier currently)
- API: Standard rate limits apply

---

*Integration audit: 2026-02-16*
