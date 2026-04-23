---
title: Backend Repositories & Adapters - Phase 3
phase: 3
---

# Task: Backend Repositories & Adapters

Implement SQLite adapters, HTTP routes for admin CRUD, and the WebSocket gateway.

## Checklist

### SQLite Repository Implementations
- [ ] `src/infra/adapters/persistence/sqlite/word.repository.ts`
- [ ] `src/infra/adapters/persistence/sqlite/category.repository.ts`

### HTTP Routes (Admin API)
- [ ] `src/infra/adapters/http/routes.ts` — admin CRUD for categories + words
- [ ] `src/infra/adapters/http/http-exception-filter.ts`

### WebSocket Gateway
- [ ] `src/infra/adapters/websocket/events.ts` — event type interfaces (PascalCase)
  - `RoundSubmittedEvent`, `VotingStartedEvent`, `VotesRevealedEvent`, `ImpostorGuessRequestEvent`, `GuessResultEvent`, `GameEndedEvent`
- [ ] `src/infra/adapters/websocket/socket.gateway.ts` — `SocketGateway` class
  - `broadcastRoundSubmitted`, `broadcastVotingStarted`, `broadcastVotesRevealed`, `broadcastGameEnded`
- [ ] `src/infra/adapters/websocket/game-event.handler.ts` — incoming event handlers
  - `joinGame`, `startGame`, `submitDescription`, `voteImpostor`, `guessWord`

### Wiring
- [ ] Wire everything into `src/main.ts` (dependency injection)
- [ ] Register Fastify routes
- [ ] Register Socket.io event handlers
