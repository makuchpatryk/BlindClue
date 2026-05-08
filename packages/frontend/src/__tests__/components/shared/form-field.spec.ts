import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import FormField from "@/shared/components/form-field.vue";

describe("FormField", () => {
  it("should render label", () => {
    const wrapper = mount(FormField, {
      props: { label: "Username" },
    });

    expect(wrapper.text()).toContain("Username");
  });

  it("should render slot content", () => {
    const wrapper = mount(FormField, {
      props: { label: "Password" },
      slots: {
        default: '<input type="password" />',
      },
    });

    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("should have label styling", () => {
    const wrapper = mount(FormField, {
      props: { label: "Email" },
    });

    const label = wrapper.find("label");
    expect(label.classes()).toContain("text-sm");
    expect(label.classes()).toContain("font-medium");
    expect(label.classes()).toContain("text-gray-300");
  });

  it("should have label with margin bottom", () => {
    const wrapper = mount(FormField, {
      props: { label: "Phone" },
    });

    const label = wrapper.find("label");
    expect(label.classes()).toContain("mb-2");
  });

  it("should render multiple form elements in slot", () => {
    const wrapper = mount(FormField, {
      props: { label: "Contact" },
      slots: {
        default: "<input/><textarea/>",
      },
    });

    expect(wrapper.find("input").exists()).toBe(true);
    expect(wrapper.find("textarea").exists()).toBe(true);
  });

  it("should be a block level element", () => {
    const wrapper = mount(FormField, {
      props: { label: "Field" },
    });

    const div = wrapper.find("div");
    expect(div.classes()).not.toContain("inline");
  });
});
