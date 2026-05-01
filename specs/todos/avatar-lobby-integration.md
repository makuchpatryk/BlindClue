# Subtask: Integrate Avatar Selection in Lobby Forms

**Parent**: add-player-avatars.md

## Update Lobby Store
- **File**: `packages/frontend/src/features/lobby/stores/lobby.store.ts`
- Add `playerAvatar` ref (string, default: 'avatar-001')
- Add `setPlayerAvatar(avatar: string)` method
- Reset avatar in `resetForm()` or similar cleanup

## Update Join Game Form
- **File**: `packages/frontend/src/features/lobby/components/join-game-form.vue`
- Import avatar-selector component
- Add avatar selector UI below player name input
- Track selected avatar in form state
- Pass avatar to socket emit in `requestJoin` call

## Update Create Game Form
- **File**: `packages/frontend/src/features/lobby/components/create-game-form.vue`
- Same changes as join form
- Avatar selector integrated into create flow
- Pass avatar in `requestJoin` or equivalent event

## Update Game Client Service
- **File**: `packages/frontend/src/shared/services/game-client.service.ts`
- Update `requestJoin()` signature to accept avatar parameter
- Include avatar in emitted socket event data
- Update `rejoinGame()` if needed to handle avatar

## Verification
- Avatar selector appears in both join and create forms
- Selected avatar is sent to backend
- Can select different avatars and confirm selection persists in form