# Voice System Implementation

## Goal

Add real-time P2P voice chat for 2-6 players with mute-self toggle, no recording.

## Scope

- **In:** WebRTC audio streaming all game phases, self-mute toggle, browser-only
- **Out:** Recording, mute others, mobile, third-party SDK, echo cancellation (browser native)

## Approach

### Phase 1: Signal Layer (Backend)

- Add WebRTC signal events to socket gateway:
  - `voice:offer` → broadcast SDP offer to game room
  - `voice:answer` → route SDP answer back
  - `voice:ice-candidate` → relay ICE candidates
- Track voice state per player (connected, muted)

### Phase 2: Frontend WebRTC Setup

- Create `VoiceService`:
  - Get user mic permissions (prompt on first join)
  - Create RTCPeerConnection per peer
  - Handle offer/answer/ICE flow
  - Handle connection state changes (connected/failed/disconnected)
- Store audio streams in component state

### Phase 3: UI

- Mute toggle button (own mic on/off)
- Visual indicator: own mic status + peer connection status
- Graceful cleanup: close connections on game end

### Phase 4: Testing

- Signal routing (offer/answer/ICE exchange)
- Audio stream state transitions
- Mute toggle behavior

## Risks

- NAT/firewall issues (P2P may not punch through) → add TURN fallback later if needed
- Mic permissions denied → fallback graceful disable
- One peer drops → partial connection failure (by design for P2P)

## Success Criteria

- Players in same game hear each other
- Mute toggle mutes own mic
- Voice drops on game end
- No crashes on permission deny
