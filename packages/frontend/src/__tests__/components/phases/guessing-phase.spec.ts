import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import GuessingPhase from "@/features/game/components/phases/guessing-phase.vue";

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template:
      '<button :disabled="disabled" :type="type" @click="$emit(\'click\')"><slot/></button>',
    props: ["disabled", "type", "fullWidth", "variant"],
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
  default: { name: "Heading", template: "<h1><slot/></h1>", props: ["level"] },
}));

vi.mock("@/shared/components/input.vue", () => ({
  default: {
    name: "Input",
    template:
      '<input :value="modelValue" :disabled="disabled" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ["modelValue", "type", "placeholder", "disabled"],
    emits: ["update:modelValue"],
  },
}));

vi.mock("@/shared/components/alert.vue", () => ({
  default: {
    name: "Alert",
    template: '<div v-if="variant"><slot/></div>',
    props: ["variant"],
  },
}));

vi.mock("@/features/game/composables/use-game-facade.js", () => ({
  useGameFacade: () => ({
    gameStore: {},
    guessWord: vi.fn(),
  }),
}));

describe("GuessingPhase", () => {
  const mountOptions = {
    global: {
      provide: {
        gameClientService: null,
      },
    },
  };

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render impostor guessing form when isImpostor is true", () => {
    const wrapper = mount(GuessingPhase, {
      ...mountOptions,
      props: { isImpostor: true },
      ...mountOptions,
    });

    expect(wrapper.text()).toContain("Impostor's Turn to Guess");
  });

  it("should render waiting message when isImpostor is false", () => {
    const wrapper = mount(GuessingPhase, {
      ...mountOptions,
      props: { isImpostor: false },
    });

    expect(wrapper.text()).toContain("Waiting for Impostor");
  });

  it("should show input field for impostor", () => {
    const wrapper = mount(GuessingPhase, {
      ...mountOptions,
      props: { isImpostor: true },
    });

    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("should not show input field when not impostor", () => {
    const wrapper = mount(GuessingPhase, {
      ...mountOptions,
      props: { isImpostor: false },
    });

    expect(wrapper.find("input").exists()).toBe(false);
  });

  it("should disable submit button when input is empty", () => {
    const wrapper = mount(GuessingPhase, {
      ...mountOptions,
      props: { isImpostor: true },
    });

    const buttons = wrapper.findAll("button");
    const submitButton = buttons.find((b) => b.text().includes("Submit"));

    expect(submitButton?.attributes("disabled")).toBeDefined();
  });

  it("should enable submit button when input has value", async () => {
    const wrapper = mount(GuessingPhase, {
      ...mountOptions,
      props: { isImpostor: true },
    });

    const input = wrapper.find("input");
    await input.setValue("cat");

    const buttons = wrapper.findAll("button");
    const submitButton = buttons.find((b) => b.text().includes("Submit"));

    expect(submitButton?.attributes("disabled")).not.toBeDefined();
  });

  it("should show success alert after guess submitted", async () => {
    const wrapper = mount(GuessingPhase, {
      ...mountOptions,
      props: { isImpostor: true },
    });

    const input = wrapper.find("input");
    await input.setValue("cat");

    const form = wrapper.find("form");
    await form.trigger("submit");

    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("Guess submitted!");
  });

  it("should handle empty guess submission", async () => {
    const wrapper = mount(GuessingPhase, {
      ...mountOptions,
      props: { isImpostor: true },
    });

    const input = wrapper.find("input");
    await input.setValue("   ");

    const buttons = wrapper.findAll("button");
    const submitButton = buttons.find((b) => b.text().includes("Submit"));

    expect(submitButton?.attributes("disabled")).toBeDefined();
  });
});
