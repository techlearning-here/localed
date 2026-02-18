/**
 * Unit tests for LocalBusiness JSON-LD schema builder (v1.1 SEO).
 */
import { describe, it, expect } from "vitest";
import {
  buildLocalBusinessSchema,
  buildLocalBusinessJsonLdScript,
  buildAggregateRatingFromTestimonials,
} from "./build-local-business-schema";

describe("buildLocalBusinessSchema", () => {
  it("includes @context, @type, name, url", () => {
    const schema = buildLocalBusinessSchema({
      name: "Joe's Salon",
      url: "https://localed.info/joes-salon",
    });
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("LocalBusiness");
    expect(schema.name).toBe("Joe's Salon");
    expect(schema.url).toBe("https://localed.info/joes-salon");
  });

  it("adds description, image, telephone, email when provided", () => {
    const schema = buildLocalBusinessSchema({
      name: "Biz",
      url: "https://example.com/biz",
      description: "A great place",
      image: "https://example.com/logo.png",
      telephone: "+1234567890",
      email: "hello@biz.com",
    });
    expect(schema.description).toBe("A great place");
    expect(schema.image).toBe("https://example.com/logo.png");
    expect(schema.telephone).toBe("+1234567890");
    expect(schema.email).toBe("hello@biz.com");
  });

  it("adds address as PostalAddress when address or addressCountry provided", () => {
    const schema = buildLocalBusinessSchema({
      name: "Biz",
      url: "https://example.com/biz",
      address: "123 Main St",
      addressCountry: "IN",
    });
    expect(schema.address).toEqual({
      "@type": "PostalAddress",
      streetAddress: "123 Main St",
      addressCountry: "IN",
    });
  });

  it("adds openingHours when provided", () => {
    const schema = buildLocalBusinessSchema({
      name: "Biz",
      url: "https://example.com/biz",
      openingHours: "Mo-Fr 09:00-17:00",
    });
    expect(schema.openingHours).toBe("Mo-Fr 09:00-17:00");
  });

  it("omits empty or whitespace-only fields", () => {
    const schema = buildLocalBusinessSchema({
      name: "Biz",
      url: "https://example.com/biz",
      description: "",
      telephone: "  ",
    });
    expect(schema).not.toHaveProperty("description");
    expect(schema).not.toHaveProperty("telephone");
  });

  it("adds sameAs array when social/profile URLs provided", () => {
    const schema = buildLocalBusinessSchema({
      name: "Biz",
      url: "https://example.com/biz",
      sameAs: [
        "https://facebook.com/biz",
        "https://instagram.com/biz",
        "  https://twitter.com/biz  ",
      ],
    });
    expect(schema.sameAs).toEqual([
      "https://facebook.com/biz",
      "https://instagram.com/biz",
      "https://twitter.com/biz",
    ]);
  });

  it("omits sameAs when not provided or empty", () => {
    expect(
      buildLocalBusinessSchema({ name: "Biz", url: "https://x.com" })
    ).not.toHaveProperty("sameAs");
    expect(
      buildLocalBusinessSchema({ name: "Biz", url: "https://x.com", sameAs: [] })
    ).not.toHaveProperty("sameAs");
  });

  it("filters out empty and non-string sameAs entries", () => {
    const schema = buildLocalBusinessSchema({
      name: "Biz",
      url: "https://x.com",
      sameAs: ["https://valid.com", "", "  ", "https://other.com"],
    });
    expect(schema.sameAs).toEqual(["https://valid.com", "https://other.com"]);
  });

  it("adds priceRange when provided", () => {
    const schema = buildLocalBusinessSchema({
      name: "Biz",
      url: "https://example.com/biz",
      priceRange: "$$",
    });
    expect(schema.priceRange).toBe("$$");
  });

  it("adds aggregateRating when testimonials with ratings provided", () => {
    const schema = buildLocalBusinessSchema({
      name: "Biz",
      url: "https://example.com/biz",
      testimonials: [{ rating: "5" }, { rating: "4" }, { rating: "5 stars" }],
    });
    expect(schema.aggregateRating).toEqual({
      "@type": "AggregateRating",
      ratingValue: 4.7,
      bestRating: 5,
      reviewCount: 3,
    });
  });

  it("omits aggregateRating when no testimonials or no parseable ratings", () => {
    expect(
      buildLocalBusinessSchema({ name: "Biz", url: "https://x.com" })
    ).not.toHaveProperty("aggregateRating");
    expect(
      buildLocalBusinessSchema({
        name: "Biz",
        url: "https://x.com",
        testimonials: [{ rating: "n/a" }],
      })
    ).not.toHaveProperty("aggregateRating");
  });
});

describe("buildAggregateRatingFromTestimonials", () => {
  it("returns undefined for empty or missing input", () => {
    expect(buildAggregateRatingFromTestimonials(undefined)).toBeUndefined();
    expect(buildAggregateRatingFromTestimonials([])).toBeUndefined();
  });

  it("parses numeric and star-style ratings", () => {
    const out = buildAggregateRatingFromTestimonials([
      { rating: "5" },
      { rating: "4.5 stars" },
    ]);
    expect(out?.ratingValue).toBe(4.8);
    expect(out?.reviewCount).toBe(2);
    expect(out?.["@type"]).toBe("AggregateRating");
  });
});

describe("buildLocalBusinessJsonLdScript", () => {
  it("returns valid JSON string", () => {
    const json = buildLocalBusinessJsonLdScript({
      name: "Test",
      url: "https://localed.info/test",
    });
    const parsed = JSON.parse(json);
    expect(parsed["@type"]).toBe("LocalBusiness");
    expect(parsed.name).toBe("Test");
  });
});
