/**
 * SITES-03, SITES-04 — Get and PATCH single site (with mocked Supabase).
 * Tests: 401 when no auth, 403 when not owner, 422 invalid JSON for PATCH.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, PATCH } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  getDashboardSupabase: vi.fn(),
}));

const { getDashboardSupabase } = await import("@/lib/supabase/server");

const mockSite = {
  id: "site-1",
  owner_id: "owner-1",
  slug: "joes-salon",
  draft_content: { en: {} },
  languages: ["en"],
};

function mockSupabaseForGetSingle(result: { data: typeof mockSite | null; error?: { message: string } }) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve(result),
        }),
      }),
    }),
  };
}

describe("GET /api/dashboard/sites/[id] (SITES-03)", () => {
  beforeEach(() => {
    vi.mocked(getDashboardSupabase).mockReset();
  });

  it("SITES-03: returns 401 when no session", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({ client: null, userId: null });
    const res = await GET(
      new Request("http://localhost/api/dashboard/sites/site-1"),
      { params: Promise.resolve({ id: "site-1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("SITES-03.2: returns 403 when user does not own site", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: mockSupabaseForGetSingle({ data: { ...mockSite, owner_id: "other-owner" }, error: undefined }) as never,
      userId: "owner-1",
    });
    const res = await GET(
      new Request("http://localhost/api/dashboard/sites/site-1"),
      { params: Promise.resolve({ id: "site-1" }) }
    );
    expect(res.status).toBe(403);
  });

  it("SITES-03.1: returns 200 with site when owner", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: mockSupabaseForGetSingle({ data: mockSite as never }) as never,
      userId: "owner-1",
    });
    const res = await GET(
      new Request("http://localhost/api/dashboard/sites/site-1"),
      { params: Promise.resolve({ id: "site-1" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("id", "site-1");
    expect(data).toHaveProperty("owner_id", "owner-1");
  });
});

describe("PATCH /api/dashboard/sites/[id] (SITES-04)", () => {
  beforeEach(() => {
    vi.mocked(getDashboardSupabase).mockReset();
  });

  it("returns 401 when no session", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({ client: null, userId: null });
    const req = new Request("http://localhost/api/dashboard/sites/site-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft_content: { en: { businessName: "Joe" } } }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "site-1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 422 for invalid JSON body", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: mockSupabaseForGetSingle({ data: mockSite as never }) as never,
      userId: "owner-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/site-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: "not json",
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "site-1" }) });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/invalid|json/i);
  });
});
