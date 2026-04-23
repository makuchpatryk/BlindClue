---
title: Frontend Setup & Lobby - Phase 4
phase: 4
---

# Task: Frontend Setup & Lobby

Initialize Vue 3 + Vite + Tailwind frontend package and implement the lobby feature.

## Checklist

### Project Init
- [ ] `packages/frontend/package.json` with dependencies (vue, vite, pinia, socket.io-client, tailwindcss, vue-router)
- [ ] `packages/frontend/tsconfig.json`
- [ ] `packages/frontend/vite.config.ts`
- [ ] `packages/frontend/tailwind.config.ts`
- [ ] `packages/frontend/index.html`
- [ ] `src/main.ts` — app bootstrap
- [ ] `src/App.vue`
- [ ] `src/router.ts` — vue-router setup

### Shared Infrastructure
- [ ] `src/features/shared/utils/socket.ts` — Socket.io client instance
- [ ] `src/features/shared/utils/constants.ts`
- [ ] `src/features/shared/services/game-client.service.ts` — singleton socket orchestrator
- [ ] `src/features/shared/types/game.ts` — shared type definitions (GameStateDTO, PlayerDTO, etc.)
- [ ] `src/features/shared/types/events.ts`
- [ ] `src/features/shared/composables/use-socket.ts`
- [ ] Shared UI components: `modal.vue`, `button.vue`, `timer.vue`, `game-code.vue`

### Game Pinia Store
- [ ] `src/features/game/stores/game.store.ts` — reactive game state
  - state: gameId, status, currentRound, word, category, isImpostor, players, descriptions, votes, finalScores
  - actions: setGameStarted, setStatus, addRoundSubmissions, setVotes, setFinalScores, reset

### Lobby Feature
- [ ] `src/features/lobby/components/create-game-form.vue`
- [ ] `src/features/lobby/components/join-game-form.vue`
- [ ] `src/features/lobby/components/lobby-waiting-room.vue`
- [ ] `src/features/lobby/composables/use-lobby.ts`
- [ ] `src/features/lobby/stores/lobby.store.ts`