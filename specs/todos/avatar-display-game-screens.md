# Subtask: Display Avatars in Game Screens

**Parent**: add-player-avatars.md

## Update Lobby Player List
- **File**: `packages/frontend/src/features/game/views/game-view.vue` (lines 72-76)
- Add avatar-badge component before player name
- Loop through players and show avatar + name + ID

## Update Turn Indicator
- **File**: `packages/frontend/src/features/game/views/game-view.vue` (line 104)
- Add avatar-badge of current player next to "It's X's turn" heading
- Use medium size avatar for visibility

## Update Round Phase Display
- **File**: `packages/frontend/src/features/game/components/round-phase.vue`
- Add avatar display next to player names in list
- Keep existing styling, just add avatar badge

## Update Player Selection List (Voting)
- **File**: `packages/frontend/src/features/game/components/player-selection-list.vue`
- Add avatar-badge to each player button
- Position avatar before player name
- Adjust button padding/styling to fit avatar

## Update Vote Results Display
- **File**: `packages/frontend/src/features/game/views/game-view.vue` (lines 254-270)
- Add avatar-badge next to player name in vote results
- Show avatar + vote count

## Update Description Display
- **File**: `packages/frontend/src/features/game/components/description-display.vue`
- Add avatar-badge next to player name when showing descriptions

## Verification
- All game screens show player avatars correctly
- Avatars load from DiceBear API without errors
- Styling is consistent across all displays
- No layout shifts or broken spacing
