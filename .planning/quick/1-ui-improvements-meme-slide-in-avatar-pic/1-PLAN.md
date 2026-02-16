---
phase: quick-1
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - components/memes/MemeOverlay.tsx
  - app/game/[gameId]/join/page.tsx
  - app/game/[gameId]/page.tsx
autonomous: true
requirements: [UI-01, UI-02, UI-03]

must_haves:
  truths:
    - "Meme appears as slide-in toast from right edge, not fullscreen modal"
    - "Meme auto-hides after 3-5 seconds without blocking game interaction"
    - "Avatar picker shows scrollable grid with max 6-9 visible, Join button always on screen"
    - "Kicked player can rejoin game via /join page after being removed"
  artifacts:
    - path: "components/memes/MemeOverlay.tsx"
      provides: "Toast-style meme overlay with slide-in animation"
      min_lines: 50
    - path: "app/game/[gameId]/join/page.tsx"
      provides: "Compact avatar picker with scroll container"
      contains: "max-h-"
    - path: "app/game/[gameId]/page.tsx"
      provides: "Kicked player redirect to /join instead of landing"
      contains: "clearSession"
  key_links:
    - from: "app/game/[gameId]/page.tsx"
      to: "/game/[gameId]/join"
      via: "router.push on kick detection"
      pattern: "wasKicked.*router\\.push"
---

<objective>
Improve UX for three pain points: meme display blocking gameplay, avatar picker overwhelming the join page, and kicked players being stuck.

Purpose: Make the app feel polished and user-friendly without major refactoring.
Output: Updated components with better UX patterns.
</objective>

<execution_context>
@/Users/eliseyramsey/.claude/get-shit-done/workflows/execute-plan.md
@/Users/eliseyramsey/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@components/memes/MemeOverlay.tsx
@app/game/[gameId]/join/page.tsx
@app/game/[gameId]/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Convert MemeOverlay to slide-in toast</name>
  <files>components/memes/MemeOverlay.tsx</files>
  <action>
    Transform fullscreen modal into toast-style notification:

    1. Remove `fixed inset-0 bg-black/70` fullscreen backdrop
    2. Position: `fixed bottom-6 right-6` (or `top-6 right-6`)
    3. Add slide-in animation: `animate-in slide-in-from-right-full duration-300`
    4. Max width: `max-w-sm` or `max-w-md` for compact size
    5. Remove the fullscreen click-to-close (click hint text)
    6. Keep close button (X) and countdown badge
    7. Add subtle shadow: `shadow-2xl`
    8. Remove `cursor-pointer` from container
    9. Reduce auto-close delay to 4000ms (4 seconds)
    10. Add exit animation via state: when closing, apply `animate-out slide-out-to-right-full` before unmounting (use setTimeout 200ms)

    Keep existing image error fallback logic.
  </action>
  <verify>
    Run `npm run build` to check for type/syntax errors.
    Visual test: After reveal in game room, meme should slide in from right edge as a compact toast, not block the entire screen.
  </verify>
  <done>
    Meme displays as non-blocking toast in bottom-right corner with slide animation, auto-closes in 4 seconds.
  </done>
</task>

<task type="auto">
  <name>Task 2: Make avatar picker compact with scroll</name>
  <files>app/game/[gameId]/join/page.tsx</files>
  <action>
    Constrain avatar grid to keep Join button visible:

    1. Find the avatar selection `<div>` with `grid grid-cols-4`
    2. Wrap the grid in a scroll container:
       ```tsx
       <div className="max-h-48 overflow-y-auto border border-[var(--border)] rounded-xl p-3">
         <div className="grid grid-cols-4 gap-3">
           {/* avatars */}
         </div>
       </div>
       ```
    3. max-h-48 shows ~2 rows (6-8 avatars), user scrolls for more
    4. Add subtle scrollbar styling if needed (Tailwind scrollbar plugin or custom CSS)
    5. Move the avatar count label `({availableAvatars.length} available)` above the scroll container
    6. Ensure scroll container has visual boundary (border or bg change)

    This keeps the form compact: name input + ~2 rows of avatars + spectator toggle + Join button all visible without scrolling the page.
  </action>
  <verify>
    Run `npm run dev` and navigate to `/game/{id}/join`.
    Avatar grid should be scrollable, Join button visible without page scroll even with 20+ avatars available.
  </verify>
  <done>
    Avatar picker shows 6-8 avatars in scrollable container, Join button always visible on screen.
  </done>
</task>

<task type="auto">
  <name>Task 3: Allow kicked players to rejoin</name>
  <files>app/game/[gameId]/page.tsx</files>
  <action>
    Update the "Kicked" modal behavior:

    1. Find the `wasKicked` modal section (around line 850)
    2. Change the button action from redirect to "/" to redirect to `/game/${gameId}/join`
    3. Update button text from "На главную" to "Присоединиться снова" (Rejoin)
    4. Keep `clearSession(gameId)` call to clear stale session before redirect
    5. The join page already handles session check and allows rejoining with new name/avatar

    Flow after change:
    - Player kicked -> sees modal -> clicks "Rejoin" -> goes to /join -> can pick new name/avatar -> joins game again
  </action>
  <verify>
    Test flow:
    1. Open two browser tabs with same game
    2. As admin, right-click and kick the other player
    3. Kicked player sees modal, clicks "Rejoin"
    4. Should land on /join page (not landing page)
    5. Can enter name, select avatar, join again
  </verify>
  <done>
    Kicked players are redirected to /join page and can rejoin the game with a new name/avatar.
  </done>
</task>

</tasks>

<verification>
- `npm run build` passes without errors
- Meme overlay: appears as toast on right edge, not blocking gameplay
- Avatar picker: scrollable container, Join button visible
- Kicked flow: redirects to /join, allows rejoin
</verification>

<success_criteria>
- All three UX issues resolved
- No regressions to existing functionality
- Build passes
</success_criteria>

<output>
After completion, create `.planning/quick/1-ui-improvements-meme-slide-in-avatar-pic/1-SUMMARY.md`
</output>
