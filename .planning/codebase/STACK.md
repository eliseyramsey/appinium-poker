# Technology Stack

**Analysis Date:** 2026-02-16

## Languages

**Primary:**
- TypeScript 5 - All source code, strict mode enabled

**Secondary:**
- JavaScript (ES6+) - Configuration files (postcss.config.mjs, eslint.config.mjs, next.config.ts)

## Runtime

**Environment:**
- Node.js (version unspecified in .nvmrc, matches npm/package.json engines implied)

**Package Manager:**
- npm (lockfile: package-lock.json present)

## Frameworks

**Core:**
- Next.js 16.1.6 - App Router, API routes, server-side rendering, Vercel-native

**UI & Rendering:**
- React 19.2.3 - Component library
- react-dom 19.2.3 - DOM rendering

**Styling:**
- Tailwind CSS 4 - Utility-first CSS framework for light theme
- @tailwindcss/postcss 4 - PostCSS plugin for Tailwind
- postcss - CSS processing pipeline (postcss.config.mjs)

**State Management:**
- Zustand 5.0.11 - Client-side state (gameStore.ts, playerStore.ts with localStorage persistence)

**Animation & Motion:**
- Framer Motion 12.34.0 - Card flips, reveals, floating cards, countdown animations

**Icons:**
- Lucide React 0.564.0 - Icon library for UI components

## Key Dependencies

**Critical:**
- @supabase/supabase-js 2.95.3 - PostgreSQL client with Realtime WebSocket support
- nanoid 5.1.6 - ID generation for games (8 chars) and players (12 chars)

**Infrastructure:**
- typescript 5 - Language compiler
- @types/react 19 - React type definitions
- @types/react-dom 19 - React DOM type definitions
- @types/node 20 - Node.js type definitions

## Configuration

**Environment:**
- Environment variables in `.env.local` (not committed to git)
- Critical vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`
- `.env.local.example` provides template with placeholder values

**Build:**
- `next.config.ts` - Next.js configuration with remote image patterns
- `tsconfig.json` - TypeScript compiler options (ES2017 target, strict mode, path alias `@/*`)
- `postcss.config.mjs` - PostCSS configuration for Tailwind integration
- `eslint.config.mjs` - ESLint 9 flat config with Next.js core web vitals and TypeScript rules

## Platform Requirements

**Development:**
- Node.js runtime
- npm for dependency management
- Supabase credentials (URL, anonymous key)
- PostgreSQL database (via Supabase)

**Production:**
- Vercel hosting (primary deployment target)
- Supabase PostgreSQL free tier (data persistence)
- WebSocket support for Realtime subscriptions

## Package Scripts

```bash
npm run dev         # Start development server (next dev)
npm run build       # Production build (next build)
npm run start       # Start production server (next start)
npm run lint        # Run ESLint
```

---

*Stack analysis: 2026-02-16*
