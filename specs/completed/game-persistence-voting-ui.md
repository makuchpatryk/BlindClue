# Plan: Game Persistence + Voting/Category UI

## Context

Two features:

1. **Reconnect / 2-min game persistence** — games are stored in-memory with zero TTL and no reconnection support. On disconnect only a `console.log` runs. A page refresh means the player can never reclaim their slot because player IDs are generated fresh every join.

2. **Category display + Impostor voting cards** — `GameStarted` is broadcast with `category: undefined` (bug in orchestrator: `broadcastGameStarted(gameId)` only passes 1 of 4 required args). `store.isImpostor` is never computed. `voting-phase.vue` and `reveal-phase.vue` already exist and are fully built but never imported into `game-view.vue`.

---

## Feature 1: Reconnect / 2-min Persistence

### Backend

**`packages/backend/src/core/domain/entities/game.ts`**

- Add `private categoryName: string = ''`
- Add `setCategoryName(name: string): void` and `getCategoryName(): string`

**`packages/backend/src/application/services/game.orchestrator.ts`**

- Add `IWordRepository` and `ICategoryRepository` to constructor
- Update `SocketGateway` interface: `broadcastGameStarted(gameId, category, impostorId, players): void`
- Update `startGame`: after success, look up word (`wordRepository.findById(game.getWordId())`) → get `categoryId` → look up category name (`categoryRepository.findById(categoryId)`) → call `game.setCategoryName(name)` → then broadcast with full data

**`packages/backend/src/infra/adapters/websocket/game-event.handler.ts`**

- Add maps: `socketToPlayer: Map<string, {gameId, playerId}>`, `disconnectTimers: Map<string, NodeJS.Timeout>`, `hostPlayers: Map<string, string>` (gameId → playerId, to rehydrate `hostSockets` on reconnect)
- After successful host join: set `socketToPlayer`, set `hostPlayers.set(gameId, playerId)`
- After successful approveJoin: set `socketToPlayer`
- Update `disconnect` handler: cancel old timer if any, start 2-min `setTimeout`. When timer fires: check if any socket in `socketToPlayer` still maps to that game; if not, `gameManager.deleteGame(gameId)`
- Add `rejoinGame` handler:
  - Verify game and player exist
  - Cancel disconnect timer for `${gameId}:${playerId}`
  - `socket.join(gameId)`, update `socketToPlayer`
  - If player is the host (`hostPlayers.get(gameId) === playerId`), update `hostSockets.set(gameId, socket.id)`
  - Emit `rejoinSuccess` with `{ playerId, players, status, category: game.getCategoryName(), impostorId: game.getImpostorId() }`
  - On failure: emit `rejoinError`

**`packages/backend/src/main.ts`**

- Pass `wordRepository` and `categoryRepository` to `GameOrchestrator` constructor

### Frontend

**`packages/frontend/src/features/shared/services/game-client.service.ts`**

- Add `rejoinGame(gameId, playerId)` emit method
- Add `rejoinSuccess` socket listener: call `gameStore.setMyPlayer`, `gameStore.setPlayers`, set `joinStatus('approved')`, save session to localStorage
- Add `rejoinError` listener: clear `localStorage` game_session key

**`packages/frontend/src/features/game/components/game-view.vue`**

- In setup (sync, before onMounted): get socket + service, `provide('gameClientService', gameClientService)`
- In `onMounted`: check `localStorage.getItem('game_session')` → if parsed `gameId` matches route param, call `gameClientService.rejoinGame(gameId, savedPlayerId)` instead of `requestJoin`; otherwise proceed with normal join
- Watch `joinStatus === 'approved'` → write `{ gameId, playerId: myPlayerId }` to localStorage
- On component unmount or route leave: keep localStorage (intentional — needed for refresh)

---

## Feature 2: Category + Voting Cards

### Backend

Same as Feature 1 — the `startGame` orchestrator fix makes `GameStarted` broadcast correctly with `category`, `impostorId`, and `players`.

### Frontend

**`packages/frontend/src/features/game/stores/game.store.ts`**

- In `setGameStarted`: add `isImpostor.value = data.impostorId === myPlayerId.value`

**`packages/frontend/src/features/game/composables/use-game-state.ts`**

- `voteImpostor`: replace `gameStore.players[0]?.id` with `gameStore.myPlayerId`
- `submitDescription`: same fix

**`packages/frontend/src/features/game/components/game-view.vue`**

- Import `VotingPhase` and `RevealPhase`
- Replace inline VOTING block:
  ```html
  <div v-else-if="status === 'VOTING'">
    <VotingPhase v-if="!votes" />
    <RevealPhase v-else />
  </div>
  ```

---

## Files to Modify

| File                                                           | Change                                                                    |
| -------------------------------------------------------------- | ------------------------------------------------------------------------- |
| `backend/src/core/domain/entities/game.ts`                     | Add `categoryName` field, getter, setter                                  |
| `backend/src/application/services/game.orchestrator.ts`        | Fix `startGame` broadcast, add repos to constructor                       |
| `backend/src/infra/adapters/websocket/game-event.handler.ts`   | socketToPlayer tracking, disconnect timers, rejoinGame handler            |
| `backend/src/main.ts`                                          | Pass extra repos to GameOrchestrator                                      |
| `frontend/src/features/shared/services/game-client.service.ts` | rejoinGame method, rejoinSuccess/Error handlers, localStorage             |
| `frontend/src/features/game/components/game-view.vue`          | provide service, localStorage check on mount, use VotingPhase+RevealPhase |
| `frontend/src/features/game/stores/game.store.ts`              | Set isImpostor in setGameStarted                                          |
| `frontend/src/features/game/composables/use-game-state.ts`     | Use myPlayerId for vote/description                                       |

---

## Verification

1. Open two browsers. Browser A: enter name → Create Game → lands in lobby
2. Browser B: enter name → Join (6-char code) → approval flow → both see 2 players
3. **Category test**: Browser A clicks Start → both browsers show correct category in RUNNING state; Browser A sees "You know the word", Browser B sees "You are the Impostor" (or vice versa)
4. **Voting test**: After round submissions → VOTING phase shows player cards → click a player to vote → after all vote, reveal phase shows results
5. **Reconnect test**: Refresh Browser B mid-game → page reloads → auto-reconnects within ~1s → still in game, correct state restored
6. **2-min TTL test**: Close both browsers → wait >2 min → open again → game code no longer works
