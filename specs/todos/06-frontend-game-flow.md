---
title: Frontend Game Flow - Phase 5
phase: 5
---

# Task: Frontend Game Flow

Implement all game phase components, socket event subscriptions, and real-time UI updates.

## Checklist

### Game Composables
- [ ] `src/features/game/composables/use-game-state.ts` — exposes store state + actions
- [ ] `src/features/game/composables/use-game-flow.ts` — handles phase transitions
- [ ] `src/features/game/composables/use-round-timer.ts`

### Game Phase Components
- [ ] `src/features/game/components/round-phase.vue` — shows current round info
- [ ] `src/features/game/components/description-submit.vue` — input for submitting description
- [ ] `src/features/game/components/description-display.vue` — shows submitted descriptions
- [ ] `src/features/game/components/voting-phase.vue` — player vote selection
- [ ] `src/features/game/components/reveal-phase.vue` — show vote results + who was caught
- [ ] `src/features/game/components/impostor-guess-phase.vue` — impostor word guess input

### Scoreboard
- [ ] `src/features/scoreboard/components/final-scoreboard.vue`
- [ ] `src/features/scoreboard/components/player-card.vue`

### Admin Panel
- [ ] `src/features/admin/components/manage-categories.vue`
- [ ] `src/features/admin/components/manage-words.vue`
- [ ] `src/features/admin/composables/use-admin-service.ts`

### Socket Integration
- [ ] Connect `GameClientService` socket listeners to Pinia store
  - `GameStarted` → setGameStarted
  - `RoundSubmitted` → addRoundSubmissions
  - `VotingStarted` → setStatus('VOTING')
  - `VotesRevealed` → setVotes
  - `GameEnded` → setFinalScores + setStatus('ENDED')
- [ ] Wire emit methods: `submitDescription`, `voteImpostor`, `guessWord`
- [ ] Provide `GameClientService` via `app.provide()` in main.ts