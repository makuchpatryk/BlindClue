# Game-View Refactor: Phase Components

## Goal
Split game-view template by GameStatus into dedicated phase components. Game-view becomes pure orchestrator.

## Scope
**In:**
- Extract LOBBY, RUNNING, VOTING, ENDED into phase components
- Each phase gets composable if needed (e.g. RunningPhase handles word submission)
- Move modal overlays (snackbar, join approval) to shared/extracted components
- Game-view: status switch only + prop/callback passing

**Out:**
- No store changes
- Socket/gameClientService stays in game-view
- No feature additions

## Approach

### Phase 1: Create phase components (4 new files)
**LobbyPhase.vue:**
- Game code display + copy
- Player list, start button
- Join request modals + approval logic

**RunningPhase.vue:**
- Round/turn display
- Category/word visibility (impostor vs players)
- Word input form + words list
- Composable: `useRunningPhaseLogic()` handles word submit + turn advance

**EndedPhase.vue:**
- Conditional: ImpostorGuessPhase OR results block
- Vote tally display
- Category/word reveal
- Play again button
- Composable: `useEndedPhaseLogic()` (minimal, mostly display)

**VotingPhaseWrapper.vue:**
- Toggle existing VotingPhase / RevealPhase

### Phase 2: Refactor game-view.vue
- Keep: onMounted (session/join logic), provide gameClientService
- Replace: template if-chains with `<LobbyPhase />` etc
- Extract: startGame, approveJoin, rejectJoin → pass as callbacks
- Result: ~50 lines template, ~100 script (down from 454)

### Phase 3: Refactor stores
- No changes needed (stores already decouple game logic)

## Risks
- Prop drilling depth if we don't use provide/inject for gameClientService
- Circular dependencies between game-view and phases during refactor — use callbacks/emits

## Success Criteria
- game-view < 150 lines (currently 454)
- Each phase: single phase only
- All game flow tests pass (integration)
- Socket calls untouched
- TypeScript strict passes
