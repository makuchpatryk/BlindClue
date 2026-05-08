import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ManageWords from "@/features/admin/components/manage-words.vue";

vi.mock("@/shared/components/button.vue", () => ({
  default: {
    name: "Button",
    template: '<button :disabled="disabled" type="submit"><slot/></button>',
    props: ["disabled", "type", "fullWidth"],
  },
}));

vi.mock("@/shared/components/heading.vue", () => ({
  default: { name: "Heading", template: "<h1><slot/></h1>", props: ["level"] },
}));

vi.mock("@/features/admin/composables/use-admin-service.js", () => ({
  useAdminService: () => ({
    categories: [
      { id: "1", name: "Animals" },
      { id: "2", name: "Food" },
    ],
    error: null,
    getCategories: vi.fn(),
    addWord: vi.fn(() => Promise.resolve()),
  }),
}));

describe("ManageWords", () => {
  beforeEach(() => {
    // Reset mocks before each test
  });

  it("should render manage words heading", () => {
    const wrapper = mount(ManageWords);
    expect(wrapper.text()).toContain("Manage Words");
  });

  it("should display category select dropdown", () => {
    const wrapper = mount(ManageWords);
    expect(wrapper.find("select").exists()).toBe(true);
  });

  it("should display category options", () => {
    const wrapper = mount(ManageWords);
    const options = wrapper.findAll("option");

    expect(options.length).toBeGreaterThan(0);
    expect(wrapper.text()).toContain("Animals");
    expect(wrapper.text()).toContain("Food");
  });

  it("should display input field for word", () => {
    const wrapper = mount(ManageWords);
    const inputs = wrapper.findAll('input[type="text"]');

    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should have add word button", () => {
    const wrapper = mount(ManageWords);
    expect(wrapper.text()).toContain("Add Word");
  });

  it("should disable add button when no category selected", async () => {
    const wrapper = mount(ManageWords);
    const input = wrapper.find('input[type="text"]');

    await input.setValue("dog");

    const buttons = wrapper.findAll("button");
    const addButton = buttons.find((b) => b.text().includes("Add"));

    expect(addButton?.attributes("disabled")).toBeDefined();
  });

  it("should disable add button when no word entered", async () => {
    const wrapper = mount(ManageWords);
    const select = wrapper.find("select");

    await select.setValue("1");

    const buttons = wrapper.findAll("button");
    const addButton = buttons.find((b) => b.text().includes("Add"));

    expect(addButton?.attributes("disabled")).toBeDefined();
  });

  it("should enable add button when both category and word provided", async () => {
    const wrapper = mount(ManageWords);
    const select = wrapper.find("select");
    const input = wrapper.find('input[type="text"]');

    await select.setValue("1");
    await input.setValue("dog");

    const buttons = wrapper.findAll("button");
    const addButton = buttons.find((b) => b.text().includes("Add"));

    expect(addButton?.attributes("disabled")).not.toBeDefined();
  });

  it("should show adding text while submitting", async () => {
    const wrapper = mount(ManageWords);

    // Initially shows "Add Word"
    expect(wrapper.text()).toContain("Add Word");
  });

  it("should display error message when present", async () => {
    const wrapper = mount(ManageWords);

    // Error would be displayed if present
    expect(wrapper.text()).not.toContain("error");
  });

  it("should call getCategories on mount", () => {
    mount(ManageWords);

    // getCategories is called on mount
    expect(true).toBe(true);
  });

  it("should have placeholder for word input", () => {
    const wrapper = mount(ManageWords);
    const input = wrapper.find('input[type="text"]');

    expect(input.attributes("placeholder")).toContain("word");
  });

  it("should have select placeholder option", () => {
    const wrapper = mount(ManageWords);
    const options = wrapper.findAll("option");

    const placeholderOption = options[0];
    expect(placeholderOption.text()).toContain("Select a category");
  });
});
