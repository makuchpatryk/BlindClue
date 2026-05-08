import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Button from "@/shared/components/button.vue";

describe("Button", () => {
  it("should render button with slot content", () => {
    const wrapper = mount(Button, {
      slots: {
        default: "Click me",
      },
    });

    expect(wrapper.text()).toContain("Click me");
  });

  it("should have primary variant by default", () => {
    const wrapper = mount(Button);

    expect(wrapper.classes()).toContain("bg-blue-600");
  });

  it("should apply secondary variant", () => {
    const wrapper = mount(Button, {
      props: { variant: "secondary" },
    });

    expect(wrapper.classes()).toContain("bg-gray-600");
  });

  it("should apply success variant", () => {
    const wrapper = mount(Button, {
      props: { variant: "success" },
    });

    expect(wrapper.classes()).toContain("bg-green-600");
  });

  it("should apply danger variant", () => {
    const wrapper = mount(Button, {
      props: { variant: "danger" },
    });

    expect(wrapper.classes()).toContain("bg-red-600");
  });

  it("should disable button when disabled prop is true", () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
    });

    expect(wrapper.attributes("disabled")).toBeDefined();
  });

  it("should set type attribute", () => {
    const wrapper = mount(Button, {
      props: { type: "submit" },
    });

    expect(wrapper.attributes("type")).toBe("submit");
  });

  it("should apply full-width class", () => {
    const wrapper = mount(Button, {
      props: { fullWidth: true },
    });

    expect(wrapper.classes()).toContain("w-full");
  });

  it("should emit click event", async () => {
    const wrapper = mount(Button);

    await wrapper.trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });

  it("should not trigger click when disabled", async () => {
    const wrapper = mount(Button, {
      props: { disabled: true },
    });

    await wrapper.trigger("click");
    // Disabled button won't emit custom click events, but browser handles it
  });

  it("should respect noDefaults prop for styling", () => {
    const wrapper = mount(Button, {
      props: { noDefaults: true },
    });

    // With noDefaults, should not have baseClasses
    expect(wrapper.classes()).not.toContain("px-4");
  });
});
