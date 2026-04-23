---
title: Backend Use Cases & Services - Phase 2
phase: 2
---

# Task: Backend Use Cases & Services

Implement all use-cases, application services, GameManager, and GameOrchestrator.

## Checklist

### Repository Interfaces (Ports)
- [ ] `src/core/domain/ports/word.repository.ts` — `IWordRepository` interface
- [ ] `src/core/domain/ports/category.repository.ts` — `ICategoryRepository` interface

### Use Cases
- [ ] `src/core/domain/use-cases/create-game.use-case.ts`
- [ ] `src/core/domain/use-cases/join-game.use-case.ts`
- [ ] `src/core/domain/use-cases/submit-description.use-case.ts`
- [ ] `src/core/domain/use-cases/vote-impostor.use-case.ts`
- [ ] `src/core/domain/use-cases/guess-word.use-case.ts`
- [ ] `src/core/domain/use-cases/calculate-scores.use-case.ts`
- [ ] `src/core/domain/use-cases/get-game-state.use-case.ts`

### Application Layer
- [ ] `src/application/services/game-manager.ts` — in-memory store singleton
- [ ] `src/application/services/game.application-service.ts` — orchestrates use-cases
- [ ] `src/application/services/admin-game.service.ts` — word/category CRUD
- [ ] `src/application/services/game.orchestrator.ts` — coordinates service + gateway

### DTOs & Mappers
- [ ] `src/application/dtos/create-game.dto.ts`
- [ ] `src/application/dtos/game-state.dto.ts`
- [ ] `src/application/dtos/player.dto.ts`
- [ ] `src/application/dtos/round-submission.dto.ts`
- [ ] `src/application/dtos/vote-result.dto.ts`
- [ ] `src/application/mappers/game.mapper.ts`
- [ ] `src/application/mappers/player.mapper.ts`
- [ ] `src/application/utils/id-generator.ts`
