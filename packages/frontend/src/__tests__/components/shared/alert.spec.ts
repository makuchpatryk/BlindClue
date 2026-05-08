import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import Alert from "@/shared/components/alert.vue";

describe("Alert", () => {
  it("should render alert with slot content", () => {
    const wrapper = mount(Alert, {
      slots: {
        default: "Alert message",
      },
    });

    expect(wrapper.text()).toContain("Alert message");
  });

  it("should have info variant by default", () => {
    const wrapper = mount(Alert);

    expect(wrapper.classes()).toContain("bg-blue-900");
    expect(wrapper.classes()).toContain("border-blue-600");
  });

  it("should apply success variant", () => {
    const wrapper = mount(Alert, {
      props: { variant: "success" },
    });

    expect(wrapper.classes()).toContain("bg-green-900");
    expect(wrapper.classes()).toContain("border-green-600");
  });

  it("should apply error variant", () => {
    const wrapper = mount(Alert, {
      props: { variant: "error" },
    });

    expect(wrapper.classes()).toContain("bg-red-900");
    expect(wrapper.classes()).toContain("border-red-600");
  });

  it("should apply warning variant", () => {
    const wrapper = mount(Alert, {
      props: { variant: "warning" },
    });

    expect(wrapper.classes()).toContain("bg-yellow-900");
    expect(wrapper.classes()).toContain("border-yellow-600");
  });

  it("should have correct text color for info", () => {
    const wrapper = mount(Alert, {
      slots: { default: "Info" },
      props: { variant: "info" },
    });

    const p = wrapper.find("p");
    expect(p.classes()).toContain("text-blue-400");
  });

  it("should have correct text color for success", () => {
    const wrapper = mount(Alert, {
      props: { variant: "success" },
    });

    const p = wrapper.find("p");
    expect(p.classes()).toContain("text-green-400");
  });

  it("should have correct text color for error", () => {
    const wrapper = mount(Alert, {
      props: { variant: "error" },
    });

    const p = wrapper.find("p");
    expect(p.classes()).toContain("text-red-400");
  });

  it("should have correct text color for warning", () => {
    const wrapper = mount(Alert, {
      props: { variant: "warning" },
    });

    const p = wrapper.find("p");
    expect(p.classes()).toContain("text-yellow-400");
  });

  it("should have base classes", () => {
    const wrapper = mount(Alert);

    expect(wrapper.classes()).toContain("p-4");
    expect(wrapper.classes()).toContain("rounded");
    expect(wrapper.classes()).toContain("border");
  });

  it("should have bold and large text", () => {
    const wrapper = mount(Alert);

    const p = wrapper.find("p");
    expect(p.classes()).toContain("font-bold");
    expect(p.classes()).toContain("text-lg");
  });
});
