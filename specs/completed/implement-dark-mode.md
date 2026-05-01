# Implement Dark Mode Theme

## Issue

Current light mode doesn't match user preference. Need to switch to a dark palette throughout the app.

## Details

- Change background colors from light grays to dark colors
- Update text colors for dark mode visibility
- Update button colors for dark mode
- Update all components to use dark color scheme
- Ensure good contrast for accessibility

## Components to Update

- App.vue (main background and header)
- game-view.vue
- All game phase components (voting, reveal, etc.)
- Buttons and interactive elements
- Cards and containers

## Components Updated

- [x] App.vue (bg-gray-900, text-gray-100)
- [x] game-view.vue (bg-gray-800)
- [x] All lobby components (create-game-form, join-game-form, lobby-waiting-room)
- [x] All game phase components (voting, reveal, round, description-submit, description-display, impostor-guess)
- [x] Scoreboard components (final-scoreboard, player-card)
- [x] Shared components (button, modal, game-code)
- [x] All buttons and interactive elements (bg-blue-600 hover:bg-blue-700)
- [x] Cards and containers (bg-gray-700, bg-gray-800)

## Status

- [x] Update Tailwind config if needed for dark colors
- [x] Update App.vue background and styling
- [x] Update game-view.vue styling
- [x] Update component styling
- [x] Test visibility and contrast
- [x] Test on different screen sizes

## Completed

Full dark mode implementation with consistent color scheme throughout the app.
