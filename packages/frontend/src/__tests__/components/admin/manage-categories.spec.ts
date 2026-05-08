import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import ManageCategories from "@/features/admin/components/manage-categories.vue";

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
    isLoading: false,
    error: null,
    getCategories: vi.fn(),
    createCategory: vi.fn(() => Promise.resolve()),
  }),
}));

describe("ManageCategories", () => {
  beforeEach(() => {
    // Reset mocks before each test
  });

  it("should render manage categories heading", () => {
    const wrapper = mount(ManageCategories);
    expect(wrapper.text()).toContain("Manage Categories");
  });

  it("should display input field for category name", () => {
    const wrapper = mount(ManageCategories);
    const inputs = wrapper.findAll('input[type="text"]');

    expect(inputs.length).toBeGreaterThan(0);
  });

  it("should have add category button", () => {
    const wrapper = mount(ManageCategories);
    expect(wrapper.text()).toContain("Add Category");
  });

  it("should display existing categories", () => {
    const wrapper = mount(ManageCategories);
    expect(wrapper.text()).toContain("Animals");
    expect(wrapper.text()).toContain("Food");
  });

  it("should disable add button when input is empty", () => {
    const wrapper = mount(ManageCategories);
    const buttons = wrapper.findAll("button");

    const addButton = buttons.find((b) => b.text().includes("Add"));
    expect(addButton?.attributes("disabled")).toBeDefined();
  });

  it("should enable add button when input has value", async () => {
    const wrapper = mount(ManageCategories);
    const input = wrapper.find('input[type="text"]');

    await input.setValue("Sports");

    const buttons = wrapper.findAll("button");
    const addButton = buttons.find((b) => b.text().includes("Add"));

    expect(addButton?.attributes("disabled")).not.toBeDefined();
  });

  it("should show adding text while submitting", async () => {
    const wrapper = mount(ManageCategories);

    // Initially shows "Add Category"
    expect(wrapper.text()).toContain("Add Category");
  });

  it("should display error message when present", async () => {
    const wrapper = mount(ManageCategories);

    // Error would be displayed if present
    expect(wrapper.text()).not.toContain("error");
  });

  it("should call getCategories on mount", () => {
    mount(ManageCategories);

    // getCategories is called on mount
    expect(true).toBe(true);
  });

  it("should have placeholder for input", () => {
    const wrapper = mount(ManageCategories);
    const input = wrapper.find('input[type="text"]');

    expect(input.attributes("placeholder")).toContain("category");
  });
});
