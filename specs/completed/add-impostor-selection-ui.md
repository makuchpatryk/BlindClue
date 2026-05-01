# Add Impostor Selection UI with Player Buttons

## Issue

During voting phase, players need an intuitive way to select which player is the impostor. Need cards/buttons displaying player names that users can click to vote.

## Details

- Create clickable player cards/buttons in the voting phase
- Each button shows the player's name
- Players can click to select who they think is the impostor
- Visual feedback for selected player
- Include "Next Round" and "Next Person" navigation buttons if needed for post-voting phase

## Status

- [x] Design player card component for voting
- [x] Add click handlers to select impostor
- [x] Add visual feedback for selection
- [x] Update voting phase component to use new UI
- [x] Test voting interaction

## Completed

The voting phase already had clickable player buttons implemented in voting-phase.vue. Updated styling to dark mode with improved visibility:

- Player buttons styled with dark background (bg-gray-700)
- Hover effect shows blue border and gray background
- Clear text contrast for visibility
- Buttons are fully functional for voting
