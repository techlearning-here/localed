import { describe, it, expect } from "vitest";
import { getContentPlan } from "./content-plan";
import type { BusinessType } from "@/lib/types/site";

const BUSINESS_TYPES: BusinessType[] = [
  "salon",
  "clinic",
  "repair",
  "tutor",
  "cafe",
  "local_service",
  "other",
];

describe("getContentPlan", () => {
  it("returns a plan for every business type", () => {
    for (const type of BUSINESS_TYPES) {
      const plan = getContentPlan(type);
      expect(plan.businessName).toBeTruthy();
      expect(plan.tagline).toBeTruthy();
      expect(plan.shortDescription).toBeTruthy();
      expect(Array.isArray(plan.services)).toBe(true);
      expect(plan.services.length).toBeGreaterThan(0);
      expect(Array.isArray(plan.faq)).toBe(true);
      expect(plan.ctaLabel).toBeTruthy();
    }
  });

  it("returns type-specific content for salon", () => {
    const plan = getContentPlan("salon");
    expect(plan.businessName).toBe("Joe's Salon");
    expect(plan.services.some((s) => s.category === "Hair")).toBe(true);
    expect(plan.faq.some((f) => f.question.includes("walk-in"))).toBe(true);
  });

  it("returns type-specific content for clinic", () => {
    const plan = getContentPlan("clinic");
    expect(plan.businessName).toBe("City Health Clinic");
    expect(plan.services.some((s) => s.name.toLowerCase().includes("consultation") || s.name.toLowerCase().includes("check"))).toBe(true);
  });

  it("returns type-specific content for cafe", () => {
    const plan = getContentPlan("cafe");
    expect(plan.businessName).toBe("Corner Cafe");
    expect(plan.ctaLabel).toBe("View menu");
  });

  it("returns other when given unknown type (fallback)", () => {
    const plan = getContentPlan("other" as BusinessType);
    expect(plan.businessName).toBe("My Business");
  });
});
