import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Card from "@/shared/components/card.vue";

describe("Card", () => {
  it("should render card with default slot", () => {
    const wrapper = mount(Card, {
      slots: {
        default: "Card content",
      },
    });

    expect(wrapper.text()).toContain("Card content");
  });

  it("should render header slot when provided", () => {
    const wrapper = mount(Card, {
      slots: {
        header: "Card header",
        default: "Card content",
      },
    });

    expect(wrapper.text()).toContain("Card header");
    expect(wrapper.text()).toContain("Card content");
  });

  it("should apply base card classes", () => {
    const wrapper = mount(Card);

    expect(wrapper.classes()).toContain("bg-gray-700");
    expect(wrapper.classes()).toContain("rounded-lg");
    expect(wrapper.classes()).toContain("shadow");
    expect(wrapper.classes()).toContain("p-6");
  });

  it("should render header with margin bottom", () => {
    const wrapper = mount(Card, {
      slots: {
        header: "Header",
      },
    });

    const headerDiv = wrapper.find(".mb-4");
    expect(headerDiv.exists()).toBe(true);
  });

  it("should not render header div when header slot is empty", () => {
    const wrapper = mount(Card, {
      slots: {
        default: "Content only",
      },
    });

    const headerDiv = wrapper.find(".mb-4");
    expect(headerDiv.exists()).toBe(false);
  });

  it("should preserve custom classes via $attrs", () => {
    const wrapper = mount(Card, {
      attrs: { class: "custom-card" },
    });

    expect(wrapper.classes()).toContain("custom-card");
  });

  it("should handle multiple nested elements in slot", () => {
    const wrapper = mount(Card, {
      slots: {
        default: "<div>Line 1</div><div>Line 2</div>",
      },
    });

    expect(wrapper.html()).toContain("Line 1");
    expect(wrapper.html()).toContain("Line 2");
  });

  it("should have correct structure with header", () => {
    const wrapper = mount(Card, {
      slots: {
        header: "Title",
        default: "Content",
      },
    });

    const main = wrapper.find("div");
    expect(main.classes()).toContain("bg-gray-700");

    const children = wrapper.element.children;
    expect(children.length).toBeGreaterThanOrEqual(1);
  });
});
