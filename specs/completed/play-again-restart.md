# Play Again Without Disconnect

## Goal

Allow all players to restart same game without losing connection or needing to rejoin.

## Scope

- In: Add backend restart endpoint, emit socket event to all players, reset game state (new impostor, round 0), keep players in game
- Out: Don't navigate away, don't create new game, don't change player roster

## Approach

1. Backend: Add `restartGame(gameId)` method — reset state, pick new impostor, emit broadcast
2. Frontend: Change `playAgain()` to call `gameClientService.restartGame(gameId)` instead of router.push
3. Listen for restart event, update store state

## Risks

- Impostor selection randomization
- All players need to receive broadcast simultaneously

## Success Criteria

- All connected players see game restart
- New impostor chosen
- No disconnect, no redirect
- Players stay in game
