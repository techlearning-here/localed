/**
 * CONTACT-01 — Contact form API (with mocked Supabase).
 * Tests: 422 for invalid or missing body (name, email, message).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServer: vi.fn(),
}));

const { createSupabaseServer } = await import("@/lib/supabase/server");

describe("POST /api/sites/[slug]/contact (CONTACT-01)", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServer).mockReset();
  });

  it("returns 503 when database not configured", async () => {
    vi.mocked(createSupabaseServer).mockReturnValue(null);
    const req = new Request("http://localhost/api/sites/joes-salon/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jane", email: "j@example.com", message: "Hi" }),
    });
    const res = await POST(req, { params: Promise.resolve({ slug: "joes-salon" }) });
    expect(res.status).toBe(503);
  });

  it("CONTACT-01.2: returns 422 when missing name, email, or message", async () => {
    vi.mocked(createSupabaseServer).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            not: () => ({
              single: () => Promise.resolve({ data: { id: "site-1" }, error: null }),
            }),
          }),
        }),
      }),
    } as never);

    const req = new Request("http://localhost/api/sites/joes-salon/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Jane", email: "j@example.com" }),
    });
    const res = await POST(req, { params: Promise.resolve({ slug: "joes-salon" }) });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/missing|name|email|message/i);
  });

  it("returns 422 for invalid JSON body", async () => {
    vi.mocked(createSupabaseServer).mockReturnValue({
      from: () => ({
        select: () => ({
          eq: () => ({
            not: () => ({
              single: () => Promise.resolve({ data: { id: "site-1" }, error: null }),
            }),
          }),
        }),
      }),
    } as never);
    const req = new Request("http://localhost/api/sites/joes-salon/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await POST(req, { params: Promise.resolve({ slug: "joes-salon" }) });
    expect(res.status).toBe(422);
  });
});
