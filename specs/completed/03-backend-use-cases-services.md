---
title: Backend Use Cases & Services - Phase 2
phase: 2
status: completed
---

# Task: Backend Use Cases & Services ✅

Implement all use-cases, application services, GameManager, and GameOrchestrator.

## Completed ✅

### Repository Interfaces (Ports) ✅

- [x] `src/core/domain/ports/word.repository.ts` — IWordRepository with CRUD + getRandomWord
- [x] `src/core/domain/ports/category.repository.ts` — ICategoryRepository with CRUD

### Use Cases ✅

- [x] `src/core/domain/use-cases/create-game.use-case.ts` — Creates game with random word
- [x] `src/core/domain/use-cases/submit-description.use-case.ts` — Delegates to Game entity
- [x] `src/core/domain/use-cases/vote-impostor.use-case.ts` — Delegates to Game entity
- [x] `src/core/domain/use-cases/guess-word.use-case.ts` — Impostor word guess
- [x] `src/core/domain/use-cases/calculate-scores.use-case.ts` — Full scoring implementation
- [x] `src/core/domain/use-cases/get-game-state.use-case.ts` — Maps Game to DTO

### Application Layer ✅

- [x] `src/application/services/game-manager.ts` — Singleton in-memory game store
- [x] `src/application/services/game.application-service.ts` — All gameplay operations
- [x] `src/application/services/admin-game.service.ts` — Category & word management
- [x] `src/application/services/game.orchestrator.ts` — Service + gateway coordinator

### DTOs ✅

- [x] `src/application/dtos/game-state.dto.ts` — GameStateDTO, PlayerDTO, DescriptionDTO, ScoreDTO
- [x] `src/application/dtos/create-game.dto.ts` — CreateGameDTO
- [x] `src/application/utils/id-generator.ts` — Static ID generation utility

## Key Architecture

- Clean separation between domain and application layers
- All game logic in Game entity (rich domain model)
- Dependency injection wired in main.ts
- Result<T, Error> pattern throughout
- Singleton GameManager for fast in-memory storage
