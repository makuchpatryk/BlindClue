import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import RunningPhase from "@/features/game/components/phases/running-phase.vue";
import { useGameStore } from "@/features/game/stores/game.store";

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template:
      '<button :disabled="disabled" @click="$emit(\'click\')"><slot/></button>',
    props: ["disabled", "variantColor", "fullWidth", "variant"],
    emits: ["click"],
  },
}));

vi.mock("@/shared/components/card.vue", () => ({
  default: { name: "Card", template: "<div><slot/></div>" },
}));

vi.mock("@/shared/components/heading.vue", () => ({
  default: { name: "Heading", template: "<h1><slot/></h1>" },
}));

vi.mock("@/shared/components/form-field.vue", () => ({
  default: {
    name: "FormField",
    template: "<div><label>{{ label }}</label><slot/></div>",
    props: ["label"],
  },
}));

vi.mock("@/shared/components/input.vue", () => ({
  default: {
    name: "Input",
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @keydown.enter="$emit(\'keydown.enter\')" />',
    props: ["modelValue", "type", "placeholder", "autofocus"],
    emits: ["update:modelValue", "keydown.enter"],
  },
}));

vi.mock("@/shared/components/alert.vue", () => ({
  default: {
    name: "Alert",
    template: '<div v-if="variant"><slot/></div>',
    props: ["variant"],
  },
}));

vi.mock("@/features/game/components/player-selection-list.vue", () => ({
  default: {
    name: "PlayerSelectionList",
    template: "<div>Players</div>",
    props: ["disabled"],
  },
}));

const mockGameStore = {
  currentRound: 1,
  numberOfRounds: 3,
  category: "Animals",
  word: "dog",
  isImpostor: false,
  players: [
    { id: "p1", name: "Alice" },
    { id: "p2", name: "Bob" },
  ],
  currentPlayer: { id: "p1", name: "Alice" },
  myPlayerName: "Alice",
  roundNumber: 1,
  myPlayerId: "p1",
  selectedImpostorGuess: null,
  playerWords: new Map(),
  playersClickedThisRound: new Set(),
};

vi.mock("@/features/game/composables/use-game-facade.js", () => ({
  useGameFacade: () => ({
    gameStore: mockGameStore,
  }),
}));

describe("RunningPhase", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    mockGameStore.isImpostor = false;
    mockGameStore.category = "Animals";
    mockGameStore.word = "dog";
    mockGameStore.currentPlayer = { id: "p1", name: "Alice" };
    mockGameStore.myPlayerId = "p1";
    mockGameStore.currentRound = 1;
    mockGameStore.numberOfRounds = 3;
    mockGameStore.playerWords = new Map();
    mockGameStore.playersClickedThisRound = new Set();
  });

  it("should show impostor alert when player is impostor", () => {
    mockGameStore.isImpostor = true;

    const wrapper = mount(RunningPhase);
    expect(wrapper.text()).toContain("YOU ARE THE IMPOSTOR");
  });

  it("should show category hidden for non-impostor", () => {
    mockGameStore.isImpostor = false;

    const wrapper = mount(RunningPhase);
    expect(wrapper.text()).toContain("???");
  });

  it("should show category visible for impostor", () => {
    mockGameStore.isImpostor = true;
    mockGameStore.category = "Animals";

    const wrapper = mount(RunningPhase);
    expect(wrapper.text()).toContain("Animals");
  });

  it("should show word only for non-impostor", () => {
    mockGameStore.isImpostor = false;
    mockGameStore.word = "dog";

    const wrapper = mount(RunningPhase);
    expect(wrapper.text()).toContain("dog");
  });

  it("should not show word for impostor", () => {
    mockGameStore.isImpostor = true;
    mockGameStore.word = "dog";

    const wrapper = mount(RunningPhase);
    expect(wrapper.text()).not.toContain("dog");
  });

  it("should show input field when it is current player turn", () => {
    mockGameStore.isImpostor = false;
    mockGameStore.currentPlayer = { id: "p1", name: "Alice" };
    mockGameStore.myPlayerId = "p1";

    const wrapper = mount(RunningPhase);
    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("should show round information", () => {
    mockGameStore.isImpostor = false;

    const wrapper = mount(RunningPhase);
    expect(wrapper.text()).toContain("ROUND");
  });

  it("should disable next person button when input is empty", () => {
    mockGameStore.isImpostor = false;
    mockGameStore.currentPlayer = { id: "p1", name: "Alice" };
    mockGameStore.myPlayerId = "p1";

    const wrapper = mount(RunningPhase);
    const buttons = wrapper.findAll("button");

    expect(buttons[0].attributes("disabled")).toBeDefined();
  });
});
