# Subtask: Update State Management for Avatars

**Parent**: add-player-avatars.md

## Update Frontend PlayerDTO Type

- **File**: `packages/frontend/src/shared/types/game.ts`
- Add `avatar: string` field to PlayerDTO interface

## Update Game Store

- **File**: `packages/frontend/src/features/game/stores/game.store.ts`
- Update `setGameStarted()` to handle avatar in player data
- Update `setPlayers()` to preserve avatar field
- Update `addPlayer()` to include avatar
- Update `setMyPlayer()` to accept and store avatar
- Ensure avatar is included in all player-related state updates

## Update Socket Event Listeners

- **File**: `packages/frontend/src/features/game/services/game-client.service.ts`
- Handle avatar in `GAME_STARTED` listener (check actual event names in socket-events.js)
- Handle avatar in `REJOIN_SUCCESS` listener (if exists)
- Handle avatar in `JOIN_GAME_SUCCESS` listener (if exists)
- Handle avatar in `PLAYER_JOINED` listener (if exists)
- Verify event names against actual SOCKET_EVENTS constants

## Verification

- Game store properly tracks avatar for all players
- Avatar persists through game state updates
- Avatar data flows from socket events to store
- No console errors related to missing avatar field
