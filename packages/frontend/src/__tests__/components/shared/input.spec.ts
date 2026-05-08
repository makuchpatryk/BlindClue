import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Input from "@/shared/components/input.vue";

describe("Input", () => {
  it("should render input element", () => {
    const wrapper = mount(Input);

    expect(wrapper.find("input").exists()).toBe(true);
  });

  it("should have text type by default", () => {
    const wrapper = mount(Input);

    expect(wrapper.attributes("type")).toBe("text");
  });

  it("should accept different input types", () => {
    const types: Array<"text" | "number" | "password" | "email"> = [
      "text",
      "number",
      "password",
      "email",
    ];

    types.forEach((type) => {
      const wrapper = mount(Input, {
        props: { type },
      });

      expect(wrapper.attributes("type")).toBe(type);
    });
  });

  it("should display placeholder text", () => {
    const wrapper = mount(Input, {
      props: { placeholder: "Enter your name" },
    });

    expect(wrapper.attributes("placeholder")).toBe("Enter your name");
  });

  it("should set model value", () => {
    const wrapper = mount(Input, {
      props: { modelValue: "test value" },
    });

    expect(wrapper.element.value).toBe("test value");
  });

  it("should emit update:modelValue on input", async () => {
    const wrapper = mount(Input);

    await wrapper.setValue("hello");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
    expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["hello"]);
  });

  it("should handle numeric input", async () => {
    const wrapper = mount(Input, {
      props: { type: "number" },
    });

    await wrapper.setValue("42");

    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });

  it("should apply full-width class by default", () => {
    const wrapper = mount(Input);

    expect(wrapper.classes()).toContain("w-full");
  });

  it("should not apply full-width when disabled", () => {
    const wrapper = mount(Input, {
      props: { fullWidth: false },
    });

    expect(wrapper.classes()).not.toContain("w-full");
  });

  it("should have styling classes", () => {
    const wrapper = mount(Input);

    expect(wrapper.classes()).toContain("bg-gray-700");
    expect(wrapper.classes()).toContain("border");
    expect(wrapper.classes()).toContain("rounded");
  });

  it("should support v-model binding", async () => {
    let value: string | number = "";
    const wrapper = mount(Input, {
      props: {
        modelValue: value,
        "onUpdate:modelValue": (v: string | number) => {
          value = v;
        },
      },
    });

    await wrapper.setValue("new value");

    expect(value).toBe("new value");
  });

  it("should preserve custom classes via $attrs", () => {
    const wrapper = mount(Input, {
      attrs: { class: "custom-class" },
    });

    expect(wrapper.classes()).toContain("custom-class");
  });
});
