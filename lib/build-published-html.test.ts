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

  it("uses metaTitle and metaDescription overrides when set", () => {
    const { meta } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        tagline: "Tag",
        shortDescription: "Short.",
        metaTitle: "Custom SEO Title",
        metaDescription: "Custom meta description for search.",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(meta.title).toBe("Custom SEO Title");
    expect(meta.description).toBe("Custom meta description for search.");
  });

  it("falls back to default title/description when meta overrides empty", () => {
    const { meta } = buildPublishedPageHtml({
      content: { businessName: "Biz", tagline: "Tag", shortDescription: "Short." },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(meta.title).toBe("Biz — Tag");
    expect(meta.description).toBe("Short.");
  });

  it("includes keywords meta tag when keywords set", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz", keywords: "salon, haircut, Mumbai" },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain('meta name="keywords"');
    expect(html).toContain("salon, haircut, Mumbai");
  });

  it("includes legal name in footer when set", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Joe's Salon", legalName: "Joe Smith Pty Ltd" },
      siteSlug: "joes-salon",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Legal name:");
    expect(html).toContain("Joe Smith Pty Ltd");
  });

  it("omits legal name from footer when not set", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz" },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("Legal name:");
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

  it("includes LocalBusiness JSON-LD in head", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Joe's Salon", shortDescription: "Best cuts" },
      siteSlug: "joes-salon",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain('type="application/ld+json"');
    expect(html).toContain("LocalBusiness");
    expect(html).toContain("Joe's Salon");
    expect(html).toContain(`${BASE_URL}/joes-salon`);
  });

  it("includes Follow us section when social URLs are set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        facebookUrl: "https://facebook.com/biz",
        instagramUrl: "https://instagram.com/biz",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Follow us");
    expect(html).toContain("Facebook");
    expect(html).toContain("Instagram");
    expect(html).toContain("https://facebook.com/biz");
    expect(html).toContain("https://instagram.com/biz");
  });

  it("Follow us section uses icon markup (svg and aria-label) when social URLs set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        facebookUrl: "https://facebook.com/biz",
        instagramUrl: "https://instagram.com/biz",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Follow us");
    expect(html).toMatch(/<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
    expect(html).toMatch(/aria-label="Facebook"/);
    expect(html).toMatch(/aria-label="Instagram"/);
  });

  it("omits Follow us section when no social URLs", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz" },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("Follow us");
  });

  it("includes sameAs in JSON-LD when social URLs present", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        facebookUrl: "https://facebook.com/biz",
        twitterUrl: "https://x.com/biz",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("sameAs");
    expect(html).toContain("https://facebook.com/biz");
    expect(html).toContain("https://x.com/biz");
  });

  it("includes What we offer section when services are set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Salon",
        services: [
          { name: "Haircut", description: "Full cut", price: "From $20" },
          { name: "Beard trim", duration: "15 min" },
        ],
      },
      siteSlug: "salon",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("What we offer");
    expect(html).toContain("Haircut");
    expect(html).toContain("Full cut");
    expect(html).toContain("From $20");
    expect(html).toContain("Beard trim");
    expect(html).toContain("15 min");
  });

  it("omits What we offer when services empty or missing", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz", services: [] },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("What we offer");
  });

  it("escapes service content in HTML (no XSS)", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        services: [{ name: "<script>alert(1)</script>", description: "Safe" }],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes FAQ section when faq items are set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        faq: [
          { question: "What are your hours?", answer: "Mon–Fri 9–6." },
          { question: "Do you take cards?", answer: "Yes, we accept card and UPI." },
        ],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("FAQ");
    expect(html).toContain("What are your hours?");
    expect(html).toContain("Mon–Fri 9–6.");
    expect(html).toContain("Do you take cards?");
    expect(html).toContain("Yes, we accept card and UPI.");
  });

  it("omits FAQ section when faq is empty or missing", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz", faq: [] },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("FAQ</h2>");
  });

  it("escapes FAQ content in HTML (no XSS)", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        faq: [{ question: "<script>alert(1)</script>", answer: "Safe" }],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes Testimonials section when testimonials are set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        testimonials: [
          { quote: "Great service!", author: "Jane", rating: "5 stars" },
          { quote: "Highly recommend.", author: "Bob", photo: "https://example.com/photo.jpg" },
        ],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Testimonials");
    expect(html).toContain("Great service!");
    expect(html).toContain("Jane");
    expect(html).toContain("5 stars");
    expect(html).toContain("Highly recommend.");
    expect(html).toContain("Bob");
    expect(html).toContain("https://example.com/photo.jpg");
  });

  it("omits Testimonials section when testimonials are empty or missing", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz", testimonials: [] },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("Testimonials</h2>");
  });

  it("escapes testimonial content in HTML (no XSS)", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        testimonials: [{ quote: "<script>alert(1)</script>", author: "Test" }],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes Meet the team section when team is set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        team: [
          { name: "Jane Smith", role: "Stylist", bio: "10 years experience." },
          { name: "Bob Lee", photo: "https://example.com/bob.jpg" },
        ],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Meet the team");
    expect(html).toContain("Jane Smith");
    expect(html).toContain("Stylist");
    expect(html).toContain("10 years experience.");
    expect(html).toContain("Bob Lee");
    expect(html).toContain("https://example.com/bob.jpg");
  });

  it("omits Meet the team section when team is empty or missing", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz", team: [] },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("Meet the team</h2>");
  });

  it("escapes team content in HTML (no XSS)", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        team: [{ name: "<script>alert(1)</script>", role: "Staff" }],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes Certifications & awards section when certifications are set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        certifications: [
          { title: "ISO 9001 Certified" },
          { title: "Best Salon 2024", image: "https://example.com/badge.png" },
        ],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Certifications &amp; awards");
    expect(html).toContain("ISO 9001 Certified");
    expect(html).toContain("Best Salon 2024");
    expect(html).toContain("https://example.com/badge.png");
  });

  it("omits Certifications section when certifications are empty or missing", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz", certifications: [] },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("Certifications &amp; awards</h2>");
  });

  it("escapes certification content in HTML (no XSS)", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        certifications: [{ title: "<script>alert(1)</script>" }],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes CTA button when ctaLabel and ctaUrl are set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        ctaLabel: "Book now",
        ctaUrl: "https://book.example.com",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Book now");
    expect(html).toContain("https://book.example.com");
    expect(html).toContain("<a href=");
  });

  it("omits CTA button when ctaLabel or ctaUrl is missing", () => {
    const { html: html1 } = buildPublishedPageHtml({
      content: { businessName: "Biz", ctaLabel: "Book", ctaUrl: "" },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html1).not.toContain("Book</a>");
    const { html: html2 } = buildPublishedPageHtml({
      content: { businessName: "Biz", ctaLabel: "", ctaUrl: "https://x.com" },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html2).not.toContain("https://x.com");
  });

  it("escapes CTA label in HTML (no XSS)", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        ctaLabel: "<script>alert(1)</script>",
        ctaUrl: "https://safe.com",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("includes second phone and map link in Contact when set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        address: "123 Main St",
        country: "IN",
        phone: "111",
        phone2: "222",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("tel:111");
    expect(html).toContain("111");
    expect(html).toContain("Phone 2:");
    expect(html).toContain("222");
    expect(html).toContain("View on map");
    expect(html).toContain("google.com/maps");
  });

  it("includes services intro above What we offer when set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        servicesIntro: "Our services at a glance.",
        services: [{ name: "Haircut" }],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("What we offer");
    expect(html).toContain("Our services at a glance.");
  });

  it("includes Book online section when booking enabled", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        bookingEnabled: true,
        bookingSlotDuration: "30 min",
        bookingLeadTime: "Book at least 2 hours ahead",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Book online");
    expect(html).toContain("30 min");
    expect(html).toContain("Book at least 2 hours ahead");
  });

  it("includes Other videos section when otherVideoUrls set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        otherVideoUrls: ["https://vimeo.com/123"],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Other videos");
    expect(html).toContain("https://player.vimeo.com/video/123");
  });

  it("includes non-Vimeo other video as link", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        otherVideoUrls: ["https://example.com/video"],
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Other videos");
    expect(html).toContain("https://example.com/video");
  });

  it("uses placeholder hero when no heroImage and no gallery", () => {
    const { html } = buildPublishedPageHtml({
      content: { businessName: "Biz" },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("placehold.co");
    expect(html).toContain("No+image");
  });

  it("includes email2, contactPreference, mapEmbedUrl in Contact when set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        email: "a@b.com",
        email2: "b@b.com",
        contactPreference: "phone",
        mapEmbedUrl: "https://www.google.com/maps/embed?pb=abc",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("b@b.com");
    expect(html).toContain("Preferred:");
    expect(html).toContain("phone");
    expect(html).toContain("https://www.google.com/maps/embed?pb=abc");
  });

  it("includes payment methods in Contact section when set", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        paymentMethods: "We accept Cash, Card, UPI.",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).toContain("Contact");
    expect(html).toContain("We accept Cash, Card, UPI.");
  });

  it("escapes payment methods in HTML (no XSS)", () => {
    const { html } = buildPublishedPageHtml({
      content: {
        businessName: "Biz",
        paymentMethods: "<script>alert(1)</script>",
      },
      siteSlug: "biz",
      siteBaseUrl: BASE_URL,
    });
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain("&lt;script&gt;");
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
