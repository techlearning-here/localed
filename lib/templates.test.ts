/**
 * Unit tests for lib/templates (SITES-01 related: slug validation, initial draft content).
 * FEATURE_LIST_TDD: SITES-01.3 (invalid slug), SITES-01.5 (languages).
 */
import { describe, it, expect } from "vitest";
import { buildInitialDraftContent, buildDraftContentFromTemplate, isValidSlug } from "./templates";

describe("isValidSlug", () => {
  it("SITES-01.3: accepts valid lowercase alphanumeric and hyphens", () => {
    expect(isValidSlug("joes-salon")).toBe(true);
    expect(isValidSlug("ab")).toBe(true);
    expect(isValidSlug("site-123")).toBe(true);
    expect(isValidSlug("a-b-c")).toBe(true);
  });

  it("rejects slug shorter than 2 characters", () => {
    expect(isValidSlug("a")).toBe(false);
    expect(isValidSlug("")).toBe(false);
  });

  it("rejects slug with uppercase, spaces, or special chars", () => {
    expect(isValidSlug("Joes-Salon")).toBe(false);
    expect(isValidSlug("joes salon")).toBe(false);
    expect(isValidSlug("joes_salon")).toBe(false);
    expect(isValidSlug("joes.salon")).toBe(false);
  });

  it("rejects slug longer than 64 characters", () => {
    const long = "a".repeat(65);
    expect(isValidSlug(long)).toBe(false);
  });
});

describe("buildInitialDraftContent", () => {
  it("SITES-01.5: builds content for each language with default fields", () => {
    const content = buildInitialDraftContent(["en", "hi"]);
    expect(Object.keys(content)).toEqual(["en", "hi"]);
    expect(content.en).toBeDefined();
    expect(content.hi).toBeDefined();
    expect(content.en?.businessName).toBe("");
    expect(content.en?.address).toBe("");
    expect(content.en?.galleryUrls).toEqual([]);
    expect(content.en?.youtubeUrls).toEqual([]);
  });

  it("includes country in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("country", "");
  });

  it("includes services as empty array in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("services");
    expect(content.en?.services).toEqual([]);
  });

  it("includes social URL keys in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("facebookUrl", "");
    expect(content.en).toHaveProperty("instagramUrl", "");
    expect(content.en).toHaveProperty("youtubeChannelUrl", "");
    expect(content.en).toHaveProperty("twitterUrl", "");
    expect(content.en).toHaveProperty("linkedinUrl", "");
    expect(content.en).toHaveProperty("tiktokUrl", "");
    expect(content.en).toHaveProperty("otherLinkLabel", "");
    expect(content.en).toHaveProperty("otherLinkUrl", "");
  });

  it("includes faq as empty array in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("faq");
    expect(content.en?.faq).toEqual([]);
  });

  it("includes CTA keys in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("ctaLabel", "");
    expect(content.en).toHaveProperty("ctaUrl", "");
  });

  it("includes paymentMethods in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("paymentMethods", "");
  });

  it("includes testimonials as empty array in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("testimonials");
    expect(content.en?.testimonials).toEqual([]);
  });

  it("includes team as empty array in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("team");
    expect(content.en?.team).toEqual([]);
  });

  it("includes certifications as empty array in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("certifications");
    expect(content.en?.certifications).toEqual([]);
  });

  it("includes SEO fields in default locale content", () => {
    const content = buildInitialDraftContent(["en"]);
    expect(content.en).toHaveProperty("metaTitle", "");
    expect(content.en).toHaveProperty("metaDescription", "");
    expect(content.en).toHaveProperty("keywords", "");
  });
});

describe("buildDraftContentFromTemplate", () => {
  it("returns base content when template has no extraFields", () => {
    const content = buildDraftContentFromTemplate("salon-modern", ["en"]);
    expect(content.en).toBeDefined();
    expect(content.en?.businessName).toBe("");
    expect(content.en).not.toHaveProperty("servicesIntro");
  });

  it("adds extra field keys to each locale when template has extraFields", () => {
    const content = buildDraftContentFromTemplate("salon-classic", ["en"], null, {
      servicesIntro: "What we offer",
    });
    expect(content.en?.servicesIntro).toBe("What we offer");
  });

  it("uses empty string for extra field when not in extraFieldValues", () => {
    const content = buildDraftContentFromTemplate("salon-classic", ["en"]);
    expect(content.en?.servicesIntro).toBe("");
  });

  it("builds for all languages", () => {
    const content = buildDraftContentFromTemplate("salon-classic", ["en", "hi"], null, {
      servicesIntro: "Intro",
    });
    expect(content.en?.servicesIntro).toBe("Intro");
    expect(content.hi?.servicesIntro).toBe("Intro");
  });
});
