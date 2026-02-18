/**
 * PUBLIC-03 — Unit tests for public site metadata (meta + Open Graph).
 */
import { describe, it, expect } from "vitest";
import { buildPublicSiteMetadata } from "./build-public-meta";

describe("buildPublicSiteMetadata (PUBLIC-03)", () => {
  const baseUrl = "https://localed.info";

  it("PUBLIC-03.1: sets title and description from businessName and shortDescription", () => {
    const content: Record<string, unknown> = {
      businessName: "Joe's Salon",
      shortDescription: "Your neighborhood hair care.",
      heroImage: "https://example.com/hero.jpg",
    };
    const meta = buildPublicSiteMetadata(content, "joes-salon", baseUrl);
    expect(meta.title).toBe("Joe's Salon");
    expect(meta.description).toBe("Your neighborhood hair care.");
    expect(meta.openGraph?.title).toBe("Joe's Salon");
    expect(meta.openGraph?.description).toBe("Your neighborhood hair care.");
    expect(meta.openGraph?.url).toBe("https://localed.info/joes-salon");
  });

  it("PUBLIC-03.1: sets og:image to hero image when present", () => {
    const content: Record<string, unknown> = {
      businessName: "Joe's Salon",
      shortDescription: "Salon",
      heroImage: "https://example.com/hero.jpg",
    };
    const meta = buildPublicSiteMetadata(content, "joes-salon", baseUrl);
    expect(meta.openGraph?.images).toBeDefined();
    expect(meta.openGraph?.images).toHaveLength(1);
    expect(meta.openGraph?.images?.[0]).toMatchObject({ url: "https://example.com/hero.jpg" });
  });

  it("PUBLIC-03.2: falls back to logo when no hero image", () => {
    const content: Record<string, unknown> = {
      businessName: "Joe's Salon",
      logo: "https://example.com/logo.png",
    };
    const meta = buildPublicSiteMetadata(content, "joes-salon", baseUrl);
    expect(meta.openGraph?.images).toHaveLength(1);
    expect(meta.openGraph?.images?.[0].url).toBe("https://example.com/logo.png");
  });

  it("PUBLIC-03.2: omits og:image when no hero or logo", () => {
    const content: Record<string, unknown> = {
      businessName: "Joe's Salon",
    };
    const meta = buildPublicSiteMetadata(content, "joes-salon", baseUrl);
    expect(meta.openGraph?.images).toBeUndefined();
  });

  it("PUBLIC-03.3: sets canonical and og:url from baseUrl and slug", () => {
    const content: Record<string, unknown> = { businessName: "Test" };
    const meta = buildPublicSiteMetadata(content, "my-site", baseUrl);
    expect(meta.alternates?.canonical).toBe("https://localed.info/my-site");
    expect(meta.openGraph?.url).toBe("https://localed.info/my-site");
  });

  it("uses slug as title fallback when businessName empty", () => {
    const content: Record<string, unknown> = {};
    const meta = buildPublicSiteMetadata(content, "my-site", baseUrl);
    expect(meta.title).toBe("my-site");
  });
});
