# Add Player Word Submissions Per Round

## Context

During game RUNNING phase, each player should submit a word when it's their turn. Input blocks "Next Person" button until word entered. Word list at bottom shows all players + their accumulated words (across all rounds). All players see list in real-time.

## Steps

### Frontend Store

1. Add state to `game.store.ts`:
   - `playerWords`: Map<playerId, string[]> (each player's words across rounds)
   - `currentPlayerWord`: ref for current turn input
2. Add actions:
   - `submitPlayerWord(playerId, word, round)` - stores word, broadcasts to backend
   - `updatePlayerWords(playerWords)` - receives updates from WebSocket

### Frontend UI (game-view.vue)

1. During RUNNING phase, after category display (around line 80):
   - Add input field for current player to type word
   - Auto-focus when turn starts
   - Empty field at start of each turn
2. "Next Person" button (line 82):
   - Block if current player hasn't typed word
   - On click, submit word and advance
3. Add word list at bottom (new section after button):
   - Show "Player Name: word1, word2, word3..."
   - Get data from `gameStore.playerWords`
   - Update in real-time as submissions come in

### Backend Game Entity (game.ts)

1. Add to Game class:
   - `playerWords`: Map<playerId, string[]> (words per player)
2. Add method:
   - `submitPlayerWord(playerId, round, word): Result`

### Backend Orchestrator (game.orchestrator.ts)

1. Handle `submitPlayerWord` event
2. Call game entity method
3. Broadcast `PlayerWordSubmitted` event with updated word data

### Backend WebSocket Handler (game-event.handler.ts)

1. Listen for `submitPlayerWord` event from frontend
2. Route to orchestrator

### Frontend Game Client Service (game-client.service.ts)

1. Listen for `PlayerWordSubmitted` event
2. Update store via `updatePlayerWords()`

## Files to Modify

- `packages/frontend/src/features/game/stores/game.store.ts` - add word state and actions
- `packages/frontend/src/features/game/components/game-view.vue` - input field, word list, block button logic
- `packages/backend/src/core/domain/entities/game.ts` - word storage method
- `packages/backend/src/application/services/game.orchestrator.ts` - handle word submission, broadcast
- `packages/backend/src/infra/adapters/websocket/game-event.handler.ts` - route word submission events
- `packages/frontend/src/features/shared/services/game-client.service.ts` - listen for word submissions

## Verification

1. Start game, verify current player's input field appears
2. "Next Person" button blocked until text entered
3. Type word, click Next → word appears in list
4. Other player's turn → their input field appears, list shows previous player's word
5. New round starts → words accumulate in list
6. Open second browser window (different player) → see real-time updates to word list
