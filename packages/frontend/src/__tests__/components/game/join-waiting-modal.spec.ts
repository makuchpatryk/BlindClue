import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import JoinWaitingModal from "@/features/game/components/join-waiting-modal.vue";

vi.mock("@/shared/components/card.vue", () => ({
  default: {
    name: "Card",
    template: '<div><slot name="header"></slot><slot/></div>',
  },
}));

vi.mock("@/shared/components/heading.vue", () => ({
  default: { name: "Heading", template: "<h1><slot/></h1>", props: ["level"] },
}));

describe("JoinWaitingModal", () => {
  it("should not render when show is false", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: false },
    });

    expect(wrapper.find(".bg-black").exists()).toBe(false);
  });

  it("should render when show is true", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: true },
    });

    expect(wrapper.find(".bg-black").exists()).toBe(true);
  });

  it("should display waiting message", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: true },
    });

    expect(wrapper.text()).toContain("Waiting for approval...");
  });

  it("should display instructions", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: true },
    });

    expect(wrapper.text()).toContain("reviewing your request");
  });

  it("should have backdrop overlay", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: true },
    });

    const backdrop = wrapper.find(".bg-black");
    expect(backdrop.classes()).toContain("fixed");
    expect(backdrop.classes()).toContain("inset-0");
    expect(backdrop.classes()).toContain("z-50");
  });

  it("should have card styling", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: true },
    });

    const card = wrapper.find("div");
    expect(card.exists()).toBe(true);
  });

  it("should center modal on screen", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: true },
    });

    const backdrop = wrapper.find(".bg-black");
    expect(backdrop.classes()).toContain("flex");
    expect(backdrop.classes()).toContain("items-center");
    expect(backdrop.classes()).toContain("justify-center");
  });

  it("should have responsive width", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: true },
    });

    const card = wrapper.find(".max-w-sm");
    expect(card.classes()).toContain("w-full");
  });

  it("should have gray text", () => {
    const wrapper = mount(JoinWaitingModal, {
      props: { show: true },
    });

    expect(wrapper.text()).toContain("host is reviewing");
    const p = wrapper.find("p");
    expect(p.classes()).toContain("text-gray-400");
  });
});
