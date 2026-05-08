import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import GameOrchestrator from "@/features/game/components/game-orchestrator.vue";
import { useGameStore } from "@/features/game/stores/game.store";
import { useLobbyStore } from "@/features/lobby/stores/lobby.store";
import { GameStatus } from "@/shared/utils/game-status";
import { JoinStatus } from "@/shared/types/game";

// Mock child components
vi.mock("@/features/game/components/phases/lobby-phase.vue", () => ({
  default: { name: "LobbyPhase", template: "<div>Lobby Phase</div>" },
}));

vi.mock("@/features/game/components/phases/running-phase.vue", () => ({
  default: { name: "RunningPhase", template: "<div>Running Phase</div>" },
}));

vi.mock("@/features/game/components/phases/voting-phase.vue", () => ({
  default: { name: "VotingPhase", template: "<div>Voting Phase</div>" },
}));

vi.mock("@/features/game/components/phases/guessing-phase.vue", () => ({
  default: { name: "GuessingPhase", template: "<div>Guessing Phase</div>" },
}));

vi.mock("@/features/game/components/phases/ended-phase.vue", () => ({
  default: { name: "EndedPhase", template: "<div>Ended Phase</div>" },
}));

vi.mock("@/features/game/components/copied-snackbar.vue", () => ({
  default: {
    name: "CopiedSnackbar",
    template: '<div v-if="show">Copied!</div>',
    props: ["show"],
  },
}));

vi.mock("@/features/game/components/join-waiting-modal.vue", () => ({
  default: {
    name: "JoinWaitingModal",
    template: '<div v-if="show">Waiting...</div>',
    props: ["show"],
  },
}));

vi.mock("@/features/game/components/join-approval-modal.vue", () => ({
  default: {
    name: "JoinApprovalModal",
    template: '<div v-if="show">Approve Join</div>',
    props: ["show", "pendingRequest"],
    emits: ["approve", "reject"],
  },
}));

vi.mock("@/shared/composables/use-clipboard.ts", () => ({
  useClipboard: () => ({
    copyToClipboard: vi.fn(),
  }),
}));

vi.mock("@/shared/utils/socket.ts", () => ({
  getSocket: vi.fn(() => ({
    emit: vi.fn(),
    on: vi.fn(),
  })),
}));

vi.mock("@/shared/utils/session-storage.ts", () => ({
  getGameSession: vi.fn(),
  clearGameSession: vi.fn(),
  saveGameSession: vi.fn(),
  getRoundNumber: vi.fn(() => 0),
  saveRoundNumber: vi.fn(),
  clearRoundNumber: vi.fn(),
}));

vi.mock("@/features/game/services/game-client.service.ts", () => ({
  GameClientService: {
    getInstance: vi.fn(() => ({
      startGame: vi.fn(),
      requestJoin: vi.fn(),
      rejoinGame: vi.fn(),
      approveJoin: vi.fn(),
      rejectJoin: vi.fn(),
      restartGame: vi.fn(),
      transitionToVoting: vi.fn(),
      advanceTurn: vi.fn(),
      submitPlayerWord: vi.fn(),
    })),
  },
}));

describe("GameOrchestrator", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render lobby phase initially", () => {
    const wrapper = mount(GameOrchestrator, {
      props: { gameId: "game-123" },
    });

    expect(wrapper.text()).toContain("Lobby Phase");
  });

  it("should render running phase when status is RUNNING", async () => {
    const gameStore = useGameStore();
    gameStore.setGameStarted({
      gameId: "game-123",
      category: "Animals",
      impostorId: "player-2",
      players: [
        { id: "player-1", name: "Alice" },
        { id: "player-2", name: "Bob" },
      ],
    });

    const wrapper = mount(GameOrchestrator, {
      props: { gameId: "game-123" },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Running Phase");
  });

  it("should render voting phase when status is VOTING", async () => {
    const gameStore = useGameStore();
    gameStore.setGameStarted({
      gameId: "game-123",
      category: "Animals",
      impostorId: "player-2",
      players: [
        { id: "player-1", name: "Alice" },
        { id: "player-2", name: "Bob" },
      ],
    });
    gameStore.setStatus(GameStatus.VOTING);

    const wrapper = mount(GameOrchestrator, {
      props: { gameId: "game-123" },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Voting Phase");
  });

  it("should show join waiting modal when join status is PENDING", async () => {
    const gameStore = useGameStore();
    gameStore.setJoinStatus(JoinStatus.PENDING);

    const wrapper = mount(GameOrchestrator, {
      props: { gameId: "game-123" },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Waiting...");
  });

  it("should show join approval modal when pending requests exist", async () => {
    const gameStore = useGameStore();
    gameStore.addJoinRequest({
      requestId: "req-123",
      playerName: "Charlie",
    });

    const wrapper = mount(GameOrchestrator, {
      props: { gameId: "game-123" },
    });

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Approve Join");
  });

  it("should request join on mount with player name", async () => {
    const lobbyStore = useLobbyStore();
    lobbyStore.setPlayerName("Alice");

    const wrapper = mount(GameOrchestrator, {
      props: { gameId: "game-123" },
    });

    await wrapper.vm.$nextTick();

    const gameStore = useGameStore();
    expect(gameStore.joinStatus).toBe(JoinStatus.PENDING);
  });

  it("should rejoin if session exists for same game", async () => {
    const { getGameSession } =
      await import("@/shared/utils/session-storage.js");
    vi.mocked(getGameSession).mockReturnValue({
      gameId: "game-123",
      playerId: "player-1",
    } as any);

    const wrapper = mount(GameOrchestrator, {
      props: { gameId: "game-123" },
    });

    await wrapper.vm.$nextTick();

    const gameStore = useGameStore();
    expect(gameStore.joinStatus).toBe(JoinStatus.PENDING);
  });

  it("should clear session if game ID differs", async () => {
    const { getGameSession, clearGameSession } =
      await import("@/shared/utils/session-storage.js");
    vi.mocked(getGameSession).mockReturnValue({
      gameId: "game-456",
      playerId: "player-1",
    } as any);

    const lobbyStore = useLobbyStore();
    lobbyStore.setPlayerName("Alice");

    const wrapper = mount(GameOrchestrator, {
      props: { gameId: "game-123" },
    });

    await wrapper.vm.$nextTick();

    expect(vi.mocked(clearGameSession)).toHaveBeenCalled();
  });
});
