/**
 * Publish route tests (TDD).
 * - stripAssistantPrefilledFromDraft: published snapshot must not contain editor-only _assistantPrefilledFields.
 */
import { describe, it, expect } from "vitest";
import { stripAssistantPrefilledFromDraft } from "@/lib/strip-assistant-prefilled";

describe("stripAssistantPrefilledFromDraft", () => {
  it("removes _assistantPrefilledFields from each locale in draft_content", () => {
    const draft = {
      en: {
        businessName: "Acme",
        tagline: "Best in town",
        _assistantPrefilledFields: ["businessName", "tagline"],
      },
      hi: {
        businessName: "एक्मे",
        _assistantPrefilledFields: ["businessName"],
      },
    };
    const result = stripAssistantPrefilledFromDraft(draft);
    expect(result).not.toBe(draft);
    expect(result?.en).toBeDefined();
    expect((result?.en as Record<string, unknown>)._assistantPrefilledFields).toBeUndefined();
    expect((result?.en as Record<string, unknown>).businessName).toBe("Acme");
    expect(result?.hi).toBeDefined();
    expect((result?.hi as Record<string, unknown>)._assistantPrefilledFields).toBeUndefined();
  });

  it("returns null for null or undefined input", () => {
    expect(stripAssistantPrefilledFromDraft(null)).toBeNull();
    expect(stripAssistantPrefilledFromDraft(undefined)).toBeNull();
  });

  it("returns empty object when draft_content is empty", () => {
    const result = stripAssistantPrefilledFromDraft({});
    expect(result).toEqual({});
  });

  it("leaves other locale keys unchanged when only _assistantPrefilledFields is present", () => {
    const draft = {
      en: {
        _assistantPrefilledFields: ["businessName"],
        businessName: "Joe",
      },
    };
    const result = stripAssistantPrefilledFromDraft(draft);
    expect((result?.en as Record<string, unknown>).businessName).toBe("Joe");
    expect((result?.en as Record<string, unknown>)._assistantPrefilledFields).toBeUndefined();
  });
});
