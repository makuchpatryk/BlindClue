## Context
Implement a turn-based blocking mechanic for the "Next Person" button during the game running phase. When a player clicks the button, it becomes blocked—only the next player in turn order can unblock it by clicking it themselves. This creates an acknowledgment flow where each player confirms they're ready before proceeding.

## Steps
1. Add state to game store to track button block status:
   - `nextButtonBlockedBy`: player ID who blocked it (null if not blocked)
   
2. Modify `advancePlayerTurn()` to block the button instead of auto-advancing:
   - Mark button as blocked by current player
   - Do not increment `currentPlayerIndex` yet
   
3. Add new action `unblockNextButton()` in game store:
   - Check if current player is next in turn order
   - If yes: unblock button and advance to next player
   - If no: do nothing (button stays blocked)
   
4. Update game-view.vue button state:
   - Disable button if it's blocked AND current player is not the unlocker
   - Show "Waiting..." when blocked and waiting for next player
   - Show "Ready" or "Confirm" when next player can unblock
   
5. Update button click handler:
   - If button is blocked AND current player can unblock → call `unblockNextButton()`
   - If button is not blocked → call `advancePlayerTurn()` (block for next player)

## Files to Modify
- `packages/frontend/src/features/game/stores/game.store.ts` — add block state, `unblockNextButton()` action
- `packages/frontend/src/features/game/components/game-view.vue` — update button disabled logic and handler

## Verification
1. Run dev server, start a game with 2+ players
2. Player 1 clicks "Next Person" → button becomes disabled, shows "Waiting for next player"
3. Player 2 sees button enabled with different label ("Unblock Next")
4. Player 2 clicks button → button unblocks, advances to Player 3
5. Repeat for all players across all rounds
6. Verify button re-enables for next player after blocking
