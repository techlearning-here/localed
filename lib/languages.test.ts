/**
 * Unit tests for lib/languages (country-based language list for site creation).
 */
import { describe, it, expect } from "vitest";
import { getLanguagesForCountry, DEFAULT_LANGUAGE } from "./languages";

describe("getLanguagesForCountry", () => {
  it("returns languages for India including English and Hindi", () => {
    const options = getLanguagesForCountry("IN");
    const values = options.map((l) => l.value);
    expect(values).toContain("en");
    expect(values).toContain("hi");
    expect(values.length).toBeGreaterThan(2);
  });

  it("returns a smaller set for US (e.g. English and Spanish)", () => {
    const options = getLanguagesForCountry("US");
    const values = options.map((l) => l.value);
    expect(values).toContain("en");
    expect(values).toContain("es");
    expect(values.length).toBeLessThan(10);
  });

  it("returns all supported languages when country is empty", () => {
    const options = getLanguagesForCountry("");
    expect(options.length).toBeGreaterThan(15);
    expect(options.some((l) => l.value === DEFAULT_LANGUAGE)).toBe(true);
  });

  it("returns all supported languages for unknown country code", () => {
    const options = getLanguagesForCountry("XX");
    expect(options.length).toBeGreaterThan(15);
  });
});
