---
created: 2026-02-16T22:21:00.037Z
title: Add error feedback to user actions
area: ui
priority: warning
files:
  - app/game/[gameId]/page.tsx:229-233
  - app/game/[gameId]/page.tsx:251-255
  - app/game/[gameId]/page.tsx:294-298
---

## Problem

Multiple catch blocks swallow errors silently. Users get no feedback when operations fail:

```typescript
} catch (error) {
  // Silent error
}
```

This happens in:
- handleUpdateName (line 229)
- handleUpdateAvatar (line 251)
- handleKickPlayer (line 294)
- handleMakeSpectator, handleTransferAdmin, etc.

## Solution

1. Add toast notification system (or simple alert)
2. Create `showError(message: string)` helper
3. Replace silent catches with user feedback:
   ```typescript
   } catch (error) {
     showError("Failed to update name. Please try again.");
   }
   ```
4. Consider using react-hot-toast or similar lightweight library
