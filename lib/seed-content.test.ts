import { describe, it, expect } from "vitest";
import { getSeedContent, getAssistedContent } from "./seed-content";

describe("getSeedContent", () => {
  it("returns content for each requested language", () => {
    const content = getSeedContent("salon", ["en", "hi"]);
    expect(content.en).toBeDefined();
    expect(content.hi).toBeDefined();
    expect(content.en?.businessName).toBe("Joe's Salon");
    expect(content.hi?.businessName).toBe("Joe's Salon");
  });

  it("returns full salon seed with all main fields populated", () => {
    const content = getSeedContent("salon", ["en"]);
    const en = content.en!;
    expect(en.businessName).toBe("Joe's Salon");
    expect(en.tagline).toBeTruthy();
    expect(en.shortDescription).toBeTruthy();
    expect(en.about).toBeTruthy();
    expect(en.address).toBeTruthy();
    expect(en.phone).toBeTruthy();
    expect(en.email).toBeTruthy();
    expect(en.businessHours).toBeTruthy();
    expect(en.timezone).toBe("America/New_York");
    expect(Array.isArray(en.services)).toBe(true);
    expect((en.services ?? []).length).toBeGreaterThan(0);
    expect(Array.isArray(en.faq)).toBe(true);
    expect((en.faq ?? []).length).toBeGreaterThan(0);
    expect(Array.isArray(en.testimonials)).toBe(true);
    expect(Array.isArray(en.team)).toBe(true);
    expect(Array.isArray(en.certifications)).toBe(true);
    expect(en.ctaLabel).toBeTruthy();
    expect(en.paymentMethods).toBeTruthy();
  });

  it("fills hero, gallery, logo, and service/team image URLs from placeholders", () => {
    const content = getSeedContent("salon", ["en"]);
    const en = content.en!;
    expect(en.heroImage).toMatch(/^https:\/\//);
    expect(Array.isArray(en.galleryUrls)).toBe(true);
    expect((en.galleryUrls ?? []).length).toBeGreaterThan(0);
    expect(en.logo).toMatch(/^https:\/\//);
    const firstService = (en.services ?? [])[0];
    expect(firstService?.image).toMatch(/^https:\/\//);
    const firstTeam = (en.team ?? [])[0];
    expect(firstTeam?.photo).toMatch(/^https:\/\//);
  });

  it("fills all URL fields with default values", () => {
    const content = getSeedContent("salon", ["en"]);
    const en = content.en!;
    expect(en.facebookUrl).toBeTruthy();
    expect(en.instagramUrl).toBeTruthy();
    expect(en.youtubeChannelUrl).toBe("https://youtube.com");
    expect(en.twitterUrl).toBe("https://twitter.com");
    expect(en.linkedinUrl).toBe("https://linkedin.com");
    expect(en.tiktokUrl).toBe("https://tiktok.com");
    expect(en.otherLinkUrl).toBe("#");
    expect(en.bookingUrl).toBe("#contact");
    expect(en.newsletterUrl).toBe("#");
    expect(en.whatsApp).toMatch(/^https:\/\/wa\.me\//);
  });

  it("returns type-specific name for each business type", () => {
    expect(getSeedContent("clinic", ["en"]).en?.businessName).toBe("City Health Clinic");
    expect(getSeedContent("cafe", ["en"]).en?.businessName).toBe("Corner Cafe");
    expect(getSeedContent("other", ["en"]).en?.businessName).toBe("My Business");
  });

  it("returns generic seed with services and faq for non-salon types", () => {
    const content = getSeedContent("clinic", ["en"]);
    const en = content.en!;
    expect(en.businessName).toBe("City Health Clinic");
    expect(Array.isArray(en.services)).toBe(true);
    expect(Array.isArray(en.faq)).toBe(true);
  });
});

describe("getAssistedContent", () => {
  it("returns same content as getSeedContent (static for now; AI endpoint later)", async () => {
    const assisted = await getAssistedContent("salon", ["en"]);
    const staticContent = getSeedContent("salon", ["en"]);
    expect(assisted.en?.businessName).toBe(staticContent.en?.businessName);
    expect(assisted.en?.businessName).toBe("Joe's Salon");
  });
});
