---
title: Backend Setup - Phase 1
phase: 1
status: completed
---

# Task: Backend Setup ✅

Initialize the backend package with Fastify, Socket.io, SQLite, and TypeScript. Implement core domain entities.

## Completed ✅

### Project Init

- [x] `packages/backend/package.json` with Fastify, Socket.io, better-sqlite3, typescript, tsx, vitest
- [x] `packages/backend/tsconfig.json` extending root config
- [x] `packages/backend/src/main.ts` (Fastify + Socket.io with DI setup)
- [x] `packages/backend/src/config.ts` (dotenv configuration)
- [x] `.env` and `.env.example` created
- [x] `vitest.config.ts` for testing

### Core Types ✅

- [x] `src/application/utils/result.ts` — Result<T, E> pattern with ResultError
- [x] `src/core/domain/value-objects/game-status.ts` — GameStatus enum
- [x] `src/core/domain/value-objects/game-id.ts` — GameId with generation
- [x] `src/core/domain/value-objects/player-id.ts` — PlayerId with generation

### Domain Entities ✅

- [x] `src/core/domain/entities/game.ts` — Complete Game with all business logic
- [x] `src/core/domain/entities/player.ts` — Player with score tracking
- [x] `src/core/domain/entities/word.ts` — Word entity
- [x] `src/core/domain/entities/vote.ts` — Vote entity
- [x] `src/core/domain/entities/round-submission.ts` — RoundSubmission entity

### Database ✅

- [x] `src/infra/database/init.sql` — Categories + words schema with indexes
- [x] `src/infra/database/seeds.sql` — 5 categories + 25 sample words
- [x] `src/infra/adapters/persistence/sqlite/database.ts` — SQLite with auto-init & seed
- [x] `packages/backend/data/` — Database directory created

### Exceptions ✅

- [x] `src/core/domain/ports/exceptions/domain.exception.ts`
- [x] `src/core/domain/ports/exceptions/game-not-found.exception.ts`
- [x] `src/core/domain/ports/exceptions/game-full.exception.ts`
- [x] `src/core/domain/ports/exceptions/invalid-game-state.exception.ts`

## Implementation Details

- Database auto-initializes on first connection with init.sql
- Seeds automatically loaded (5 categories: Animals, Sports, Movies, Food, Technology)
- 25 words provided for testing
- Result pattern ensures explicit error handling throughout
- TypeScript strict mode enabled
