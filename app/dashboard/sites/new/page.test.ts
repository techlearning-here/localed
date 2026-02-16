/**
 * New site page redirects to the create wizard (no DB entry until Save/Publish).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

describe("GET /dashboard/sites/new", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("redirects to /dashboard/sites/new/edit", async () => {
    const { redirect } = await import("next/navigation");
    const page = (await import("./page")).default;
    expect(() => page()).toThrow("NEXT_REDIRECT");
    expect(redirect).toHaveBeenCalledWith("/dashboard/sites/new/edit");
  });
});
