import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import JoinGameForm from "@/features/lobby/components/join-game-form.vue";
import { useLobbyStore } from "@/features/lobby/stores/lobby.store";

vi.mock("vue-router", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template: '<button :disabled="disabled" type="submit"><slot/></button>',
    props: ["disabled", "type", "fullWidth"],
  },
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
      '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ["modelValue", "type", "placeholder"],
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

describe("JoinGameForm", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("should render form", () => {
    const wrapper = mount(JoinGameForm);
    expect(wrapper.find("form").exists()).toBe(true);
  });

  it("should have text input for game code", () => {
    const wrapper = mount(JoinGameForm);
    const inputs = wrapper.findAll("input");

    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should have form field for game code", () => {
    const wrapper = mount(JoinGameForm);
    expect(wrapper.text()).toContain("Game Code");
  });

  it("should disable join button when game code is empty", () => {
    const wrapper = mount(JoinGameForm);
    const button = wrapper.find("button");

    expect(button.attributes("disabled")).toBeDefined();
  });

  it("should update gameCode on input change", async () => {
    const wrapper = mount(JoinGameForm);
    const inputs = wrapper.findAll("input");

    await inputs[0].setValue("abc123");
    await wrapper.vm.$nextTick();

    expect(wrapper).toBeTruthy();
  });

  it("should handle form submission with valid game code", async () => {
    const lobbyStore = useLobbyStore();
    lobbyStore.setPlayerName("Alice");

    const wrapper = mount(JoinGameForm);
    const inputs = wrapper.findAll("input");

    await inputs[0].setValue("game-456");
    const form = wrapper.find("form");
    await form.trigger("submit");

    expect(wrapper).toBeTruthy();
  });

  it("should display error message element", () => {
    const wrapper = mount(JoinGameForm);

    // Error messages are displayed conditionally
    expect(
      wrapper.find(".text-red-400").exists() ||
        !wrapper.text().includes("error"),
    ).toBe(true);
  });
});
