import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import CopiedSnackbar from "@/features/game/components/copied-snackbar.vue";

describe("CopiedSnackbar", () => {
  it("should not render when show is false", () => {
    const wrapper = mount(CopiedSnackbar, {
      props: { show: false },
    });

    expect(wrapper.find(".bg-green-600").exists()).toBe(false);
  });

  it("should render when show is true", () => {
    const wrapper = mount(CopiedSnackbar, {
      props: { show: true },
    });

    expect(wrapper.find(".bg-green-600").exists()).toBe(true);
  });

  it("should display copied message", () => {
    const wrapper = mount(CopiedSnackbar, {
      props: { show: true },
    });

    expect(wrapper.text()).toContain("Game ID copied to clipboard");
  });

  it("should display checkmark icon", () => {
    const wrapper = mount(CopiedSnackbar, {
      props: { show: true },
    });

    expect(wrapper.text()).toContain("✓");
  });

  it("should have green styling", () => {
    const wrapper = mount(CopiedSnackbar, {
      props: { show: true },
    });

    const div = wrapper.find(".bg-green-600");
    expect(div.classes()).toContain("text-white");
    expect(div.classes()).toContain("rounded");
  });

  it("should have fixed positioning", () => {
    const wrapper = mount(CopiedSnackbar, {
      props: { show: true },
    });

    const div = wrapper.find(".fixed");
    expect(div.classes()).toContain("bottom-4");
    expect(div.classes()).toContain("left-1/2");
    expect(div.classes()).toContain("transform");
    expect(div.classes()).toContain("-translate-x-1/2");
  });

  it("should have high z-index", () => {
    const wrapper = mount(CopiedSnackbar, {
      props: { show: true },
    });

    const div = wrapper.find(".z-40");
    expect(div.classes()).toContain("z-40");
  });

  it("should have shadow", () => {
    const wrapper = mount(CopiedSnackbar, {
      props: { show: true },
    });

    const div = wrapper.find(".shadow-lg");
    expect(div.classes()).toContain("shadow-lg");
  });
});
