import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import Modal from "@/shared/components/modal.vue";

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template:
      '<button :variant="variant" @click="$emit(\'click\')"><slot/></button>',
    props: ["variant"],
    emits: ["click"],
  },
}));

describe("Modal", () => {
  it("should not render when isOpen is false", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: false,
        title: "Test Modal",
      },
    });

    expect(wrapper.find(".bg-black").exists()).toBe(false);
  });

  it("should render when isOpen is true", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Test Modal",
      },
    });

    expect(wrapper.find(".bg-black").exists()).toBe(true);
  });

  it("should display title", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "My Modal Title",
      },
    });

    expect(wrapper.text()).toContain("My Modal Title");
  });

  it("should render slot content", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Modal",
      },
      slots: {
        default: "Modal body content",
      },
    });

    expect(wrapper.text()).toContain("Modal body content");
  });

  it("should always show close button", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Modal",
      },
    });

    expect(wrapper.text()).toContain("Close");
  });

  it("should show confirm button when confirmText provided", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Modal",
        confirmText: "Confirm",
      },
    });

    expect(wrapper.text()).toContain("Confirm");
  });

  it("should not show confirm button when confirmText not provided", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Modal",
      },
    });

    const buttons = wrapper.findAll("button");
    expect(buttons.length).toBe(1); // Only close button
  });

  it("should emit close event on close button click", async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Modal",
      },
    });

    const buttons = wrapper.findAll("button");
    const closeButton = buttons[0];

    await closeButton.trigger("click");

    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("should emit confirm event on confirm button click", async () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Modal",
        confirmText: "Save",
      },
    });

    const buttons = wrapper.findAll("button");
    const confirmButton = buttons[1];

    await confirmButton.trigger("click");

    expect(wrapper.emitted("confirm")).toBeTruthy();
  });

  it("should have backdrop styling", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Modal",
      },
    });

    const backdrop = wrapper.find(".bg-black");
    expect(backdrop.classes()).toContain("fixed");
    expect(backdrop.classes()).toContain("inset-0");
    expect(backdrop.classes()).toContain("z-50");
  });

  it("should have modal box styling", () => {
    const wrapper = mount(Modal, {
      props: {
        isOpen: true,
        title: "Modal",
      },
    });

    const box = wrapper.find(".bg-gray-800");
    expect(box.classes()).toContain("rounded-lg");
    expect(box.classes()).toContain("p-6");
    expect(box.classes()).toContain("w-96");
  });
});
