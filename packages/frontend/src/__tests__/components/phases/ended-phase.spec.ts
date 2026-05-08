import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import EndedPhase from "@/features/game/components/phases/ended-phase.vue";
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

vi.mock("@/shared/components/heading.vue", () => ({
  default: {
    name: "Heading",
    template: "<h1><slot/></h1>",
    props: ["level", "variant"],
  },
}));

vi.mock("@/shared/components/info-box.vue", () => ({
  default: {
    name: "InfoBox",
    template: "<div><h3>{{ title }}</h3><slot/></div>",
    props: ["title", "valueColor"],
  },
}));

vi.mock("@/shared/components/card.vue", () => ({
  default: {
    name: "Card",
    template: '<div><slot name="header"></slot><slot/></div>',
  },
}));


describe("EndedPhase", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    const gameStore = useGameStore();
    gameStore.setPlayers([
      { id: "p1", name: "Alice" },
      { id: "p2", name: "Bob" },
    ]);
    gameStore.votes = new Map([
      ["p1", 3],
      ["p2", 2],
    ]);
    gameStore.impostorId = "p2";
    gameStore.setWord("dog");
    gameStore.impostorGuess = "cat";
    gameStore.guessResult = false;
  });

  it("should render game over heading", () => {
    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("Game Over");
  });

  it("should display most voted player", () => {
    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("Most Voted");
  });

  it("should display impostor name", () => {
    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("The Impostor Was");
  });

  it("should display the word", () => {
    const gameStore = useGameStore();
    gameStore.setWord("dog");

    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("dog");
  });

  it("should show impostor guess when it exists", () => {
    const gameStore = useGameStore();
    gameStore.impostorGuess = "cat";

    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("cat");
  });

  it("should show guess result as correct", () => {
    const gameStore = useGameStore();
    gameStore.impostorGuess = "dog";
    gameStore.guessResult = true;

    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("Correct!");
  });

  it("should show guess result as wrong", () => {
    const gameStore = useGameStore();
    gameStore.impostorGuess = "cat";
    gameStore.guessResult = false;

    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("Wrong");
  });

  it("should display vote results", () => {
    const gameStore = useGameStore();
    gameStore.votes = new Map([["p1", 3]]);

    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("Vote Results");
  });

  it("should show play again button", () => {
    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("Play Again");
  });

  it("should emit playAgain event on button click", async () => {
    const wrapper = mount(EndedPhase);
    const buttons = wrapper.findAll("button");

    const playAgainButton = buttons.find((b) =>
      b.text().includes("Play Again"),
    );
    await playAgainButton?.trigger("click");

    expect(wrapper.emitted("playAgain")).toBeTruthy();
  });

  it("should handle votes with singular vote", () => {
    const gameStore = useGameStore();
    gameStore.votes = new Map([["p1", 1]]);

    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("1 vote");
  });

  it("should handle multiple votes with plural", () => {
    const gameStore = useGameStore();
    gameStore.votes = new Map([["p1", 3]]);

    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).toContain("votes");
  });

  it("should not show impostor guess section when guess is null", () => {
    const gameStore = useGameStore();
    gameStore.impostorGuess = null;

    const wrapper = mount(EndedPhase);
    expect(wrapper.text()).not.toContain("Impostor Guessed");
  });
});
