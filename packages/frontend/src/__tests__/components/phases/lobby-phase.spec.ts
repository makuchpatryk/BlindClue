import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import LobbyPhase from "@/features/game/components/phases/lobby-phase.vue";
import { useGameStore } from "@/features/game/stores/game.store";

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template: "<button @click=\"$emit('click')\"><slot/></button>",
    emits: ["click"],
  },
}));

vi.mock("@/shared/components/heading.vue", () => ({
  default: { name: "Heading", template: "<h1><slot/></h1>" },
}));

describe("LobbyPhase", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render waiting text", () => {
    const wrapper = mount(LobbyPhase);
    expect(wrapper.text()).toContain("Waiting for players...");
  });

  it("should render players list", () => {
    const gameStore = useGameStore();
    gameStore.addPlayer({ id: "player-1", name: "Alice" });

    const wrapper = mount(LobbyPhase);
    expect(wrapper.text()).toContain("Players:");
  });

  it("should have start game button", () => {
    const gameStore = useGameStore();
    gameStore.addPlayer({ id: "p1", name: "A" });
    gameStore.addPlayer({ id: "p2", name: "B" });
    gameStore.addPlayer({ id: "p3", name: "C" });

    const wrapper = mount(LobbyPhase);
    expect(wrapper.findAll("button").length).toBeGreaterThan(0);
  });

  it("should emit events on button click", async () => {
    const wrapper = mount(LobbyPhase);
    const code = wrapper.find("code");

    await code.trigger("click");
    expect(wrapper.emitted("copyGameId")).toBeTruthy();
  });
});
