import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import InfoBox from "@/shared/components/info-box.vue";

describe("InfoBox", () => {
  it("should display title", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Score",
        value: "100",
      },
    });

    expect(wrapper.text()).toContain("Score");
  });

  it("should display value when provided", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Points",
        value: "250",
      },
    });

    expect(wrapper.text()).toContain("250");
  });

  it("should render slot instead of value", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Status",
        value: "offline",
      },
      slots: {
        default: "online",
      },
    });

    expect(wrapper.text()).toContain("online");
    expect(wrapper.text()).not.toContain("offline");
  });

  it("should have title with correct styling", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Title",
        value: "Value",
      },
    });

    const h3 = wrapper.find("h3");
    expect(h3.classes()).toContain("text-lg");
    expect(h3.classes()).toContain("font-semibold");
    expect(h3.classes()).toContain("text-gray-300");
  });

  it("should have value with correct styling", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Title",
        value: "Value",
      },
    });

    const p = wrapper.find("p");
    expect(p.classes()).toContain("text-xl");
    expect(p.classes()).toContain("text-white");
  });

  it("should apply default value color (yellow)", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Title",
        value: "Value",
      },
    });

    const span = wrapper.find("span");
    expect(span.classes()).toContain("text-yellow-400");
  });

  it("should apply custom value color", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Title",
        value: "Value",
        valueColor: "red-400",
      },
    });

    const span = wrapper.find("span");
    expect(span.classes()).toContain("text-red-400");
  });

  it("should render suffix slot", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Title",
        value: "Value",
      },
      slots: {
        suffix: " points",
      },
    });

    expect(wrapper.text()).toContain("points");
  });

  it("should have box styling", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Title",
        value: "Value",
      },
    });

    const box = wrapper.find("div");
    expect(box.classes()).toContain("bg-gray-700");
    expect(box.classes()).toContain("rounded-lg");
    expect(box.classes()).toContain("p-6");
  });

  it("should have value span with bold text", () => {
    const wrapper = mount(InfoBox, {
      props: {
        title: "Title",
        value: "Value",
      },
    });

    const span = wrapper.find("span");
    expect(span.classes()).toContain("font-bold");
  });
});
