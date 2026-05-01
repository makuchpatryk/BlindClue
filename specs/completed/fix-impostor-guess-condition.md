# Fix: Impostor Guess Only After Plurality Vote

## Goal

Impostor can only guess the word if they received the most player votes.

## Current State

Impostor can guess after ANY votes submitted (line 188: `if (this.votes.size === 0)`).

## Desired State

Impostor can guess ONLY if they got the most votes (plurality).

## Approach

1. Check voting results after all votes submitted
2. If impostor got most votes → allow guess
   /3. If impostor didn't get most votes → impostor wins (game ends)
3. Display who won (player or impostor) in the last panel(phase) when all stats are and where is play again button

## Implementation

**File:** `packages/backend/src/core/domain/entities/game.ts`

Modify `guessWord()` (line 186):

- Check if impostor is `getMostVoted()`
- If yes: allow guess (current logic)
- If no: should not reach guess phase (impostor already won)

May need new method or endpoint to check voting result and end game if impostor not voted.

## Risks

Need to verify game flow. When does guess phase start? After voting ends?

## Success Criteria

- Impostor can guess only when they have most votes
- Game shows impostor won if they didn't get most votes
- Clear display of winner (player or impostor)
