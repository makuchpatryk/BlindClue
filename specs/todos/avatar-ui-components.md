# Subtask: Create Avatar UI Components

**Parent**: add-player-avatars.md

## Create Avatar Selector Component
- **File**: `packages/frontend/src/shared/components/avatar-selector.vue`
- Display 8 avatar options in grid (4x2 or 2x4)
- Use DiceBear API URLs for preview images
- Allow click to select avatar
- Show visual indicator (border/highlight) on selected avatar
- Emit `@select` event with selected avatar ID
- Prop: `modelValue` or `selectedAvatar` to show current selection

## Create Avatar Badge Component
- **File**: `packages/frontend/src/shared/components/avatar-badge.vue`
- Display single avatar as circular image
- Props:
  - `avatar` (string) - avatar ID
  - `size` (optional: 'small'|'medium'|'large', default 'small')
  - `fallback` (optional: default initials or placeholder)
- Style: rounded border, consistent sizing
- Handle image load errors gracefully

## Avatar Configuration
Create utility or constant for avatar options:
- **File**: `packages/frontend/src/shared/utils/avatar-config.ts` (optional)
- 8 avatar IDs: avatar-001 through avatar-008
- Generate DiceBear URLs
- Export helper function: `getAvatarUrl(avatarId: string): string`

## Verification
- Both components render without errors
- Avatar selector shows all 8 options
- Clicking avatar emits select event with correct ID
- Avatar badge displays image correctly