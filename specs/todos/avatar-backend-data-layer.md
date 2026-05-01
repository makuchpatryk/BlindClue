# Subtask: Add Avatar Field to Backend Data Layer

**Parent**: add-player-avatars.md

## Changes Required

### 1. Update Player Entity
- **File**: `packages/backend/src/core/domain/entities/player.ts`
- Add `private avatar: string` property
- Update constructor to accept avatar parameter
- Add `getAvatar(): string` getter

### 2. Update GameStateDTO
- **File**: `packages/backend/src/application/dtos/game-state.dto.ts`
- Add `avatar?: string` to PlayerDTO interface
- This allows avatar to flow through API responses

### 3. Update Game Orchestrator
- **File**: `packages/backend/src/application/services/game.orchestrator.ts`
- Update `broadcastGameStarted` to include avatar in player data
- Update `joinGame` to accept and pass avatar

### 4. Update Application Service
- **File**: `packages/backend/src/application/services/game.application-service.ts`
- Update `joinGame` signature to accept avatar parameter
- Pass avatar to Player constructor

### 5. Update Socket Event Handler
- **File**: `packages/backend/src/infra/adapters/websocket/game-event.handler.ts`
- Extract avatar from `requestJoin` socket data
- Pass avatar to `joinGame` method in orchestrator

## Verification
- Compile backend without errors
- Avatar data flows from socket → orchestrator → store → broadcast
