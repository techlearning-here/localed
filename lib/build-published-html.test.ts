/**
 * Unit tests for published site HTML builder (Workers-safe template + meta).
 */
import { describe, it, expect } from "vitest";
import {
  buildPublishedPageHtml,
  buildPublishedPageHtmlFromSite,
  type BuildPublishedHtmlOptions,
  type SiteRowForRecreate,
} from "./build-published-html";

const BASE_URL = "https://localed.info";

describe("buildPublishedPageHtml", () => {
  it("returns meta with title from businessName and optional tagline", () => {
    const options: BuildPublishedHtmlOptions = {
      content: { businessName: "Joe's Salon", tagline: "Your neighborhood cut" },
      siteSlug: "joes-salon",
      siteBaseUrl: BASE_URL,
    };
    const { meta } = buildPublishedPageHtml(options);
    expect(meta.title).toBe("Joe's Salon — Your neighborhood cut");
    expect(meta.description).toBeUndefined();
  });

  it("uses slug as title fallback when businessName empty", () => {
    const { meta } = buildPublishedPageHtml({
      content: {},
      siteSlug: "my-site",
      siteBaseUrl: BASE_URL,
    });
    expect(meta.title).toBe("my-site");
  });

  it("returns html containing DOCTYPE and business name", () => {
    const { html, meta } = buildPublishedPageHtml({
      content: { businessName: "Test Biz" },
      siteSlug: "test-biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Test Biz");
    expect(html).toContain(meta.title);
  });

  it("includes contact form action with site slug", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "A" },
      siteSlug: "my-slug",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain(`${BASE_URL}/api/sites/my-slug/contact`);
  });

  it("escapes user content in output (no raw script)", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "<script>alert(1)</script>",
        shortDescription: "Normal text",
      },
      siteSlug: "x",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;"); // or similar escaped form
  });
});

describe("buildPublishedPageHtmlFromSite", () => {
  it("uses draft_content when published_content is null", () => {
    const site: SiteRowForRecreate = {
      slug: "joes",
      languages: ["en"],
      published_content: null,
      draft_content: {
        en: { businessName: "From Draft", shortDescription: "Draft desc" },
      },
    };
    const { meta } = buildPublishedPageHtmlFromSite(site, BASE_URL);
    expect(meta.title).toBe("From Draft");
    expect(meta.description).toBe("Draft desc");
  });

  it("uses published_content when set (over draft)", () => {
    const site: SiteRowForRecreate = {
      slug: "joes",
      languages: ["en"],
      published_content: {
        en: { businessName: "Published Name", shortDescription: "Published desc" },
      },
      draft_content: {
        en: { businessName: "Draft Name" },
      },
    };
    const { meta } = buildPublishedPageHtmlFromSite(site, BASE_URL);
    expect(meta.title).toBe("Published Name");
    expect(meta.description).toBe("Published desc");
  });

  it("uses primary locale from site.languages", () => {
    const site: SiteRowForRecreate = {
      slug: "multi",
      languages: ["hi", "en"],
      draft_content: {
        en: { businessName: "English" },
        hi: { businessName: "Hindi" },
      },
    };
    const { meta } = buildPublishedPageHtmlFromSite(site, BASE_URL);
    expect(meta.title).toBe("Hindi");
  });
});
