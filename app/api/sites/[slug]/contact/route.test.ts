/**
 * CONTACT-01 — Contact form API (with mocked Supabase).
 * Tests: 422 for invalid or missing body; CONTACT-01.4 optional email to owner.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";
import { POST } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServer: vi.fn(),
}));
vi.mock("@/lib/contact-notification", () => ({
  sendContactNotification: vi.fn().mockResolvedValue(true),
}));

const { createSupabaseServer } = await import("@/lib/supabase/server");
const { sendContactNotification } = await import("@/lib/contact-notification");

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
    const res = await POST(req as NextRequest, { params: Promise.resolve({ slug: "joes-salon" }) });
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
    const res = await POST(req as NextRequest, { params: Promise.resolve({ slug: "joes-salon" }) });
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
    const res = await POST(req as NextRequest, { params: Promise.resolve({ slug: "joes-salon" }) });
    expect(res.status).toBe(422);
  });

  it("CONTACT-01.4: notifies site owner by email on successful submit when site has contact email", async () => {
    vi.mocked(createSupabaseServer).mockReturnValue({
      from: (table: string) => {
        if (table === "localed_sites") {
          return {
            select: () => ({
              eq: () => ({
                not: () => ({
                  single: () =>
                    Promise.resolve({
                      data: {
                        id: "site-1",
                        published_content: {
                          en: { email: "owner@example.com", businessName: "Joe's Salon" },
                        },
                      },
                      error: null,
                    }),
                }),
              }),
            }),
          };
        }
        if (table === "localed_contact_submissions") {
          return { insert: () => Promise.resolve({ error: null }) };
        }
        return {};
      },
    } as never);
    vi.mocked(sendContactNotification).mockClear();

    const req = new Request("http://localhost/api/sites/joes-salon/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Jane",
        email: "j@example.com",
        message: "Hi, I'd like to book.",
      }),
    });
    const res = await POST(req as NextRequest, { params: Promise.resolve({ slug: "joes-salon" }) });
    expect(res.status).toBe(201);
    expect(sendContactNotification).toHaveBeenCalledTimes(1);
    expect(sendContactNotification).toHaveBeenCalledWith(
      "owner@example.com",
      { name: "Jane", email: "j@example.com", message: "Hi, I'd like to book." },
      "Joe's Salon"
    );
  });
});
