# Plan: Show Word to Non-Impostor Players

## Context

Currently, non-impostor players see "You know the word" but don't see the actual word. They need to see it during RUNNING phase (and also in ENDED phase per user request).

## Changes

### Backend

**`packages/backend/src/core/domain/entities/game.ts`**
- Add `private word: string = ''`
- Add `setWord(wordText: string): void` and `getWord(): string`

**`packages/backend/src/application/services/game.orchestrator.ts`**
- In `startGame`: after resolving word + category, call `game.setWord(wordResult.value.getText())` to store word

**`packages/backend/src/infra/adapters/websocket/game-event.handler.ts`**
- In `startGame` handler, after orchestrator completes:
  - Get game and impostorId
  - Emit `wordRevealed` event to all sockets in room EXCEPT the impostor socket
  - Pass word text in event

**`packages/backend/src/infra/adapters/websocket/socket.gateway.ts`**
- Add method: `broadcastWordRevealed(gameId: string, impostorId: string, word: string): void`
  - Emits to room, but excludes impostor socket using `except()`

### Frontend

**`packages/frontend/src/features/game/stores/game.store.ts`**
- Add `word: ref<string>('')`
- Add `setWord(wordText: string): void`
- Export `word` and `setWord`

**`packages/frontend/src/features/shared/services/game-client.service.ts`**
- Add `wordRevealed` listener: `gameStore.setWord(data.word)`
- Handle rejoinSuccess: if non-impostor and game in RUNNING, set word from server state

**`packages/frontend/src/features/game/components/game-view.vue`**
- In RUNNING block: show word for non-impostors
  ```html
  <div v-if="isImpostor" class="text-lg text-red-600">You are the Impostor</div>
  <div v-else class="text-lg text-blue-600">
    Word: <span class="font-bold">{{ word }}</span>
  </div>
  ```

## Files to Modify

| File | Change |
|---|---|
| `backend/src/core/domain/entities/game.ts` | Add word field, getter, setter |
| `backend/src/application/services/game.orchestrator.ts` | Store word in game on startGame |
| `backend/src/infra/adapters/websocket/game-event.handler.ts` | Emit wordRevealed to non-impostors only |
| `backend/src/infra/adapters/websocket/socket.gateway.ts` | Add broadcastWordRevealed method |
| `frontend/src/features/game/stores/game.store.ts` | Add word state and setter |
| `frontend/src/features/shared/services/game-client.service.ts` | Handle wordRevealed event |
| `frontend/src/features/game/components/game-view.vue` | Display word for non-impostor in RUNNING state |

## Verification

1. Create game in Browser A, join in Browser B
2. Browser A approves Browser B
3. Browser A: sees "You are the Impostor" (if selected)
4. Browser B: sees "Word: ACTUAL_WORD" (if not impostor)
5. Refresh Browser B mid-game: word still visible after reconnect
