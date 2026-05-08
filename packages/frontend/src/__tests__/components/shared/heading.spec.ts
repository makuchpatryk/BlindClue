import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Heading from "@/shared/components/heading.vue";

describe("Heading", () => {
  it("should render h2 by default", () => {
    const wrapper = mount(Heading, {
      slots: { default: "Title" },
    });

    expect(wrapper.element.tagName).toBe("H2");
  });

  it("should render h3 when level is 3", () => {
    const wrapper = mount(Heading, {
      props: { level: 3 },
      slots: { default: "Subtitle" },
    });

    expect(wrapper.element.tagName).toBe("H3");
  });

  it("should display slot content", () => {
    const wrapper = mount(Heading, {
      slots: { default: "My Heading" },
    });

    expect(wrapper.text()).toContain("My Heading");
  });

  it("should have primary variant by default", () => {
    const wrapper = mount(Heading, {
      slots: { default: "Title" },
    });

    expect(wrapper.classes()).toContain("text-2xl");
  });

  it("should apply secondary variant to h2", () => {
    const wrapper = mount(Heading, {
      props: { variant: "secondary" },
      slots: { default: "Title" },
    });

    expect(wrapper.classes()).toContain("text-xl");
    expect(wrapper.classes()).toContain("text-gray-300");
  });

  it("should apply secondary variant to h3", () => {
    const wrapper = mount(Heading, {
      props: { level: 3, variant: "secondary" },
      slots: { default: "Subtitle" },
    });

    expect(wrapper.classes()).toContain("text-lg");
    expect(wrapper.classes()).toContain("text-gray-300");
  });

  it("should apply tertiary variant", () => {
    const wrapper = mount(Heading, {
      props: { variant: "tertiary" },
      slots: { default: "Text" },
    });

    expect(wrapper.classes()).toContain("text-lg");
    expect(wrapper.classes()).toContain("text-gray-400");
  });

  it("should have bold and white text for primary", () => {
    const wrapper = mount(Heading);

    expect(wrapper.classes()).toContain("font-bold");
    expect(wrapper.classes()).toContain("text-white");
  });

  it("should apply custom classes via $attrs", () => {
    const wrapper = mount(Heading, {
      attrs: { class: "custom-heading" },
    });

    expect(wrapper.classes()).toContain("custom-heading");
  });

  it("should have margin bottom for h2 primary", () => {
    const wrapper = mount(Heading, {
      props: { level: 2, variant: "primary" },
    });

    expect(wrapper.classes()).toContain("mb-6");
  });

  it("should have margin bottom for h3 primary", () => {
    const wrapper = mount(Heading, {
      props: { level: 3, variant: "primary" },
    });

    expect(wrapper.classes()).toContain("mb-4");
  });
});
