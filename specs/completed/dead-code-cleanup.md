# Dead Code & Inconsistency Cleanup

## Goal
Remove dead code and consolidate inconsistent patterns around state management and socket communication.

## Findings

### Frontend: Unused Store Methods (game.store.ts)
- `clearImpostorGuess()` — exported, never called
- `hasPlayerClickedThisRound()` — exported, never called
- `unblockNextButton()` — exported, never called
- `reset()` — exported, only `resetForNewGame()` is used (calls reset internally)
- `getCurrentPlayerWord()` — exported, never called
- `setCurrentPlayerWord()` — exported, never called

### Frontend: Unused Service Methods (GameClientService)
- `unblockButton()` — exported, never called

### Frontend: Unused Types
- `GameStateDTO` in shared/types/game.ts — defined but never used

### Frontend: Socket Communication Inconsistency
- `startGame()` called via direct `socket.emit()` in game-view.vue (line 1 example)
- Should use `GameClientService.startGame()` instead
- `joinGame()` called via direct `socket.emit()` in use-lobby.ts composable
- Should be wrapped in service

### Frontend: Facade Pattern Incomplete
- `useGameFacade()` only wraps 3 methods: submitDescription, voteImpostor, guessWord
- Game-view.vue calls service methods directly: advanceTurn, approveJoin, rejectJoin, submitPlayerWord, transitionToVoting, rejoinGame, requestJoin
- Either extend facade to wrap all calls OR document why direct service access is acceptable

### Backend: Possible Unused Method
- `unblockButton()` socket handler in game-event.handler.ts — frontend never emits this

## Scope
- In: Remove dead code, consolidate socket.emit calls to use service, decide on facade pattern
- Out: Refactoring game logic, changing game status flow

## Success Criteria
1. All service methods are called or removed
2. All store methods are called or removed
3. All socket.emit calls go through GameClientService (except where intentional)
4. Facade pattern consistently applied or decision documented
5. No unused type exports in game.ts

## Completed
✓ Phase 1 (commit 071ff9f): Removed all dead code
  - GameStateDTO type deleted
  - 6 unused store methods deleted
  - unblockButton service method deleted
  - startGame consolidated to service

## Remaining
- Phase 2: Facade pattern decision
  - Option A: Extend facade to wrap all service calls from game-view
  - Option B: Document hybrid pattern (facade + direct service access)
