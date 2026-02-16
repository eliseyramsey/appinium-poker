---
phase: 4-bug-fixes
plan: 04
type: execute
wave: 2
depends_on:
  - 4-03
files_modified:
  - components/ui/Toast.tsx
  - app/game/[gameId]/page.tsx
  - app/game/[gameId]/join/page.tsx
  - lib/supabase/types.ts
autonomous: true
requirements:
  - BUGS-06
  - BUGS-14
  - BUGS-11

must_haves:
  truths:
    - "Failed actions show error toast to user"
    - "Join page shows error message on failure"
    - "Supabase types are generated, no as never casts"
  artifacts:
    - path: "components/ui/Toast.tsx"
      provides: "Toast notification component"
      exports: ["Toast", "useToast"]
    - path: "app/game/[gameId]/page.tsx"
      provides: "Error feedback on all catch blocks"
      contains: "showToast"
    - path: "app/game/[gameId]/join/page.tsx"
      provides: "Error state on join failure"
      contains: "setError"
    - path: "lib/supabase/types.ts"
      provides: "Generated database types"
      contains: "Database"
  key_links:
    - from: "app/game/[gameId]/page.tsx"
      to: "components/ui/Toast.tsx"
      via: "useToast hook"
      pattern: "useToast"
---

<objective>
Add user error feedback and improve type safety with generated Supabase types.

Purpose: Better UX on failures, stronger type safety to catch bugs at compile time.
Output: Toast notifications on errors, proper TypeScript types.
</objective>

<execution_context>
@/Users/eliseyramsey/.claude/get-shit-done/workflows/execute-plan.md
@/Users/eliseyramsey/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/todos/pending/2026-02-16-add-error-feedback-to-user-actions.md
@.planning/todos/pending/2026-02-16-fix-join-page-error-state-bug.md
@.planning/todos/pending/2026-02-16-generate-supabase-types-to-remove-as-never.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Toast component and add error feedback</name>
  <files>components/ui/Toast.tsx, app/game/[gameId]/page.tsx</files>
  <action>
**components/ui/Toast.tsx:**
Create a simple toast notification system (no external deps):

```typescript
"use client";

import { useState, useCallback, createContext, useContext, type ReactNode } from "react";

interface Toast {
  id: string;
  message: string;
  type: "error" | "success" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "error" | "success" | "info") => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: "error" | "success" | "info" = "error") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-lg shadow-lg text-white ${
              toast.type === "error" ? "bg-red-500" :
              toast.type === "success" ? "bg-green-500" : "bg-blue-500"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

**app/game/[gameId]/page.tsx:**
1. Wrap page content with ToastProvider (or add to layout)
2. Use `const { showToast } = useToast();`
3. Replace all silent catch blocks with showToast calls:

```typescript
// handleUpdateName
} catch (error) {
  showToast("Failed to update name. Please try again.");
}

// handleUpdateAvatar
} catch (error) {
  showToast("Failed to update avatar. Please try again.");
}

// handleKickPlayer
} catch (error) {
  showToast("Failed to kick player.");
}

// handleMakeSpectator
} catch (error) {
  showToast("Failed to update player status.");
}

// handleTransferAdmin
} catch (error) {
  showToast("Failed to transfer admin.");
}
```

Add similar error handling to vote submission, issue creation, etc.
  </action>
  <verify>
- `npm run build` passes
- Toast component renders correctly
- Trigger an error (e.g., network off) and see toast appear
  </verify>
  <done>Toast system created, all catch blocks show error feedback</done>
</task>

<task type="auto">
  <name>Task 2: Fix join page error state</name>
  <files>app/game/[gameId]/join/page.tsx</files>
  <action>
Find the catch block that silently clears loading (around line 172-174) and add error feedback:

```typescript
} catch (error) {
  setIsLoading(false);
  setError("Failed to join game. Please try again.");
  // Log in development for debugging
  if (process.env.NODE_ENV === "development") {
    console.error("Join error:", error);
  }
}
```

Also ensure the error state is displayed to the user. Check if there's an error display element. If not, add one:

```tsx
{error && (
  <div className="text-red-500 text-sm text-center mb-4">
    {error}
  </div>
)}
```
  </action>
  <verify>
- `npm run build` passes
- Test: Try to join with invalid data, see error message
  </verify>
  <done>Join page shows error message on failure</done>
</task>

<task type="auto">
  <name>Task 3: Generate Supabase types</name>
  <files>lib/supabase/types.ts, app/api/games/route.ts, app/api/votes/route.ts, app/api/issues/route.ts, app/api/issues/[issueId]/route.ts, app/api/confidence/route.ts</files>
  <action>
**Generate types from Supabase:**
1. Get project ID from SUPABASE_URL (format: https://[project-id].supabase.co)
2. Run: `npx supabase gen types typescript --project-id [project-id] > lib/supabase/database.types.ts`

If CLI login required:
```bash
npx supabase login
# Then retry the gen types command
```

**Alternative if no CLI access:**
1. Go to Supabase Dashboard -> Project Settings -> API
2. Click "Generate types" or find type generator
3. Copy generated types to `lib/supabase/database.types.ts`

**Update lib/supabase/types.ts:**
```typescript
import type { Database as GeneratedDatabase } from "./database.types";

export type Database = GeneratedDatabase;

// Re-export table types for convenience
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type GameInsert = Database["public"]["Tables"]["games"]["Insert"];
export type GameUpdate = Database["public"]["Tables"]["games"]["Update"];

// ... same for Player, Vote, Issue, ConfidenceVote
```

**Remove `as never` casts:**
Search all API routes for `as never` and remove:
- `app/api/games/route.ts:62` - `.insert(gameData as never)` -> `.insert(gameData)`
- `app/api/votes/route.ts:50` - `.update({ value } as never)` -> `.update({ value })`
- `app/api/votes/route.ts:69` - `.insert(voteData as never)` -> `.insert(voteData)`
- `app/api/issues/route.ts:99` - `.insert(issueData as never)` -> `.insert(issueData)`
- `app/api/issues/[issueId]/route.ts:99` - `.update(updateData as never)` -> `.update(updateData)`
- `app/api/confidence/route.ts:53` - `.upsert(voteData as never)` -> `.upsert(voteData)`
- `app/api/confidence/route.ts:130` - `.update({ confidence_status } as never)` -> `.update({ confidence_status })`

**Fix any resulting type errors** - these indicate real mismatches between code and DB schema.
  </action>
  <verify>
- `npm run build` passes with no TypeScript errors
- `grep "as never" app/api/**/*.ts` returns nothing
- Generated types file exists
  </verify>
  <done>Supabase types generated, all as never casts removed</done>
</task>

</tasks>

<verification>
After completing all tasks:
1. Run `npm run build` - should pass
2. Run `npm run test` if tests exist - should pass
3. Test full game flow with network issues simulated
4. Verify error toasts appear on failures
5. Verify join page shows errors
</verification>

<success_criteria>
1. All 3 bugs fixed (BUGS-06, 14, 11)
2. Toast system working
3. All silent catch blocks have feedback
4. Join page shows errors
5. No `as never` casts in codebase
6. Generated Supabase types in use
</success_criteria>

<output>
After completion, create `.planning/phases/4-bug-fixes/4-04-SUMMARY.md`
</output>
