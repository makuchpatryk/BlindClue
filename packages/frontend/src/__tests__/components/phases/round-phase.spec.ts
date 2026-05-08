import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import RoundPhase from "@/features/game/components/phases/round-phase.vue";
import { useGameStore } from "@/features/game/stores/game.store";

vi.mock("@/shared/components/card.vue", () => ({
  default: {
    name: "Card",
    template: '<div><slot name="header"></slot><slot/></div>',
  },
}));

vi.mock("@/shared/components/heading.vue", () => ({
  default: { name: "Heading", template: "<h1><slot/></h1>", props: ["level"] },
}));

vi.mock("@/shared/components/alert.vue", () => ({
  default: {
    name: "Alert",
    template: "<div><slot/></div>",
    props: ["variant"],
  },
}));

vi.mock("@/features/game/composables/use-game-facade.js", () => ({
  useGameFacade: () => ({
    gameStore: {
      currentRound: 1,
      numberOfRounds: 3,
      category: "Animals",
      isImpostor: false,
      players: [
        { id: "p1", name: "Alice" },
        { id: "p2", name: "Bob" },
      ],
      impostorId: "p2",
    },
  }),
}));

describe("RoundPhase", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should display round number", () => {
    const wrapper = mount(RoundPhase);
    expect(wrapper.text()).toContain("Round 1/3");
  });

  it("should display category", () => {
    const wrapper = mount(RoundPhase);
    expect(wrapper.text()).toContain("Animals");
  });

  it("should render all players", () => {
    const wrapper = mount(RoundPhase);
    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("Bob");
  });

  it("should display alert message", () => {
    const wrapper = mount(RoundPhase);
    const hasImpostorOrWord =
      wrapper.text().includes("Impostor") || wrapper.text().includes("word");
    expect(hasImpostorOrWord).toBe(true);
  });

  it("should show players in this round", () => {
    const wrapper = mount(RoundPhase);
    expect(wrapper.text()).toContain("Players in this round:");
  });
});
