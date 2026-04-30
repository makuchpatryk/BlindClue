-m "# Lobby & Player List Fixes

## Context
6 bugs in lobby/game flow: duplicate headings, complex game IDs, player list not syncing across browsers, name modal in wrong place, missing waiting state, no player display tags.

Root cause of player list bug: `socket.join(gameId)` is called AFTER `broadcastPlayerJoined` in both host join and approveJoin handlers — so joiners miss their own and prior `PlayerJoined` events.

---

## Fix 1 — Duplicate headings
`lobby-waiting-room.vue` already has `<h2>Create Game</h2>` and `<h2>Join Game</h2>` as card headers. The child forms repeat them.

**Remove** `<h2>` headings from:
- `packages/frontend/src/features/lobby/components/create-game-form.vue`
- `packages/frontend/src/features/lobby/components/join-game-form.vue`

---

## Fix 2 — Game ID: 6-char uppercase code (e.g. AB3C7F)

**File**: `packages/backend/src/core/domain/use-cases/create-game.use-case.ts`

Replace inline ID generation:
```ts
// before
`game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
// after
Array.from({ length: 6 }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]).join('')
```

Also update `packages/backend/src/application/utils/id-generator.ts` `gameId()` to match.

---

## Fix 3 & 5 — Player list not syncing

**Root cause**: In `game-event.handler.ts`, `joinGame()` triggers `broadcastPlayerJoined` internally (via orchestrator, line 44) BEFORE `socket.join(gameId)` — so the joiner misses their own event and all prior players' events.

**File**: `packages/backend/src/infra/adapters/websocket/game-event.handler.ts`

Changes:
1. Move `socket.join(data.gameId)` to BEFORE `joinGame()` call (host join, line 37)
2. Move `pendingRequest.socket.join(data.gameId)` to BEFORE `joinGame()` call (approveJoin, line 61)
3. After both join calls, include full player list in `joinGameSuccess`:
   ```ts
   const game = this.gameManager.getGame(data.gameId);
   const players = game?.getPlayers().map(p => ({ id: p.getId().value, name: p.getName(), score: p.getScore() })) ?? [];
   socket.emit('joinGameSuccess', { playerId: result.value, players });
   ```

**File**: `packages/frontend/src/features/game/stores/game.store.ts`

Add `setPlayers` action:
```ts
const setPlayers = (list: PlayerDTO[]) => { players.value = list; };
```
Export it.

**File**: `packages/frontend/src/features/shared/services/game-client.service.ts`

Update `joinGameSuccess` handler:
```ts
this.socket.on('joinGameSuccess', (data) => {
  gameStore.setMyPlayer(data.playerId, '');
  gameStore.setPlayers(data.players);
  gameStore.setJoinStatus('approved');
});
```

---

## Fix 4 — Name input: top of lobby page

**File**: `packages/frontend/src/features/lobby/components/lobby-waiting-room.vue`

Add name input above the grid:
```html
<input v-model="playerName" placeholder="Your name" ... />
```
On change, call `lobbyStore.setPlayerName(playerName)`.

**File**: `packages/frontend/src/features/lobby/components/create-game-form.vue`

Before creating game, validate `lobbyStore.playerName` is not empty. Show error if empty.

**File**: `packages/frontend/src/features/lobby/components/join-game-form.vue`

Same — validate name before navigating.

**File**: `packages/frontend/src/features/game/components/game-view.vue`

- Remove name entry modal (lines 3–21)
- Change waiting modal condition: `v-if="joinStatus === 'pending'"` (remove `myPlayerId &&`)
- In `onMounted`: read name from `lobbyStore.playerName`, immediately call `requestJoin(gameId, name)` and `gameStore.setJoinStatus('pending')`
- Remove `playerNameInput` ref and `submitName()` function

---

## Fix 6 — Player display tag [XXXX] before name

**File**: `packages/frontend/src/features/game/components/game-view.vue`

Change player list item (line 61):
```html
<!-- before -->
{{ player.name }}
<!-- after -->
[{{ player.id.slice(0, 4).toUpperCase() }}] {{ player.name }}
```

---

## Files to Modify
| File | Change |
|---|---|
| `backend/src/core/domain/use-cases/create-game.use-case.ts` | New game ID format |
| `backend/src/application/utils/id-generator.ts` | Match new format |
| `backend/src/infra/adapters/websocket/game-event.handler.ts` | Fix socket.join timing, add players to joinGameSuccess |
| `frontend/src/features/lobby/components/lobby-waiting-room.vue` | Add name input at top |
| `frontend/src/features/lobby/components/create-game-form.vue` | Remove duplicate heading, validate name |
| `frontend/src/features/lobby/components/join-game-form.vue` | Remove duplicate heading, validate name |
| `frontend/src/features/game/components/game-view.vue` | Remove name modal, auto-join on mount, player tags |
| `frontend/src/features/game/stores/game.store.ts` | Add setPlayers action |
| `frontend/src/features/shared/services/game-client.service.ts` | Handle players in joinGameSuccess |

---

## Verification
1. Start backend + frontend
2. Browser A: enter name → Create Game → lands in game lobby, sees `[XXXX] Name`
3. Browser B: enter name → Join Game (6-char code) → "Waiting for approval" shows
4. Browser A: sees join request, approves
5. Both browsers now show 2 players with tags
6. Neither browser shows name-entry modal after lobby
