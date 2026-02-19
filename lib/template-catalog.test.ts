/**
 * Unit tests for template catalog: 2 templates per business type, optional extraFields.
 */
import { describe, it, expect } from "vitest";
import {
  getTemplatesForBusinessType,
  getTemplateById,
  isTemplateValidForBusinessType,
  getDefaultTemplateIdForBusinessType,
  getLayoutIdForTemplate,
} from "./template-catalog";

describe("getTemplatesForBusinessType", () => {
  it("returns exactly 2 templates per business type", () => {
    expect(getTemplatesForBusinessType("salon")).toHaveLength(2);
    expect(getTemplatesForBusinessType("clinic")).toHaveLength(2);
    expect(getTemplatesForBusinessType("other")).toHaveLength(2);
  });

  it("returns templates with id, businessType, label, layoutId, and description", () => {
    const salon = getTemplatesForBusinessType("salon");
    expect(salon[0]).toHaveProperty("id");
    expect(salon[0]).toHaveProperty("businessType", "salon");
    expect(salon[0]).toHaveProperty("label");
    expect(salon[0]).toHaveProperty("layoutId");
    expect(["default", "classic", "minimal"]).toContain(salon[0].layoutId);
    expect(salon[0].description).toBeDefined();
    expect(typeof salon[0].description).toBe("string");
  });

  it("some templates have extraFields", () => {
    const salon = getTemplatesForBusinessType("salon");
    const withExtras = salon.find((t) => t.extraFields && t.extraFields.length > 0);
    expect(withExtras).toBeDefined();
    expect(withExtras!.extraFields![0]).toMatchObject({
      key: expect.any(String),
      label: expect.any(String),
    });
  });
});

describe("getTemplateById", () => {
  it("returns template when id exists", () => {
    const t = getTemplateById("salon-modern");
    expect(t).not.toBeNull();
    expect(t!.id).toBe("salon-modern");
    expect(t!.businessType).toBe("salon");
  });

  it("returns null for unknown id", () => {
    expect(getTemplateById("unknown")).toBeNull();
  });

  it("returns template with extraFields when present", () => {
    const t = getTemplateById("salon-classic");
    expect(t?.extraFields).toBeDefined();
    expect(t!.extraFields!.length).toBeGreaterThan(0);
  });
});

describe("isTemplateValidForBusinessType", () => {
  it("returns true when template belongs to business type", () => {
    expect(isTemplateValidForBusinessType("salon-modern", "salon")).toBe(true);
    expect(isTemplateValidForBusinessType("clinic-classic", "clinic")).toBe(true);
  });

  it("returns false when template id is for different business type", () => {
    expect(isTemplateValidForBusinessType("salon-modern", "clinic")).toBe(false);
  });

  it("returns false when template id is unknown", () => {
    expect(isTemplateValidForBusinessType("unknown", "salon")).toBe(false);
  });
});

describe("getDefaultTemplateIdForBusinessType", () => {
  it("returns first template id for business type", () => {
    expect(getDefaultTemplateIdForBusinessType("salon")).toBe("salon-modern");
    expect(getDefaultTemplateIdForBusinessType("other")).toBe("other-modern");
  });
});

describe("getLayoutIdForTemplate", () => {
  it("returns default for Modern templates", () => {
    expect(getLayoutIdForTemplate("salon-modern")).toBe("default");
    expect(getLayoutIdForTemplate("clinic-modern")).toBe("default");
  });

  it("returns classic for Classic templates", () => {
    expect(getLayoutIdForTemplate("salon-classic")).toBe("classic");
    expect(getLayoutIdForTemplate("other-classic")).toBe("classic");
  });

  it("returns default for unknown template id", () => {
    expect(getLayoutIdForTemplate("unknown")).toBe("default");
  });
});
