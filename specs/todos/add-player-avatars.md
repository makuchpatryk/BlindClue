# Add Player Avatar Selection Feature

## Context
Players need avatar selection during lobby (before game starts). 8 humanoid animal avatars generated via DiceBear API. Display avatars next to player names in: player lists, turn indicators, voting phase, final scores.

## Implementation Plan

### Phase 1: Data Layer

#### 1.1 Update PlayerDTO to include avatar
- **File**: `packages/frontend/src/shared/types/game.ts`
- Add `avatar: string` field to PlayerDTO
- Avatar will be avatar ID (e.g., "avatar-001")

#### 1.2 Update backend Player entity to store avatar
- **File**: `packages/backend/src/core/domain/entities/player.ts`
- Add `avatar: string` property
- Add getter/setter for avatar
- Update constructor to accept avatar

#### 1.3 Update backend GameStateDTO
- **File**: `packages/backend/src/application/dtos/game-state.dto.ts`
- Add `avatar?: string` to PlayerDTO in DTO

### Phase 2: Frontend UI Components

#### 2.1 Create avatar selection component
- **New file**: `packages/frontend/src/shared/components/avatar-selector.vue`
- Display 8 avatar options (use DiceBear API URLs)
- Show grid of selectable avatars
- Return selected avatar ID on choice
- Props: `selectedAvatar`, `@select`

#### 2.2 Create avatar display component
- **New file**: `packages/frontend/src/shared/components/avatar-badge.vue`
- Render single avatar image or fallback
- Small circular display (20-24px)
- Props: `avatar`, `size` (small/medium/large)

#### 2.3 Integrate avatar selector into join form
- **File**: `packages/frontend/src/features/lobby/components/join-game-form.vue`
- Add avatar selector below/near player name input
- Store selected avatar in form state
- Pass avatar to `requestJoin` socket event

#### 2.4 Integrate avatar selector into create form
- **File**: `packages/frontend/src/features/lobby/components/create-game-form.vue`
- Same as join form - avatar selector with form state

### Phase 3: State Management

#### 3.1 Update Lobby Store
- **File**: `packages/frontend/src/features/lobby/stores/lobby.store.ts`
- Add `playerAvatar` ref (string)
- Add `setPlayerAvatar(avatar)` method
- Add getter for playerAvatar

#### 3.2 Update Game Store
- **File**: `packages/frontend/src/features/game/stores/game.store.ts`
- Update `players` to include avatar in PlayerDTO
- Update `setMyPlayer` to accept avatar
- Update `setPlayers` to handle avatar field

### Phase 4: Data Flow & Socket Events

#### 4.1 Update socket event handlers
- **File**: `packages/frontend/src/shared/services/game-client.service.ts`
- Pass avatar in `requestJoin` event
- Handle avatar in `JOIN_GAME_SUCCESS` listener
- Update `REJOIN_SUCCESS` to handle avatar

#### 4.2 Update backend socket handlers
- **File**: `packages/backend/src/infra/adapters/websocket/game-event.handler.ts`
- Extract avatar from `requestJoin` data
- Store avatar when joining game
- Include avatar in join responses

#### 4.3 Update orchestrator
- **File**: `packages/backend/src/application/services/game.orchestrator.ts`
- Pass avatar to `joinGame` method
- Ensure avatar flows through to game state

#### 4.4 Update application service
- **File**: `packages/backend/src/application/services/game.application-service.ts`
- Accept avatar in `joinGame` method
- Pass to player creation

### Phase 5: Display Avatar Everywhere

#### 5.1 Update player list in lobby
- **File**: `packages/frontend/src/features/game/views/game-view.vue` (lines 72-76)
- Add avatar-badge before player name
- Keep existing player ID and name display

#### 5.2 Update round phase display
- **File**: `packages/frontend/src/features/game/components/round-phase.vue`
- Add avatar display for players in round list
- Position avatar next to player name

#### 5.3 Update player selection list (voting)
- **File**: `packages/frontend/src/features/game/components/player-selection-list.vue`
- Add avatar badge to each player button
- Update styling to accommodate avatar

#### 5.4 Update turn indicator
- **File**: `packages/frontend/src/features/game/views/game-view.vue` (line 104)
- Add avatar of current player next to "It's X's turn"

#### 5.5 Update vote results display
- **File**: `packages/frontend/src/features/game/views/game-view.vue` (lines 254-270)
- Add avatar-badge next to each player name in results

#### 5.6 Update final scoreboard
- **File**: `packages/frontend/src/features/scoreboard/components/player-card.vue`
- Add larger avatar display (medium size)
- Position at top of card

#### 5.7 Update descriptions display
- **File**: `packages/frontend/src/features/game/components/description-display.vue`
- Add avatar-badge next to player name

## Files to Modify

### Backend
- `packages/backend/src/core/domain/entities/player.ts` - add avatar property
- `packages/backend/src/application/dtos/game-state.dto.ts` - add avatar to DTO
- `packages/backend/src/application/services/game.application-service.ts` - accept avatar in joinGame
- `packages/backend/src/application/services/game.orchestrator.ts` - pass avatar to joinGame
- `packages/backend/src/infra/adapters/websocket/game-event.handler.ts` - extract & store avatar

### Frontend - New Components
- `packages/frontend/src/shared/components/avatar-selector.vue` (new)
- `packages/frontend/src/shared/components/avatar-badge.vue` (new)

### Frontend - Updated Components
- `packages/frontend/src/features/lobby/components/join-game-form.vue`
- `packages/frontend/src/features/lobby/components/create-game-form.vue`
- `packages/frontend/src/features/game/views/game-view.vue` (multiple sections)
- `packages/frontend/src/features/game/components/round-phase.vue`
- `packages/frontend/src/features/game/components/player-selection-list.vue`
- `packages/frontend/src/features/game/components/description-display.vue`
- `packages/frontend/src/features/scoreboard/components/player-card.vue`

### Frontend - State & Services
- `packages/frontend/src/features/lobby/stores/lobby.store.ts`
- `packages/frontend/src/features/game/stores/game.store.ts`
- `packages/frontend/src/shared/services/game-client.service.ts`

## Avatar Configuration

**8 Avatar Options** (using DiceBear API style names):
1. avatar-001 (adventurer)
2. avatar-002 (avataaars)
3. avatar-003 (big-ears)
4. avatar-004 (big-smile)
5. avatar-005 (croodles)
6. avatar-006 (fun-emoji)
7. avatar-007 (pixel-art)
8. avatar-008 (personas)

**DiceBear URL Format:**
```
https://api.dicebear.com/9.x/{style}/svg?seed={avatarId}
```

## Verification

1. **Lobby Phase**
   - Start game, see avatar selector
   - Choose avatar, confirm it saves
   - Both create & join forms show selector

2. **Game Phase**
   - Player list shows avatars + names
   - Turn indicator displays current player avatar
   - Descriptions display player avatars

3. **Voting Phase**
   - Player selection list shows avatars
   - Vote results show player avatars

4. **Final Screen**
   - Scoreboard shows player avatars
   - All player names display with correct avatar
