# Game Rounds, UI Display, Enter Key, Orchestration Component

## Goal

Persist round numbers across sessions, show user in game, submit words with enter key, refactor with orchestration component managing full game state.

## Scope

- **In**: Round storage (persists sessions), user display in game top, enter-key word submission, orchestration component + state migration
- **Out**: Auth changes, network protocol changes, game rules modifications

## Approach

### Phase 1: Storage + Display

1. Add `roundNumber` to storage alongside `userName`
2. Increment on each game start (not reset)
3. Display user name in game header/top section

### Phase 2: Enter Key Handler

1. In rounds phase input, attach enter key listener
2. On enter: submit word to other players immediately
3. Clear input field after submit

### Phase 3: Orchestration Component

1. Create new `GameOrchestrator` component (wraps game view)
2. Move full game state from view → orchestrator
   - Game phase, round data, player submissions, scores, etc.
3. View becomes presentation layer + routing
4. Orchestrator handles all game logic + state transitions

### Phase 4: Integration

1. View imports GameOrchestrator
2. Pass storage (round, user) to orchestrator
3. Test round persistence across sessions
4. Test word submission flow
5. Run `pnpm validate`

## Risks

- State migration may break existing flow → need thorough testing
- Component boundary unclear → document prop flow
- Enter key conflicts with existing handlers → check for duplicates

## Success Criteria

- Round persists across new games (localStorage check)
- User name visible in game header
- Enter submits word + clears input
- Game orchestrator manages full state
- All existing features work (no regressions)
- `pnpm validate` passes
