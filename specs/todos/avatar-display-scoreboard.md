# Subtask: Display Avatars on Scoreboard/Final Screen

**Parent**: add-player-avatars.md

## Update Final Scores Display
- **File**: `packages/frontend/src/features/game/views/game-view.vue` (end game section)
- Add avatar-badge next to player names in final scores section
- Show avatar + player name + score

## Update Scoreboard Components
- **File**: `packages/frontend/src/features/scoreboard/components/player-card.vue`
- Add larger avatar display (medium/large size) to player card
- Position at top of card above player name
- Styled as focal point

## Update Scoreboard Player List
- Any other scoreboard listing components
- Add avatar-badge consistently with other displays

## Final Game Summary
- **File**: `packages/frontend/src/features/game/views/game-view.vue` (lines 210-248)
- Add avatar for:
  - Most voted player (who was voted impostor)
  - Actual impostor
- Show avatar + name in each section

## Verification
- Final scoreboard shows all player avatars
- Avatar display is visually prominent on player cards
- Avatars align with final scores and rankings
- No missing avatars or broken images
- Styling matches overall game theme
