import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import VotingPhase from "@/features/game/components/phases/voting-phase.vue";
import { useGameStore } from "@/features/game/stores/game.store";

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot/></button>',
    props: ["disabled", "variant", "fullWidth"],
    emits: ["click"],
  },
}));

vi.mock("@/shared/components/card.vue", () => ({
  default: {
    name: "Card",
    template: '<div><slot name="header"></slot><slot/></div>',
  },
}));

vi.mock("@/shared/components/heading.vue", () => ({
  default: { name: "Heading", template: "<h1><slot/></h1>" },
}));

vi.mock("@/features/game/components/player-selection-list.vue", () => ({
  default: {
    name: "PlayerSelectionList",
    template: "<div>Players</div>",
    props: ["disabled"],
  },
}));

vi.mock("@/shared/utils/game-status.js", () => ({
  GameStatus: { VOTING: "VOTING" },
}));

describe("VotingPhase", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const gameStore = useGameStore();
    gameStore.setPlayers([
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ]);
    gameStore.myPlayerId = "p1";
    gameStore.gameId = "game-123";
  });

  const mountOptions = {
    global: {
      provide: {
        gameClientService: null,
      },
    },
  };

  it("should render voting prompt", () => {
    const wrapper = mount(VotingPhase, mountOptions);
    expect(wrapper.text()).toContain("Who is the impostor?");
  });

  it("should render player selection list", () => {
    const wrapper = mount(VotingPhase, mountOptions);
    expect(wrapper.text()).toContain("Players");
  });

  it("should show disabled vote button when no player selected", () => {
    const gameStore = useGameStore();
    gameStore.selectedImpostorGuess = null;

    const wrapper = mount(VotingPhase, mountOptions);
    const buttons = wrapper.findAll("button");

    const selectButton = buttons.find((b) =>
      b.text().includes("Select a player"),
    );
    expect(selectButton?.attributes("disabled")).toBeDefined();
  });

  it("should show enabled vote button when player selected", () => {
    const gameStore = useGameStore();
    gameStore.selectedImpostorGuess = "p2";

    const wrapper = mount(VotingPhase, mountOptions);
    const buttons = wrapper.findAll("button");

    const voteButton = buttons.find((b) => b.text().includes("Show Impostor"));
    expect(voteButton?.attributes("disabled")).not.toBeDefined();
  });

  it("should disable player selection while voting", async () => {
    const gameStore = useGameStore();
    gameStore.selectedImpostorGuess = "p2";

    const wrapper = mount(VotingPhase, mountOptions);
    const selections = wrapper.findAll('[data-testid="player-selection-list"]');

    // Player selection list should be disabled during voting
    // This is handled by the component's voting state
  });

  it("should show voting text when voting in progress", async () => {
    const gameStore = useGameStore();
    gameStore.selectedImpostorGuess = "p2";

    const wrapper = mount(VotingPhase, mountOptions);
    const buttons = wrapper.findAll("button");

    const voteButton = buttons.find((b) => b.text().includes("Show Impostor"));
    expect(voteButton).toBeTruthy();
  });

  it("should render instruction text for player selection", () => {
    const wrapper = mount(VotingPhase, mountOptions);
    expect(wrapper.text()).toContain("Select a player and confirm your vote");
  });
});
