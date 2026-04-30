# Remove "In Progress" Headline

## Issue
The "In Progress" headline (status display) is not needed and clutters the UI.

## Details
- Remove the `gameStatus` computed property that maps game status to display text
- Remove the `<h1>` that shows the status headline on line 33 of game-view.vue

## Status
- [x] Remove the gameStatus computed property
- [x] Remove the headline element
- [x] Test that the game view still displays correctly

## Completed
Both the computed property and the headline element have been removed from game-view.vue.
