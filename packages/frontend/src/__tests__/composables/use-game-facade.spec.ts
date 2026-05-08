import { describe, it, expect, vi, beforeEach } from "vitest";
import { useGameFacade } from "@/features/game/composables/use-game-facade";
import { useGameStore } from "@/features/game/stores/game.store";
import { createPinia, setActivePinia } from "pinia";
import { defineComponent, h } from "vue";
import { mount } from "@vue/test-utils";

describe("useGameFacade", () => {
  const mockGameClientService = {
    submitDescription: vi.fn(),
    voteImpostor: vi.fn(),
    guessWord: vi.fn(),
  };

  const TestComponent = defineComponent({
    setup() {
      return useGameFacade();
    },
    render: () => h("div"),
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  function mountWithService() {
    return mount(TestComponent, {
      global: {
        provide: {
          gameClientService: mockGameClientService,
        },
      },
    });
  }

  it("should return game store", () => {
    const wrapper = mountWithService();
    expect(wrapper.vm.gameStore).toBeDefined();
  });

  it("should submit description when game and player exist", () => {
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
    gameStore.setMyPlayer("player-1", "Alice");

    const wrapper = mountWithService();
    wrapper.vm.submitDescription("A description");

    expect(mockGameClientService.submitDescription).toHaveBeenCalledWith(
      "game-123",
      "player-1",
      "A description",
    );
  });

  it("should not submit description if service unavailable", () => {
    const gameStore = useGameStore();
    gameStore.setGameStarted({
      gameId: "game-123",
      category: "Animals",
      impostorId: "player-2",
      players: [{ id: "player-1", name: "Alice" }],
    });
    gameStore.setMyPlayer("player-1", "Alice");

    const wrapper = mount(TestComponent, {
      global: {
        provide: {
          gameClientService: null,
        },
      },
    });
    expect(() => wrapper.vm.submitDescription("desc")).not.toThrow();
  });

  it("should not submit description if player ID missing", () => {
    const gameStore = useGameStore();
    gameStore.setGameStarted({
      gameId: "game-123",
      category: "Animals",
      impostorId: "player-2",
      players: [{ id: "player-1", name: "Alice" }],
    });

    const wrapper = mountWithService();
    wrapper.vm.submitDescription("desc");

    expect(mockGameClientService.submitDescription).not.toHaveBeenCalled();
  });

  it("should vote for impostor", () => {
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
    gameStore.setMyPlayer("player-1", "Alice");

    const wrapper = mountWithService();
    wrapper.vm.voteImpostor("player-2");

    expect(mockGameClientService.voteImpostor).toHaveBeenCalledWith(
      "game-123",
      "player-1",
      "player-2",
    );
  });

  it("should guess word", () => {
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

    const wrapper = mountWithService();
    wrapper.vm.guessWord("dog");

    expect(mockGameClientService.guessWord).toHaveBeenCalledWith(
      "game-123",
      "dog",
    );
  });
});
