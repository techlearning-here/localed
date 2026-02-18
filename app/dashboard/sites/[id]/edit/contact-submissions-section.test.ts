/**
 * CONTACT-03-UI — Unit test for contact submissions section helper.
 * Tests date formatting used when displaying submission dates.
 */
import { describe, it, expect } from "vitest";
import { formatSubmissionDate } from "./contact-submissions-section";

describe("formatSubmissionDate (CONTACT-03-UI)", () => {
  it("formats ISO date string to locale date and time", () => {
    const formatted = formatSubmissionDate("2025-02-15T12:30:00Z");
    expect(formatted).toMatch(/\d/);
    expect(typeof formatted).toBe("string");
    expect(formatted.length).toBeGreaterThan(0);
  });

  it("returns fallback for invalid date", () => {
    expect(formatSubmissionDate("")).toBe("—");
    expect(formatSubmissionDate("not-a-date")).toBe("—");
  });
});
