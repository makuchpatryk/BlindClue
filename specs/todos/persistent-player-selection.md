# Persistent Player Selection During Game

## Context

Currently, players can only select/vote on who they think is the impostor during the VOTING phase. The request is to allow players to **select a player at any time during any game phase** (starting from when the game begins) and **persist that selection** until they change it. This gives players more agency and lets them refine their guess as the game progresses.

## Requirements

1. **Selection throughout game**: Player list visible and selectable in all phases (RUNNING, VOTING, ENDED)
2. **Persistent selection**: Selected player persists as user navigates between phases until they pick someone else
3. **Validation before voting**: When voting, validate that a player is selected (simple check)
4. **Visual feedback**: Show which player is currently selected/highlighted
5. **Vote submission**: Use the selected player when "Show Impostor" or vote button is clicked in VOTING phase

## Steps

1. **Add selection state to game.store.ts**
   - Add `selectedImpostorGuess`: Ref<string | null> - tracks the currently selected player ID
   - Add action `selectImpostorGuess(playerId: string)` - updates selection
   - Add action `clearImpostorGuess()` - clears selection (optional, for restart)

2. **Create a reusable PlayerSelectionList component**
   - Display list of all players from `game.players`
   - Each player button shows: player name, score
   - Highlight/style the `selectedImpostorGuess` player differently
   - On click, call `selectImpostorGuess(playerId)`
   - Style: use a card/button list, highlight selected player with color/border

3. **Integrate PlayerSelectionList into game phases**
   - **game-view.vue**: Show PlayerSelectionList in RUNNING phase (description display)
   - **voting-phase.vue**: Replace current vote buttons with PlayerSelectionList
   - **reveal-phase.vue**: Show selection status before vote results appear
   - Keep existing vote/reveal logic, just change UI source

4. **Update voting-phase.vue to use selection**
   - Add validation: ensure `selectedImpostorGuess` is not null before allowing vote
   - On "Show Impostor" click, call `voteImpostor(selectedImpostorGuess)`
   - Disable vote button if no player selected (show tooltip: "Select a player first")

5. **Optional: Reset selection on new game**
   - In game.store.ts, add reset logic to `clearImpostorGuess()` when game restarts

## Files to Modify

- **packages/frontend/src/features/game/stores/game.store.ts**
  - Add `selectedImpostorGuess` state
  - Add `selectImpostorGuess()` and `clearImpostorGuess()` actions

- **packages/frontend/src/features/game/components/** (new file)
  - Create `PlayerSelectionList.vue` component
  - Props: selected player ID, disabled state (optional)
  - Emits: selection change

- **packages/frontend/src/features/game/components/game-view.vue**
  - Import and render PlayerSelectionList in RUNNING phase

- **packages/frontend/src/features/game/components/voting-phase.vue**
  - Replace button list with PlayerSelectionList
  - Add validation on vote submission
  - Disable vote button if selection is null

- **packages/frontend/src/features/game/components/reveal-phase.vue**
  - Show what player was selected (optional, for context)

## Verification

1. Start a game and verify PlayerSelectionList appears in RUNNING phase (description round)
2. Click different players and verify selection persists when navigating phases
3. In VOTING phase, verify vote button is disabled until a player is selected
4. Click a player, then click "Show Impostor" - verify vote is cast for that player
5. Verify vote counts and reveal phase works as before
