# Avatar Feature Implementation Guide

**Status**: Ready to implement (tasks updated for current codebase)

## File Paths (Verified)

### Backend
```
packages/backend/src/
  ├── core/domain/entities/
  │   └── player.ts                          ← Add avatar field
  ├── application/
  │   ├── dtos/game-state.dto.ts             ← Add avatar to PlayerDTO
  │   └── services/
  │       ├── game.application-service.ts    ← Update joinGame signature
  │       └── game.orchestrator.ts           ← Pass avatar through
  └── infra/adapters/websocket/
      └── game-event.handler.ts              ← Extract avatar from socket
```

### Frontend
```
packages/frontend/src/
  ├── shared/
  │   ├── components/
  │   │   ├── avatar-selector.vue            ← NEW: 8-avatar grid selector
  │   │   └── avatar-badge.vue               ← NEW: circular avatar display
  │   ├── types/
  │   │   └── game.ts                        ← Add avatar?: string to PlayerDTO
  │   └── utils/
  │       ├── socket-events.ts               ← Verify event names (no changes needed)
  │       └── avatar-config.ts               ← NEW: DiceBear URL generation
  ├── features/
  │   ├── lobby/
  │   │   ├── components/
  │   │   │   ├── join-game-form.vue         ← Integrate avatar-selector
  │   │   │   └── create-game-form.vue       ← Integrate avatar-selector
  │   │   └── stores/
  │   │       └── lobby.store.ts             ← Add playerAvatar ref
  │   ├── game/
  │   │   ├── services/
  │   │   │   └── game-client.service.ts     ← Pass avatar to join events
  │   │   ├── stores/
  │   │   │   └── game.store.ts              ← Handle avatar in players array
  │   │   ├── views/
  │   │   │   └── game-view.vue              ← Add avatars to displays
  │   │   └── components/
  │   │       ├── round-phase.vue            ← Add avatar badges
  │   │       ├── player-selection-list.vue  ← Add avatar badges (voting)
  │   │       └── description-display.vue    ← Add avatar badge
  │   └── scoreboard/
  │       └── components/
  │           └── player-card.vue            ← Large avatar display
```

## Socket Events (Verified)

**Location**: `packages/frontend/src/shared/utils/socket-events.ts`

Existing events to use:
```typescript
SOCKET_EVENTS = {
  PLAYER_JOINED: "PlayerJoined",          // Broadcast when player joins
  JOIN_GAME_SUCCESS: "joinGameSuccess",    // Server response to join
  GAME_STARTED: "GameStarted",             // Game starts (includes players)
  GAME_RESTARTED: "GameRestarted",         // Game restarts (includes players)
  REJOIN_SUCCESS: "rejoinSuccess",         // Rejoin response (includes players)
}
```

**Client Emits** (update these to include avatar):
```typescript
socket.emit("requestJoin", {
  gameId: string,
  playerName: string,
  avatar: string  // ← ADD THIS
});

socket.emit("rejoinGame", {
  gameId: string,
  playerId: string,
  avatar: string  // ← ADD THIS (if rejoin allows avatar change)
});
```

**Backend Handler** (`packages/backend/src/infra/adapters/websocket/game-event.handler.ts`):
- Extract `data.avatar` from "requestJoin" event
- Extract `data.avatar` from "rejoinGame" event (if applicable)
- Pass avatar to orchestrator/application service

## DiceBear Avatar URLs

Format: `https://api.dicebear.com/9.x/{style}/svg?seed={avatarId}`

Styles (pick one or rotate):
- adventurer
- avataaars
- big-ears
- big-smile
- croodles
- fun-emoji
- pixel-art
- personas

Example: `https://api.dicebear.com/9.x/avataaars/svg?seed=avatar-001`

## Implementation Order (Phases)

**Phase 1: Backend Data Layer** (1-2 hours)
1. Add avatar field to Player entity
2. Update PlayerDTO in game-state.dto.ts
3. Update GameApplicationService.joinGame() signature
4. Update GameOrchestrator to pass avatar
5. Update socket handler to extract avatar

**Phase 2: Frontend Types & Stores** (1 hour)
1. Add avatar to PlayerDTO interface
2. Update game.store.ts to handle avatar
3. Add playerAvatar to lobby.store.ts

**Phase 3: UI Components** (1.5-2 hours)
1. Create avatar-selector.vue component
2. Create avatar-badge.vue component
3. Create avatar-config.ts utility

**Phase 4: Form Integration** (1-1.5 hours)
1. Update join-game-form.vue
2. Update create-game-form.vue
3. Update game-client.service.ts to pass avatar

**Phase 5: Display Avatars Everywhere** (2-3 hours)
1. Update game-view.vue (player list, turn indicator, vote results)
2. Update round-phase.vue
3. Update player-selection-list.vue
4. Update description-display.vue
5. Update player-card.vue (scoreboard)

## Testing Checklist

- [ ] Player can select avatar in lobby (join & create)
- [ ] Selected avatar displays next to player name in player list
- [ ] Avatar persists through game start
- [ ] Avatars display in all game phases (running, voting, ended)
- [ ] Scoreboard shows avatars correctly
- [ ] No console errors for missing avatar data
- [ ] Images load from DiceBear API without CORS issues

## Notes

- Avatar is optional field (avatar?: string) for backward compatibility
- Default avatar if not provided: avatar-001
- Avatar selection happens pre-game (in lobby only)
- No avatar changes once game starts
