# Redesign Game UI for Turn-Based Speaking Game

## Context

Current game UI focuses on description submissions (players typing in app). Users want a simpler, real-world verbal game where players speak out loud and click "Next Person" to advance through turns. After 3 rounds of all players speaking, voting begins to identify the impostor.

## Steps

### Phase 1: Update Game Store
1. Add `currentPlayerIndex` ref to track whose turn (0-based index into players array)
2. Add `playersClickedThisRound` Set<string> to track who has clicked "Next" in current round
3. Add `canShowShowImpostorButton` computed property:
   - Returns true when: `currentRound === 3 AND playersClickedThisRound.size === players.length`

### Phase 2: Simplify game-view.vue RUNNING Phase
1. Remove DescriptionSubmit, DescriptionDisplay, RoundPhase components
2. Create simple display showing:
   - Round number (X/3)
   - Current player name: "It's [Player Name]'s turn"
   - Category (hidden - only show "Category: ???")
   - Single button: "Next Person" (large, prominent)
3. Track clicks: increment currentPlayerIndex, add current player ID to playersClickedThisRound
4. Cycle players: when index reaches end, reset to 0 for next round
5. Round progression: when all players clicked, increment round, clear playersClickedThisRound

### Phase 3: Add "Show Impostor" Button
1. After round 3 is complete and all players clicked "Next Person":
   - Replace "Next Person" button with "Show Impostor" button
   - Display message: "All rounds complete! Ready to vote?"
2. On "Show Impostor" click:
   - Hide category (reveal it after voting)
   - Set status to VOTING (triggers VotingPhase)

### Phase 4: Update Voting Phase UI
1. Keep VotingPhase component as-is (shows player buttons)
2. VotingPhase should say: "Who do you think is the impostor?"

### Phase 5: Improve Results Display (ENDED Phase)
1. Show three sections:
   - **Most Voted**: "Players voted for: [Player Name] with X votes"
   - **Actually Impostor**: "The impostor was: [Player Name]"
   - **Category Revealed**: "Category was: [Category Name]"
   - **Final Scores**: Table with ranking
2. Add "Play Again" button that routes to lobby
3. Optional: Show if voting was correct ("You caught the impostor!" or "Impostor fooled everyone!")

## Files to Modify

- **packages/frontend/src/features/game/stores/game.store.ts**
  - Add: currentPlayerIndex ref (default 0)
  - Add: playersClickedThisRound reactive Set
  - Add: canShowShowImpostorButton computed
  - Add: advancePlayerTurn() method
  - Add: resetRoundClicks() method
  - Update: reset() to include new state

- **packages/frontend/src/features/game/components/game-view.vue**
  - Remove: DescriptionSubmit, DescriptionDisplay, RoundPhase imports
  - Replace RUNNING phase section with simple turn-based UI:
    - Show round (X/3)
    - Show current player name (cycle through players.value[currentPlayerIndex])
    - Show "Category: ???" (no category display during play)
    - "Next Person" button logic:
      - Add current player ID to playersClickedThisRound
      - Call advancePlayerTurn()
      - If all clicked: increment currentRound, resetRoundClicks()
    - Show "Show Impostor" button only when canShowShowImpostorButton is true
  - Improve ENDED phase section:
    - Show "Most Voted: [name] with X votes"
    - Show "Actual Impostor: [name]"
    - Show "Category: [category]" (now visible)
    - Show final scores
    - Add "Play Again" button

- **packages/frontend/src/features/game/components/voting-phase.vue**
  - Update header: "Who is the impostor?" (optional style improvement)
  - Keep button logic as-is

- **packages/frontend/src/features/game/composables/use-game-state.ts**
  - Export: currentPlayerIndex, playersClickedThisRound, canShowShowImpostorButton
  - Export: advancePlayerTurn, resetRoundClicks methods

## Verification

1. **LOBBY Phase**: Start game with 2-4 players ✓
2. **RUNNING Round 1**:
   - Display shows "Round 1/3", player name, "Category: ???", "Next Person" button
   - Click "Next Person" → player name changes
   - Cycles through all players
   - After all click once → "Show Impostor" button appears
3. **RUNNING Rounds 2-3**: Repeat above for each round
4. **VOTING Phase**:
   - All players see voting buttons with player names
   - Can select any player
   - Cannot change vote
5. **ENDED Phase**:
   - Shows "Most Voted: [name]"
   - Shows "Actually Impostor: [name]"
   - Shows "Category: [category]" revealed
   - Shows final scores
   - "Play Again" takes you back to lobby
