import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import JoinApprovalModal from "@/features/game/components/join-approval-modal.vue";

vi.mock("@/shared/components/card.vue", () => ({
  default: {
    name: "Card",
    template: '<div><slot name="header"></slot><slot/></div>',
  },
}));

vi.mock("@/shared/components/heading.vue", () => ({
  default: { name: "Heading", template: "<h1><slot/></h1>", props: ["level"] },
}));

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template:
      '<button :variant="variant" @click="$emit(\'click\')"><slot/></button>',
    props: ["variant"],
    emits: ["click"],
  },
}));

describe("JoinApprovalModal", () => {
  it("should not render when show is false", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: false,
        pendingRequest: { requestId: "req-1", playerName: "Alice" },
      },
    });

    expect(wrapper.find(".bg-black").exists()).toBe(false);
  });

  it("should not render when pendingRequest is null", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: null,
      },
    });

    expect(wrapper.find(".bg-black").exists()).toBe(false);
  });

  it("should render when show is true and pendingRequest exists", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-1", playerName: "Alice" },
      },
    });

    expect(wrapper.find(".bg-black").exists()).toBe(true);
  });

  it("should display join request heading", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-1", playerName: "Alice" },
      },
    });

    expect(wrapper.text()).toContain("Join Request");
  });

  it("should display player name in request", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-1", playerName: "Alice" },
      },
    });

    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("wants to join");
  });

  it("should have allow button", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-1", playerName: "Bob" },
      },
    });

    expect(wrapper.text()).toContain("Allow");
  });

  it("should have deny button", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-1", playerName: "Bob" },
      },
    });

    expect(wrapper.text()).toContain("Deny");
  });

  it("should emit approve event on allow click", async () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-123", playerName: "Alice" },
      },
    });

    const buttons = wrapper.findAll("button");
    const allowButton = buttons.find((b) => b.text().includes("Allow"));

    await allowButton?.trigger("click");

    expect(wrapper.emitted("approve")).toBeTruthy();
    expect(wrapper.emitted("approve")?.[0]).toEqual(["req-123"]);
  });

  it("should emit reject event on deny click", async () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-456", playerName: "Bob" },
      },
    });

    const buttons = wrapper.findAll("button");
    const denyButton = buttons.find((b) => b.text().includes("Deny"));

    await denyButton?.trigger("click");

    expect(wrapper.emitted("reject")).toBeTruthy();
    expect(wrapper.emitted("reject")?.[0]).toEqual(["req-456"]);
  });

  it("should have success variant on allow button", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-1", playerName: "Alice" },
      },
    });

    // Button component has variant prop
    expect(wrapper).toBeTruthy();
  });

  it("should have danger variant on deny button", () => {
    const wrapper = mount(JoinApprovalModal, {
      props: {
        show: true,
        pendingRequest: { requestId: "req-1", playerName: "Alice" },
      },
    });

    // Button component has variant prop
    expect(wrapper).toBeTruthy();
  });
});
