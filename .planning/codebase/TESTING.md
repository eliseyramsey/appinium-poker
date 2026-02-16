# Testing Patterns

**Analysis Date:** 2025-02-16

## Test Framework

**Status:** Not implemented

**Runner:**
- Not configured - no test runner installed (Vitest/Jest not in package.json)

**Assertion Library:**
- Not installed

**Run Commands:**
- Not available (npm scripts: `dev`, `build`, `start`, `lint` only)

**Note:** Per CLAUDE.md global instructions, TDD (tests first, then implementation) is required. Current codebase has no test infrastructure. This is a priority gap.

## Recommended Test Setup

**Framework:**
- Vitest for unit tests (lightweight, TypeScript-first, Fast)
- Playwright or Cypress for E2E tests (existing monolith doesn't prevent this)

**Installation:**
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test  # For E2E
```

**Configuration Example (vitest.config.ts):**
```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        ".next/",
      ],
    },
  },
  resolve: {
    alias: {
      "@": "/",
    },
  },
});
```

**Package.json Scripts (to add):**
```json
"test": "vitest",
"test:ui": "vitest --ui",
"test:watch": "vitest --watch",
"test:coverage": "vitest --coverage",
"test:e2e": "playwright test"
```

## Test File Organization

**Location:** Co-located with source files

**Naming Convention:**
- Unit tests: `[file].test.ts` or `[file].test.tsx`
- E2E tests: `e2e/[flow].e2e.ts`

**Directory Structure:**
```
lib/
  utils/
    calculations.ts
    calculations.test.ts        # Co-located
    gameId.ts
    gameId.test.ts
  store/
    gameStore.ts
    gameStore.test.ts
  hooks/
    useGameRealtime.ts
    useGameRealtime.test.ts

components/
  ui/
    Button.tsx
    Button.test.tsx

e2e/
  game-flow.e2e.ts              # Full user journeys
  voting.e2e.ts
```

## Test Structure

**Unit Test Pattern:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { calculateAverage, hasConsensus, getVoteSpread } from "@/lib/utils/calculations";
import type { Vote } from "@/lib/supabase/types";

describe("calculations", () => {
  describe("calculateAverage", () => {
    it("should calculate average of numeric votes", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "5", created_at: "" },
        { id: "2", issue_id: "i1", player_id: "p2", value: "8", created_at: "" },
        { id: "3", issue_id: "i1", player_id: "p3", value: "3", created_at: "" },
      ];

      const result = calculateAverage(votes);
      expect(result).toBe(5.3); // (5+8+3)/3 = 5.33... rounded
    });

    it("should ignore non-numeric votes", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "5", created_at: "" },
        { id: "2", issue_id: "i1", player_id: "p2", value: "?", created_at: "" },
        { id: "3", issue_id: "i1", player_id: "p3", value: "coffee", created_at: "" },
      ];

      const result = calculateAverage(votes);
      expect(result).toBe(5); // Only 5 counted
    });

    it("should return null if no numeric votes", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "?", created_at: "" },
        { id: "2", issue_id: "i1", player_id: "p2", value: "coffee", created_at: "" },
      ];

      const result = calculateAverage(votes);
      expect(result).toBeNull();
    });
  });

  describe("hasConsensus", () => {
    it("should return true if all votes are identical", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "8", created_at: "" },
        { id: "2", issue_id: "i1", player_id: "p2", value: "8", created_at: "" },
        { id: "3", issue_id: "i1", player_id: "p3", value: "8", created_at: "" },
      ];

      expect(hasConsensus(votes)).toBe(true);
    });

    it("should return false if votes differ", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "5", created_at: "" },
        { id: "2", issue_id: "i1", player_id: "p2", value: "8", created_at: "" },
      ];

      expect(hasConsensus(votes)).toBe(false);
    });

    it("should return false if less than 2 votes", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "5", created_at: "" },
      ];

      expect(hasConsensus(votes)).toBe(false);
    });
  });

  describe("getVoteSpread", () => {
    it("should calculate spread between min and max numeric votes", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "3", created_at: "" },
        { id: "2", issue_id: "i1", player_id: "p2", value: "13", created_at: "" },
        { id: "3", issue_id: "i1", player_id: "p3", value: "8", created_at: "" },
      ];

      expect(getVoteSpread(votes)).toBe(10); // 13 - 3
    });

    it("should ignore non-numeric votes when calculating spread", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "2", created_at: "" },
        { id: "2", issue_id: "i1", player_id: "p2", value: "?", created_at: "" },
        { id: "3", issue_id: "i1", player_id: "p3", value: "21", created_at: "" },
      ];

      expect(getVoteSpread(votes)).toBe(19); // 21 - 2
    });

    it("should return 0 if fewer than 2 numeric votes", () => {
      const votes: Vote[] = [
        { id: "1", issue_id: "i1", player_id: "p1", value: "5", created_at: "" },
      ];

      expect(getVoteSpread(votes)).toBe(0);
    });
  });
});
```

## Mocking

**Framework:** Vitest built-in mocking via `vi`

**API Mocking (for realtime testing):**
```typescript
import { vi } from "vitest";
import { useGameRealtime } from "@/lib/hooks/useGameRealtime";
import { getSupabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client", () => ({
  getSupabase: vi.fn(),
  isSupabaseConfigured: vi.fn(() => true),
}));

describe("useGameRealtime", () => {
  it("should subscribe to game changes", () => {
    const mockSubscribe = vi.fn((callback) => {
      callback("SUBSCRIBED");
      return { unsubscribe: vi.fn() };
    });

    const mockChannel = vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: mockSubscribe,
    }));

    const mockSupabase = {
      channel: mockChannel,
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: "game1" } }),
    };

    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);

    // Test hook behavior
  });
});
```

**Fetch Mocking (for API calls):**
```typescript
import { vi } from "vitest";

global.fetch = vi.fn((url, options) => {
  if (url === "/api/games" && options.method === "POST") {
    return Promise.resolve({
      ok: true,
      status: 201,
      json: () => Promise.resolve({ id: "game-123", name: "Test Game" }),
    });
  }
  return Promise.reject(new Error("Unknown endpoint"));
});
```

## Patterns for Key Areas

### What to Mock

- **Supabase client**: Always mock in unit tests to avoid DB calls
- **Next.js router**: Mock `useRouter` for navigation testing
- **Zustand stores**: Can test directly, or mock for hook tests
- **Fetch/HTTP calls**: Mock to control responses
- **Timers**: Use `vi.useFakeTimers()` for countdown tests

### What NOT to Mock

- **Pure utility functions**: Test with real data (calculations, validators)
- **Store selectors**: Test store logic directly
- **Type definitions**: No tests needed
- **Constants**: Test usage, not the constants themselves

## Testing Zustand Stores

**Example: gameStore**
```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { useGameStore } from "@/lib/store/gameStore";
import type { Game, Player, Issue, Vote } from "@/lib/supabase/types";

describe("gameStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useGameStore.setState({
      game: null,
      players: [],
      issues: [],
      votes: [],
      confidenceVotes: [],
      currentIssue: null,
      isRevealed: false,
    });
  });

  describe("setGame", () => {
    it("should update game and calculate isRevealed", () => {
      const game: Game = {
        id: "game1",
        name: "Sprint 1",
        status: "voting",
        creator_id: "player1",
        confidence_status: "idle",
        // ... other fields
      };

      useGameStore.getState().setGame(game);

      expect(useGameStore.getState().game).toEqual(game);
      expect(useGameStore.getState().isRevealed).toBe(false);
    });

    it("should set isRevealed true when status is revealed", () => {
      const game: Game = {
        id: "game1",
        status: "revealed",
        // ... other fields
      };

      useGameStore.getState().setGame(game);

      expect(useGameStore.getState().isRevealed).toBe(true);
    });
  });

  describe("isAdmin selector", () => {
    it("should return true for creator", () => {
      const game: Game = {
        id: "game1",
        creator_id: "player1",
        // ... other fields
      };

      useGameStore.setState({ game });

      const isAdmin = useGameStore.getState().isAdmin("player1");
      expect(isAdmin).toBe(true);
    });

    it("should return false for non-creator", () => {
      const game: Game = {
        id: "game1",
        creator_id: "player1",
        // ... other fields
      };

      useGameStore.setState({ game });

      const isAdmin = useGameStore.getState().isAdmin("player2");
      expect(isAdmin).toBe(false);
    });
  });

  describe("allIssuesEstimated selector", () => {
    it("should return false if no issues", () => {
      useGameStore.setState({ issues: [] });

      expect(useGameStore.getState().allIssuesEstimated()).toBe(false);
    });

    it("should return true if all issues have status voted with score", () => {
      const issues: Issue[] = [
        {
          id: "issue1",
          game_id: "game1",
          title: "Feature A",
          status: "voted",
          final_score: 5,
          // ... other fields
        },
        {
          id: "issue2",
          game_id: "game1",
          title: "Feature B",
          status: "voted",
          final_score: 8,
          // ... other fields
        },
      ];

      useGameStore.setState({ issues });

      expect(useGameStore.getState().allIssuesEstimated()).toBe(true);
    });

    it("should return false if any issue missing score", () => {
      const issues: Issue[] = [
        {
          id: "issue1",
          status: "voted",
          final_score: 5,
          // ... other fields
        },
        {
          id: "issue2",
          status: "voted",
          final_score: null, // Missing score
          // ... other fields
        },
      ];

      useGameStore.setState({ issues });

      expect(useGameStore.getState().allIssuesEstimated()).toBe(false);
    });
  });
});
```

## Testing Hooks

**useGameRealtime Pattern:**
```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useGameRealtime } from "@/lib/hooks/useGameRealtime";
import { useGameStore } from "@/lib/store/gameStore";
import { getSupabase } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client");
vi.mock("@/lib/store/gameStore");

describe("useGameRealtime", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should fetch initial data when gameId is provided", async () => {
    const mockGame = { id: "game1", name: "Test Game" };
    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockGame }),
    };

    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);

    renderHook(() => useGameRealtime("game1"));

    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith("games");
    });
  });

  it("should cleanup subscription on unmount", () => {
    const mockRemoveChannel = vi.fn();
    const mockSupabase = {
      channel: vi.fn(() => ({
        on: vi.fn().mockReturnThis(),
        subscribe: vi.fn().mockReturnThis(),
      })),
      removeChannel: mockRemoveChannel,
    };

    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);

    const { unmount } = renderHook(() => useGameRealtime("game1"));

    unmount();

    // Verify cleanup called
  });
});
```

## Testing API Routes

**Example: POST /api/games**
```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { POST } from "@/app/api/games/route";
import { NextRequest } from "next/server";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

vi.mock("@/lib/supabase/client");

describe("/api/games POST", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate required fields", async () => {
    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify({ name: "" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Game name is required");
  });

  it("should create game successfully", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const mockGame = {
      id: "game123",
      name: "Test Game",
      status: "voting",
      creator_id: null,
    };

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: mockGame, error: null }),
    };

    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify({ name: "Test Game" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe("game123");
  });

  it("should handle database errors", async () => {
    vi.mocked(isSupabaseConfigured).mockReturnValue(true);

    const mockSupabase = {
      from: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: "Database error" },
      }),
    };

    vi.mocked(getSupabase).mockReturnValue(mockSupabase as any);

    const request = new NextRequest("http://localhost:3000/api/games", {
      method: "POST",
      body: JSON.stringify({ name: "Test Game" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toContain("Failed to create game");
  });
});
```

## E2E Test Examples

**Full game flow (Playwright):**
```typescript
import { test, expect } from "@playwright/test";

test("complete voting flow", async ({ page, context }) => {
  // User 1: Create game
  await page.goto("http://localhost:3000");
  await page.click("button:has-text('Start New Game')");
  await page.fill("input[placeholder='Game name']", "Sprint 123");
  await page.click("button:has-text('Create Game')");

  const gameUrl = page.url();
  const gameId = gameUrl.split("/").pop();

  // User 1: Join as admin
  await page.fill("input[placeholder='Your name']", "Alice");
  await page.click("button:has-text('Join Game')");

  // User 2: Join same game in new context
  const page2 = await context.newPage();
  await page2.goto(`${gameUrl}/join`);
  await page2.fill("input[placeholder='Your name']", "Bob");
  await page2.click("button:has-text('Join Game')");

  // Both see each other
  await expect(page.locator("text=Bob")).toBeVisible();
  await expect(page2.locator("text=Alice")).toBeVisible();

  // Alice votes
  await page.click("button:has-text('5')");
  await expect(page.locator("button:has-text('5')")).toHaveClass(/selected/);

  // Bob votes
  await page2.click("button:has-text('8')");
  await expect(page2.locator("button:has-text('8')")).toHaveClass(/selected/);

  // Alice reveals
  await page.click("button:has-text('Reveal Cards')");

  // Both see results
  await expect(page.locator("text=Average")).toBeVisible();
  await expect(page2.locator("text=Average")).toBeVisible();
});

test("admin-only operations", async ({ page, context }) => {
  // Setup: Admin creates game
  // Non-admin tries to reveal
  const page2 = await context.newPage();

  await page2.goto(`${gameUrl}/join`);
  await page2.fill("input[placeholder='Your name']", "Bob");
  await page2.click("button:has-text('Join Game')");

  // Reveal button should be disabled for Bob
  await expect(page2.locator("button:has-text('Reveal Cards')")).toBeDisabled();
});
```

## Coverage Goals

**Targets (recommended, not enforced currently):**
- Utility functions: 100% (pure logic)
- Zustand stores: 90% (easy to test)
- Hooks: 80% (requires mocking)
- API routes: 90% (critical path)
- Components: 60% (UI hard to test, focus on logic)

**View Coverage:**
```bash
npm run test:coverage
# Opens ./coverage/index.html in browser
```

## Test Priorities (by impact)

**High Priority (must test):**
1. `lib/utils/calculations.ts` - Core voting logic (calculateAverage, consensus, spread)
2. `lib/store/gameStore.ts` - State management (selectors, updates)
3. `app/api/games/route.ts` - Game creation and reveal (admin checks, error handling)
4. `app/api/players/route.ts` - Avatar uniqueness validation (409 conflict handling)

**Medium Priority:**
5. `app/api/votes/route.ts` - Vote submission and clearing
6. `app/api/confidence/route.ts` - Confidence voting logic
7. `app/api/issues/route.ts` - Issue CRUD and validation

**Lower Priority (E2E focus):**
8. Components (Button, Input, Avatar) - Tested via E2E
9. Pages - Tested via E2E

## Known Test Gaps

1. **No test infrastructure installed** - Vitest/Jest/Playwright not in dependencies
2. **No tests exist** - Zero coverage
3. **Realtime sync not tested** - Critical path for multiplayer
4. **Confidence voting logic** - Complex state transitions untested
5. **Avatar validation race conditions** - Not tested

---

*Testing analysis: 2025-02-16*
