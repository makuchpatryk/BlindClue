# Refactor: Folder Structure, Shared Components, and Constants

## Context

Codebase has scattered components, hardcoded status values in ~15 locations, and shared utilities buried in `features/shared/`. Refactoring moves shared to root level, centralizes constants, and extracts reusable components (buttons, timer logic). Views stay in features.

## Phase 1: Core Refactor

### Folder Structure Reorganization

1. Create `/packages/frontend/src/shared/` directory (with subdirs: components, services, types, utils, composables, styles)
2. Move `/packages/frontend/src/features/shared/*` → `/packages/frontend/src/shared/`
3. Update all import paths

### Extract Status Constants

1. Create `/packages/frontend/src/shared/utils/game-status.ts` with enum
2. Replace all hardcoded status strings (~15+ locations)

### Button Component Enhancement

1. Extend `/shared/components/button.vue` with variant prop (`primary` | `secondary` | `danger`)
2. Replace inline button styles across components

### Extract Shared Composables

1. Move `use-round-timer.ts` → `/shared/composables/use-timer.ts`
2. Generalize timer logic for reuse
3. Update imports in voting-phase.vue, round-phase.vue

### Adopt Centralized Constants

1. Use `API_BASE_URL` from `/shared/utils/constants.ts` in `use-lobby.ts`

## Phase 2: Additional High-Impact Refactors

### A. Session Storage Utility (affects 8+ locations)

Create `/shared/utils/session-storage.ts`:

- `saveGameSession(gameId, playerId)`
- `getGameSession()` → returns session object or null
- `clearGameSession()`

**Files to update:** game-client.service.ts, create-game-form.vue, join-game-form.vue, game-view.vue

### B. Socket Event Constants (affects 20+ hardcoded strings)

Create `/shared/utils/socket-events.ts` enum:

Game events: `GAME_STARTED`, `ROUND_SUBMITTED`, `VOTING_STARTED`, `VOTES_REVEALED`, `GAME_ENDED`, `PLAYER_JOINED`, `WORD_REVEALED`, `PLAYER_TURN_ADVANCED`, `PLAYER_VOTED`, `ALL_PLAYERS_VOTED`, `PLAYER_WORD_SUBMITTED`, `IMPOSTOR_DONE_GUESSING`

Join events: `JOIN_GAME_SUCCESS`, `JOIN_GAME_ERROR`, `REJOIN_SUCCESS`, `REJOIN_ERROR`

**Files to update:** game-client.service.ts, use-lobby.ts

### C. Copy-to-Clipboard Composable (affects 2 files)

Create `/shared/composables/use-clipboard.ts`:

- `copied` ref
- `copyToClipboard(text)` with auto-reset timer

**Files to update:** game-code.vue, game-view.vue

### D. Game Rules Constants

Add to `/shared/utils/constants.ts`:

```typescript
MAX_ROUNDS = 3;
MIN_PLAYERS = 2;
MAX_PLAYERS = 4;
SOCKET_RECONNECTION_DELAY_MAX = 5000;
COPIED_FEEDBACK_DELAY = 2000;
IMPOSTOR_DONE_GUESSING_DELAY = 3000;
```

**Files to update:** game.store.ts, game-view.vue, round-phase.vue, use-game-flow.ts, game-code.vue, socket.ts (~8+ locations)

### E. API Endpoint Cleanup (affects 2 locations)

Replace hardcoded `'http://localhost:3000/games'` with `${API_BASE_URL}/games`

**Files:** create-game-form.vue, use-lobby.ts

### F. Player Name Lookup Helper (affects 3+ locations)

Add utility functions to game composable:

- `getPlayerName(playerId)`
- `getMostVotedPlayer()`
- `getImpostorName()`

**Files:** game-view.vue, reveal-phase.vue

### G. Form Submission Pattern (affects 2 files)

Extract common loading/error handling from create-game-form.vue and join-game-form.vue into composable or wrapper component.

### H. Game Reset Helper

Add to game store:

```typescript
resetForNewGame = () => {
  reset();
  clearGameSession();
};
```

**Files:** create-game-form.vue, join-game-form.vue

## Files Summary

**Move:**

- `/features/shared/*` → `/shared/`

**Create:**

- `/shared/utils/game-status.ts` (enum)
- `/shared/utils/session-storage.ts`
- `/shared/utils/socket-events.ts`
- `/shared/composables/use-clipboard.ts`

**Modify imports in:**

- `/features/game/stores/game.store.ts`
- `/features/game/components/*.vue`
- `/features/admin/components/*.vue`
- `/features/lobby/components/*.vue`
- `/features/scoreboard/components/*.vue`
- `/features/shared/services/game-client.service.ts` (moves to `/shared/services/`)

**Refactor for constants:**

- Replace ~50+ hardcoded values (status strings, timers, magic numbers, URLs)
- Extract duplicated localStorage logic
- Extract duplicated copy-to-clipboard logic
- Add socket event constants for 20+ hardcoded event names

## Verification

1. Verify imports resolve (no console errors)
2. TypeScript type checking passes
