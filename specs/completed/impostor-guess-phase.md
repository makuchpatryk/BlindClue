# Impostor Guessing Phase

## Goal

Implement impostor guessing phase triggered when impostor gets most votes during voting. Impostor guesses word, result shown before final scores.

## Scope

**In:**

- Backend: detect most-voted is impostor → trigger guess phase
- Backend: new `GUESSING` status (or conditional in ENDED)
- Backend: `ImpostorGuessRequestEvent` → only impostor sees guess panel
- Backend: `GuessResultEvent` → broadcast guess + correct/incorrect
- Backend: adjust scoring if guess is correct (+ bonus points)
- Frontend: guess-phase.vue component (input + submit button) for impostor only
- Frontend: waiting screen for other players during guess
- Frontend: result display (integrated into existing result stats)
- Socket handlers for all new events

**Out:**

- Undo voting phase (already working)
- Change vote calculation logic (just add guess as bonus if correct)
- Change result stats screen structure (integrate guess info)

## Approach

### Backend

1. **Game entity** (`game.ts`)
   - Add `impostorGuessPhase` flag to track when guess is needed
   - Modify `voteImpostor()`: after all vote, check `getMostVoted()` === impostorId
   - If yes: set flag + update status to `GUESSING` (or stay ENDED but track phase)
   - Add `isGuessPhaseActive()` method

2. **Use case: GuessWordUseCase**
   - Already exists, modify to:
   - Check game is in GUESSING phase
   - Compare guess to word (case-insensitive)
   - Return boolean: isCorrect

3. **GameOrchestrator** (`game.orchestrator.ts`)
   - In `voteImpostor()`: after VotesRevealed, check if impostor most voted
   - If yes: emit `ImpostorGuessRequestEvent` + set game to GUESSING
   - In `guessWord()`: receive guess
   - Emit `GuessResultEvent` with isCorrect + actual word
   - Emit `GameEndedEvent` with final scores (updated scoring)

4. **CalculateScoresUseCase** (update)
   - Add guess result to scoring:
   - If impostor guesses correct: +2 bonus points

5. **SocketGateway** (`socket.gateway.ts`)
   - Add: `broadcastImpostorGuessRequest(gameId)`
   - Add: `broadcastGuessResult(gameId, guess, isCorrect, word)`

### Frontend

1. **Game store** (`game.store.ts`)
   - Add: `impostorGuess` state (string | null)
   - Add: `guessResult` state (isCorrect: boolean | null)
   - Add: `guessPhaseActive` state (boolean)
   - Actions: `setGuessPhaseActive()`, `setGuessResult()`, `recordImpostorGuess()`

2. **GameClientService** (`game-client.service.ts`)
   - Listen: `ImpostorGuessRequestEvent` → `setGuessPhaseActive(true)`
   - Listen: `GuessResultEvent` → `setGuessResult()`, `recordImpostorGuess()`
   - Listen: `GameEndedEvent` → update final scores

3. **Components**
   - New: `impostor-guess-phase.vue`
     - Input field + submit button (only show for impostor)
     - Emit: `guessWord(guess)` to service
   - Update: `reveal-phase.vue` or similar
     - Show guess result: "Impostor guessed X. Actual word: Y. ✓/✗"
   - Update: `final-scoreboard.vue`
     - Show guess info above scores

## Risks

- **Timing**: impostor gets guess panel at right moment? Need event coordination
- **Phase tracking**: GUESSING state adds complexity. Consider flag in ENDED instead
- **Scores**: need to recalculate after guess result, before final scores

## Success Criteria

1. When impostor has most votes → guess panel appears only for impostor
2. Other players see "Waiting for impostor..." screen
3. Impostor submits guess → result shows (correct/incorrect + actual word)
4. Scores updated with guess bonus if correct
5. Final scores show all data (votes + guess + final scores)
6. No UI lag or race conditions
