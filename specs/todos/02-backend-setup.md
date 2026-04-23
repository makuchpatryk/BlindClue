---
title: Backend Setup - Phase 1
phase: 1
---

# Task: Backend Setup

Initialize the backend package with Fastify, Socket.io, SQLite, and TypeScript. Implement core domain entities.

## Checklist

### Project Init
- [ ] `packages/backend/package.json` with dependencies (fastify, socket.io, better-sqlite3, typescript)
- [ ] `packages/backend/tsconfig.json`
- [ ] `packages/backend/src/main.ts` (Fastify + Socket.io entry)
- [ ] `packages/backend/src/config.ts`
- [ ] `.env.example`

### Core Types
- [ ] `src/application/utils/result.ts` — `Result<T, E>` type + `ResultError`
- [ ] `src/core/domain/value-objects/game-status.ts` — `GameStatus` enum
- [ ] `src/core/domain/value-objects/game-id.ts`
- [ ] `src/core/domain/value-objects/player-id.ts`

### Domain Entities
- [ ] `src/core/domain/entities/game.ts` — `Game` class with full business logic
- [ ] `src/core/domain/entities/player.ts` — `Player` class
- [ ] `src/core/domain/entities/word.ts`
- [ ] `src/core/domain/entities/vote.ts`
- [ ] `src/core/domain/entities/round-submission.ts`

### Database
- [ ] `src/infra/adapters/persistence/migrations/init.sql` — categories + words schema
- [ ] `src/infra/database/seeds.sql` — initial seed data
- [ ] `src/infra/adapters/persistence/sqlite/database.ts` — SQLite connection

### Exceptions
- [ ] `src/core/domain/ports/exceptions/domain.exception.ts`
- [ ] `src/core/domain/ports/exceptions/game-not-found.exception.ts`
- [ ] `src/core/domain/ports/exceptions/game-full.exception.ts`
- [ ] `src/core/domain/ports/exceptions/invalid-game-state.exception.ts`