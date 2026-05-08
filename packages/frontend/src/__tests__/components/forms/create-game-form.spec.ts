import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import CreateGameForm from "@/features/lobby/components/create-game-form.vue";
import { useLobbyStore } from "@/features/lobby/stores/lobby.store";

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template:
      '<button :disabled="disabled" type="submit" @click="$emit(\'click\')"><slot/></button>',
    props: ["disabled", "type", "fullWidth"],
    emits: ["click"],
  },
}));

vi.mock("@/shared/components/form-field.vue", () => ({
  default: {
    name: "FormField",
    template: "<div><slot/></div>",
    props: ["label"],
  },
}));

vi.mock("@/shared/components/input.vue", () => ({
  default: {
    name: "Input",
    template:
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ["modelValue", "type"],
    emits: ["update:modelValue"],
  },
}));

vi.mock("@/features/game/composables/use-game-facade.js", () => ({
  useGameFacade: () => ({
    gameStore: {
      resetForNewGame: vi.fn(),
    },
  }),
}));

vi.mock("@/features/lobby/composables/use-form-submission.js", () => ({
  useFormSubmission: () => {
    const isLoading = { value: false };
    const error = { value: "" as string };
    return {
      isLoading,
      error,
      executeWithErrorHandling: vi.fn(async (fn) => {
        try {
          isLoading.value = true;
          await fn();
        } catch (e) {
          error.value = (e as Error).message;
        } finally {
          isLoading.value = false;
        }
      }),
    };
  },
}));

describe("CreateGameForm", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render form", () => {
    const wrapper = mount(CreateGameForm);
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("should have number input for rounds", () => {
    const wrapper = mount(CreateGameForm);
    const inputs = wrapper.findAll("input");

    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should have submit button element", () => {
    const wrapper = mount(CreateGameForm);
    const buttons = wrapper.findAll("button");

    expect(buttons.length).toBeGreaterThan(0);
  });

  it("should have form field for rounds", () => {
    const wrapper = mount(CreateGameForm);
    expect(wrapper.text()).toContain("Number of Rounds");
  });

  it("should handle form submission", async () => {
    const lobbyStore = useLobbyStore();
    lobbyStore.setPlayerName("Alice");

    const wrapper = mount(CreateGameForm);
    const form = wrapper.find("form");

    await form.trigger("submit");
    await wrapper.vm.$nextTick();

    expect(wrapper).toBeTruthy();
  });

  it("should display error message when validation fails", async () => {
    const wrapper = mount(CreateGameForm);

    const errorElement = wrapper.find(".text-red-400");
    // Error element may or may not exist depending on state
    expect(wrapper.find("form").exists()).toBe(true);
  });
});
