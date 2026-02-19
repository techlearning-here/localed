import { describe, it, expect } from "vitest";
import {
  getRecommendedImageDimension,
  getRecommendedDimensionHint,
  type ImageRole,
} from "./image-dimensions";

const ALL_ROLES: ImageRole[] = [
  "hero",
  "gallery",
  "logo",
  "favicon",
  "service",
  "team",
  "testimonial",
  "certification",
];

describe("getRecommendedImageDimension", () => {
  it("EDITOR-04.1: returns width, height, and label for every image role", () => {
    for (const role of ALL_ROLES) {
      const d = getRecommendedImageDimension(role);
      expect(d).toBeDefined();
      expect(typeof d.width).toBe("number");
      expect(typeof d.height).toBe("number");
      expect(typeof d.label).toBe("string");
      expect(d.width).toBeGreaterThan(0);
      expect(d.height).toBeGreaterThan(0);
      expect(d.label.length).toBeGreaterThan(0);
    }
  });

  it("EDITOR-04.2: returns 1200×600 for hero", () => {
    const d = getRecommendedImageDimension("hero");
    expect(d.width).toBe(1200);
    expect(d.height).toBe(600);
    expect(d.label).toBe("1200 × 600 px");
  });

  it("EDITOR-04.4: gallery is square 800×800", () => {
    const d = getRecommendedImageDimension("gallery");
    expect(d.width).toBe(800);
    expect(d.height).toBe(800);
    expect(d.label).toBe("800 × 800 px");
  });

  it("EDITOR-04.4: logo and favicon have defined dimensions", () => {
    const logo = getRecommendedImageDimension("logo");
    expect(logo.width).toBe(200);
    expect(logo.height).toBe(200);
    const favicon = getRecommendedImageDimension("favicon");
    expect(favicon.width).toBe(32);
    expect(favicon.height).toBe(32);
  });

  it("EDITOR-04.4: service is 400×300 (4:3)", () => {
    const d = getRecommendedImageDimension("service");
    expect(d.width).toBe(400);
    expect(d.height).toBe(300);
  });

  it("EDITOR-04.4: team and testimonial are square", () => {
    const team = getRecommendedImageDimension("team");
    expect(team.width).toBe(team.height);
    expect(team.width).toBe(400);
    const testimonial = getRecommendedImageDimension("testimonial");
    expect(testimonial.width).toBe(testimonial.height);
    expect(testimonial.width).toBe(200);
  });

  it("EDITOR-04.4: certification has defined dimensions", () => {
    const d = getRecommendedImageDimension("certification");
    expect(d.width).toBe(128);
    expect(d.height).toBe(128);
  });
});

describe("getRecommendedDimensionHint", () => {
  it("EDITOR-04.3: returns string starting with 'Recommended: ' and role label", () => {
    expect(getRecommendedDimensionHint("hero")).toBe("Recommended: 1200 × 600 px");
    expect(getRecommendedDimensionHint("gallery")).toBe("Recommended: 800 × 800 px");
    expect(getRecommendedDimensionHint("logo")).toBe("Recommended: 200 × 200 px");
    expect(getRecommendedDimensionHint("favicon")).toBe("Recommended: 32 × 32 px");
    expect(getRecommendedDimensionHint("service")).toBe("Recommended: 400 × 300 px");
    expect(getRecommendedDimensionHint("team")).toBe("Recommended: 400 × 400 px");
    expect(getRecommendedDimensionHint("testimonial")).toBe("Recommended: 200 × 200 px");
    expect(getRecommendedDimensionHint("certification")).toBe("Recommended: 128 × 128 px");
  });

  it("EDITOR-04.3: hint for every role is non-empty and includes the dimension label", () => {
    for (const role of ALL_ROLES) {
      const hint = getRecommendedDimensionHint(role);
      expect(hint).toMatch(/^Recommended: .+$/);
      const d = getRecommendedImageDimension(role);
      expect(hint).toContain(d.label);
    }
  });
});
