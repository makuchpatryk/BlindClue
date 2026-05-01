---
title: Lobby Join Flow — Name Popup + Host Approval
phase: 7
status: completed
completedDate: 2026-04-24
---

# Task: Lobby Join Flow

Implement proper lobby UX: name entry popup when joining a game, and host approval flow when players request to join.

## Requirements

1. When player lands on `/game/:gameId` → show **name entry popup**
2. After entering name → send join request to host
3. **Host** gets a **popup** with "Player X wants to join — Allow/Deny"
4. Only after host approves is the player added to the game

## Backend Changes

### `game-event.handler.ts`

- Change `joinGame` to `requestJoin` — store requester socket in a pending map, notify host
- Add `approveJoin` handler — adds player, emits `joinGameSuccess` to requester + `PlayerJoined` to room
- Add `rejectJoin` handler — emits `joinGameError` to requester
- Track `pendingRequests: Map<requestId, { socket, playerName }>`
- Track `hostSockets: Map<gameId, socketId>` — first joiner is the host

### `events.ts`

- Add `JoinRequestEvent { gameId, requestId, playerName }`
- Add `JoinApprovedEvent { playerId }`
- Add `JoinRejectedEvent { reason }`

### `socket.gateway.ts`

- Add `sendJoinRequestToHost(hostSocketId, event)` — targeted emit to host socket only

## Frontend Changes

### `game-view.vue`

- On mount: if no `myPlayerId` in store → show name entry modal
- Name modal: input + "Join" button → emits `requestJoin` via socket
- After submit: show "Waiting for host approval..." state
- Listen for `JoinRequest` event (host only) → show approval modal
- Approve button → emit `approveJoin { requestId }`
- Reject button → emit `rejectJoin { requestId }`

### `game.store.ts`

- Add `myPlayerId: ref<string>('')`
- Add `myPlayerName: ref<string>('')`
- Add `pendingJoinRequests: ref<Array<{ requestId, playerName }>>([])` (for host)
- Add `joinStatus: ref<'idle' | 'pending' | 'approved' | 'rejected'>('idle')`
- Add actions: `setMyPlayer`, `addJoinRequest`, `removeJoinRequest`, `setJoinStatus`

### `game-client.service.ts`

- Listen for `JoinRequest` → `gameStore.addJoinRequest()`
- Listen for `joinGameSuccess` → `gameStore.setMyPlayer()` + `setJoinStatus('approved')`
- Listen for `joinGameError` → `gameStore.setJoinStatus('rejected')`
- Add emit: `requestJoin(gameId, playerName)`
- Add emit: `approveJoin(requestId)`
- Add emit: `rejectJoin(requestId)`

## Flow

```
Joiner visits /game/:gameId
  → name modal appears
  → enters name → emits requestJoin
  → shows "Waiting for approval..."

Host sees popup:
  → "Alice wants to join — Allow / Deny"
  → Allow → emits approveJoin
  → Deny → emits rejectJoin

On approve: joiner enters lobby, PlayerJoined broadcast
On reject: joiner sees "Host rejected your request"
```

## Verification

- Tab A: create game → goes to /game/:id (host, no name modal)
- Tab B: navigate to /game/:id → name popup appears
- Tab B enters name → Tab A sees approval popup
- Tab A approves → both tabs show player in list
- Test rejection: Tab A rejects → Tab B shows rejection message

## Completion Notes

### Implemented Changes

**Backend:**

- ✅ `events.ts`: Added JoinRequestEvent, JoinApprovedEvent, JoinRejectedEvent interfaces
- ✅ `socket.gateway.ts`: Added sendJoinRequestToHost() method + imported JoinRequestEvent
- ✅ `game.orchestrator.ts`: Added JoinRequestEvent interface and sendJoinRequestToHost() delegation method
- ✅ `game-event.handler.ts`:
  - Changed 'joinGame' handler to 'requestJoin'
  - Added pendingRequests and hostSockets tracking maps
  - Implemented approveJoin and rejectJoin handlers
  - First joiner automatically becomes host

**Frontend:**

- ✅ `game.store.ts`: Added myPlayerId, myPlayerName, pendingJoinRequests, joinStatus state + setter methods
- ✅ `game-client.service.ts`:
  - Added listeners for JoinRequest, joinGameSuccess, joinGameError
  - Changed joinGame() to requestJoin()
  - Added approveJoin() and rejectJoin() emit methods
- ✅ `game-view.vue`:
  - Added name entry modal (shown when myPlayerId is empty)
  - Added approval waiting modal (shown when joinStatus is 'pending')
  - Added host approval modal (shown when pendingJoinRequests exist)
  - Implemented submitName(), approveJoin(), rejectJoin() functions
- ✅ `create-game-form.vue`: Removed name input field, now just creates game and navigates
- ✅ `join-game-form.vue`: Removed name input field, now just navigates to game

### Flow Summary

1. Game creator or player navigates to /game/:gameId
2. Name entry modal appears (no myPlayerId yet)
3. First joiner auto-becomes host and gets joinGameSuccess
4. Subsequent joiners send requestJoin, which notifies host
5. Host sees approval popup and can allow/deny
6. On approval: joiner receives joinGameSuccess and enters lobby
7. On rejection: joiner sees rejection message
