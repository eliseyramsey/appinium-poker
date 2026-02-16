# Phase 1: Admin Player Management

## Goal
Admin может кикнуть игрока, назначить спектатором, передать админку

## Tasks

### 1. API: Extend player endpoint
- [ ] Add `is_spectator` to PATCH body
- [ ] Add DELETE method for kicking players
- [ ] Validate admin permission for both

### 2. API: Add transfer admin to game endpoint
- [ ] Add `creator_id` to PATCH body in games/[gameId]
- [ ] Validate requester is current admin

### 3. UI: Context menu component
- [ ] Create PlayerContextMenu component
- [ ] Options: Kick, Make Spectator, Transfer Admin
- [ ] Show only for admin, only for other players

### 4. UI: Integrate menu into PlayerSeat
- [ ] Right-click triggers menu
- [ ] Handle all three actions
- [ ] Show loading state

### 5. Handle kicked state
- [ ] Detect player removal via realtime
- [ ] Redirect kicked player with message

## Files to Modify
- `app/api/players/[playerId]/route.ts` — PATCH + DELETE
- `app/api/games/[gameId]/route.ts` — transfer admin
- `app/game/[gameId]/page.tsx` — context menu + kicked detection
- `components/ui/ContextMenu.tsx` — new component

## Success Criteria
- [ ] Right-click on player shows menu (admin only)
- [ ] "Kick" removes player, they see message
- [ ] "Make Spectator" toggles is_spectator
- [ ] "Transfer Admin" changes creator_id, new admin sees 👑
