/**
 * TDD tests for "Open now" derivation from business hours + timezone (DATA_WE_COLLECT §6).
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getOpenNowStatus } from "./open-now";

describe("getOpenNowStatus", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns null when timezone is missing or empty", () => {
    expect(getOpenNowStatus("", "Mon-Fri 9-6")).toBeNull();
    expect(getOpenNowStatus("  ", "Mon-Fri 9-6")).toBeNull();
  });

  it("returns null when businessHours is missing or empty", () => {
    expect(getOpenNowStatus("Asia/Kolkata", "")).toBeNull();
    expect(getOpenNowStatus("Asia/Kolkata", "   ")).toBeNull();
  });

  it("returns null when businessHours is unparseable", () => {
    expect(getOpenNowStatus("Asia/Kolkata", "We are open sometimes")).toBeNull();
  });

  it("returns { open: false } when today is explicitly closed", () => {
    // Sunday 12:00 in Asia/Kolkata
    vi.setSystemTime(new Date("2025-02-16T06:30:00.000Z")); // 12:00 IST
    expect(
      getOpenNowStatus("Asia/Kolkata", "Mon-Sat 9-6, Sun closed")
    ).toEqual({ open: false });
  });

  it("returns { open: true } when current time in TZ is within Mon-Fri 9-6", () => {
    // Monday 10:30 in Asia/Kolkata (e.g. 2025-02-17 10:30 IST = 05:00 UTC)
    vi.setSystemTime(new Date("2025-02-17T05:00:00.000Z"));
    expect(
      getOpenNowStatus("Asia/Kolkata", "Mon-Fri 9-6")
    ).toEqual({ open: true });
  });

  it("returns { open: false } when current time in TZ is outside hours", () => {
    // Monday 08:00 in Asia/Kolkata (before 9)
    vi.setSystemTime(new Date("2025-02-17T02:30:00.000Z")); // 08:00 IST
    expect(
      getOpenNowStatus("Asia/Kolkata", "Mon-Fri 9-6")
    ).toEqual({ open: false });
  });

  it("parses Sat 10-4 and returns open on Saturday afternoon in TZ", () => {
    // Saturday 14:00 in Asia/Kolkata
    vi.setSystemTime(new Date("2025-02-22T08:30:00.000Z")); // 14:00 IST
    expect(
      getOpenNowStatus("Asia/Kolkata", "Sat 10-4")
    ).toEqual({ open: true });
  });

  it("parses Mon–Fri 9–6 with en-dash", () => {
    vi.setSystemTime(new Date("2025-02-17T05:00:00.000Z")); // Mon 10:30 IST
    expect(
      getOpenNowStatus("Asia/Kolkata", "Mon–Fri 9–6")
    ).toEqual({ open: true });
  });

  it("uses provided now when passed", () => {
    const mondayTenAm = new Date("2025-02-17T04:30:00.000Z"); // 10:00 IST
    expect(
      getOpenNowStatus("Asia/Kolkata", "Mon-Fri 9-6", mondayTenAm)
    ).toEqual({ open: true });
    const mondayEightAm = new Date("2025-02-17T02:30:00.000Z"); // 08:00 IST
    expect(
      getOpenNowStatus("Asia/Kolkata", "Mon-Fri 9-6", mondayEightAm)
    ).toEqual({ open: false });
  });
});
