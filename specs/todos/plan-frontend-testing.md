# Frontend Component Testing with Vitest

## Goal
Comprehensive test suite for all 32 frontend components/composables using TDD + vitest. Cover happy paths and edge cases.

## Scope

### In
- All Vue components (.vue files)
- All composables
- Happy path + edge case coverage
- Unit + integration tests
- Setup vitest + test infrastructure

### Out
- E2E tests (Cypress/Playwright)
- Visual regression testing
- Performance testing

## Approach

### Phase 1: Setup (1-2 hours)
1. Install vitest, @testing-library/vue, jsdom
2. Configure vitest.config.ts
3. Setup test helpers/utilities (mount, mock socket.io, mock stores)
4. Add test scripts to package.json

### Phase 2: Core Components (3-4 hours) — **START HERE**
Priority order (most impact first):

1. **Game State** (useGameFacade composable)
   - State initialization
   - Phase transitions
   - Player joins/leaves
   - Game status updates

2. **game-orchestrator.vue**
   - Mount with game context
   - Phase switching based on status
   - Modal displays (join approval, waiting)
   - Snackbar handling

3. **Phase Components** (running, voting, guessing, ended)
   - User actions (submit description, vote, guess)
   - Output rendering
   - Error states

4. **Player Selection** (player-selection-list.vue)
   - Render players
   - Select/deselect actions
   - Edge: no players, single player

### Phase 3: Forms & Shared (2-3 hours)
1. **create-game-form.vue**, **join-game-form.vue**
   - Form validation
   - Submit handling
   - Error display

2. **Shared Components** (button, input, modal, card, alert)
   - Props rendering
   - Events emission
   - Slot content

### Phase 4: Features & Admin (1-2 hours)
1. **Admin components** (manage-categories, manage-words)
   - List rendering
   - CRUD actions

2. **Feature components** (copied-snackbar, description-display, etc.)
   - Conditional rendering
   - Content display

## Risks
- **Socket.io mocking**: Real-time events need careful mocking
- **Store coupling**: Pinia store must be mockable in tests
- **Async behavior**: Game phase transitions are async
- **Component complexity**: game-orchestrator has many responsibilities

## Success Criteria
1. vitest installed and configured
2. Test helpers created (mount, mock socket, mock store)
3. Phase 2 components at 80%+ coverage (happy + edge cases)
4. All tests pass, no skipped tests
5. `pnpm test` runs full suite

## File Structure
```
packages/frontend/src/
├── __tests__/
│   ├── setup.ts                        (vitest setup, mocks)
│   ├── helpers.ts                      (mount utilities)
│   ├── mocks/
│   │   ├── socket.mock.ts
│   │   └── store.mock.ts
│   └── components/
│       ├── game-orchestrator.spec.ts
│       ├── phases/
│       │   ├── running-phase.spec.ts
│       │   ├── voting-phase.spec.ts
│       │   └── ...
│       └── shared/
│           ├── button.spec.ts
│           └── ...
```

## Test Pattern (TDD)
1. Write test first (red) — test file before component logic
2. Minimal implementation to pass (green)
3. Refactor component if needed, tests still pass

## Progress

### Phase 1: Setup ✅ COMPLETE
- [x] Installed vitest, @testing-library/vue, jsdom, @vue/test-utils
- [x] Configured vitest.config.ts (already existed)
- [x] Created test infrastructure:
  - `src/__tests__/setup.ts` — pinia + global test setup
  - `src/__tests__/helpers.ts` — mount utilities, mock factories
  - `src/__tests__/mocks/socket.mock.ts` — socket.io mocking
  - `src/__tests__/mocks/store.mock.ts` — store mocking
- [x] Added test scripts to package.json (test, test:ui, test:coverage)

### Phase 2: Core Components — IN PROGRESS
Completed:
- [x] **useGameFacade composable** (6 tests passing)
  - Submit description with valid game/player
  - Submit description with no service/player
  - Vote for impostor
  - Guess word
  - Return game store reference
  
- [x] **game-orchestrator.vue** (8 tests passing)
  - Render correct phase based on status (lobby → running → voting → guessing → ended)
  - Show join waiting modal
  - Show join approval modal
  - Request join on mount
  - Rejoin logic for same game
  - Clear session on game ID mismatch

- [x] **player-selection-list.vue** (6 tests)
  - Render all players
  - Select player on click
  - Show selection checkmark
  - Show voted player checkmark
  - Handle disabled state
  - Handle empty list

**Current: 20 tests passing**

### Phase 3: Forms & Shared — TODO
- create-game-form.vue
- join-game-form.vue
- Shared components (button, input, modal, card, alert)

### Phase 4: Features & Admin — TODO
- Admin components (manage-categories, manage-words)
- Feature components (copied-snackbar, description-display, etc.)

## Next Steps
1. Test running/voting/guessing/ended phase components
2. Test form components (create/join game)
3. Test shared UI components
4. Test admin components
5. Run `pnpm test:coverage` for full coverage report
