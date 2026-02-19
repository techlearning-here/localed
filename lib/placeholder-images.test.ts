import { describe, it, expect } from "vitest";
import { getPlaceholderImages } from "./placeholder-images";

describe("getPlaceholderImages", () => {
  it("returns hero, gallery, logo, serviceImages, and teamImages for a type", () => {
    const imgs = getPlaceholderImages("salon");
    expect(imgs.hero).toMatch(/^https:\/\/picsum\.photos\/seed\/hero-salon\/\d+\/\d+$/);
    expect(imgs.gallery).toHaveLength(3);
    expect(imgs.gallery[0]).toMatch(/^https:\/\/picsum\.photos\/seed\/gallery-salon-1\//);
    expect(imgs.logo).toMatch(/^https:\/\/picsum\.photos\/seed\/logo-salon\/\d+\/\d+$/);
    expect(imgs.serviceImages.length).toBeGreaterThanOrEqual(1);
    expect(imgs.teamImages.length).toBeGreaterThanOrEqual(1);
  });

  it("returns same URLs for same type (deterministic)", () => {
    const a = getPlaceholderImages("cafe");
    const b = getPlaceholderImages("cafe");
    expect(a.hero).toBe(b.hero);
    expect(a.gallery).toEqual(b.gallery);
    expect(a.logo).toBe(b.logo);
  });

  it("returns different URLs for different types", () => {
    const salon = getPlaceholderImages("salon");
    const clinic = getPlaceholderImages("clinic");
    expect(salon.hero).not.toBe(clinic.hero);
    expect(salon.hero).toContain("salon");
    expect(clinic.hero).toContain("clinic");
  });
});
