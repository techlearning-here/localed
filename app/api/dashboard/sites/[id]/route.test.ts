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
  business_type: "salon",
  template_id: "salon-modern",
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

  it("PATCH accepts slug and returns updated site when slug is available", async () => {
    const updatedSite = { ...mockSite, slug: "new-slug" };
    const mockFrom = vi.fn(() => ({
      select: (cols: string) => {
        if (cols === "*") {
          return {
            eq: () => ({
              single: () => Promise.resolve({ data: mockSite }),
            }),
          };
        }
        return {
          eq: () => ({
            neq: () => ({
              maybeSingle: () => Promise.resolve({ data: null }),
            }),
          }),
        };
      },
      update: (updates: Record<string, unknown>) => ({
        eq: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({
                data: { ...mockSite, ...updates, slug: updates.slug ?? mockSite.slug },
              }),
          }),
        }),
      }),
    }));
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: { from: mockFrom } as never,
      userId: "owner-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/site-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "new-slug" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "site-1" }) });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.slug).toBe("new-slug");
  });

  it("PATCH returns 422 for invalid slug", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: mockSupabaseForGetSingle({ data: mockSite as never }) as never,
      userId: "owner-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/site-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "a" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "site-1" }) });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/slug|invalid/i);
  });

  it("PATCH returns 422 when changing slug on a published site", async () => {
    const publishedSite = { ...mockSite, published_at: "2025-01-01T00:00:00Z" };
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: mockSupabaseForGetSingle({ data: publishedSite as never }) as never,
      userId: "owner-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/site-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "new-name" }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "site-1" }) });
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/cannot be changed after publishing/i);
  });

  it("PATCH stores draft_content including _assistantPrefilledFields when provided (assistant-prefilled tracking)", async () => {
    let capturedUpdate: Record<string, unknown> = {};
    const mockFrom = vi.fn(() => ({
      select: (cols: string) => {
        if (cols === "*") {
          return {
            eq: () => ({
              single: () => Promise.resolve({ data: mockSite }),
            }),
          };
        }
        return {
          eq: () => ({
            neq: () => ({
              maybeSingle: () => Promise.resolve({ data: null }),
            }),
          }),
        };
      },
      update: (updates: Record<string, unknown>) => {
        capturedUpdate = updates;
        return {
          eq: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { ...mockSite, ...updates },
                }),
            }),
          }),
        };
      },
    }));
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: { from: mockFrom } as never,
      userId: "owner-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/site-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draft_content: {
          en: {
            businessName: "Acme",
            _assistantPrefilledFields: ["businessName", "tagline"],
          },
        },
      }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "site-1" }) });
    expect(res.status).toBe(200);
    const draft = capturedUpdate.draft_content as Record<string, Record<string, unknown>>;
    expect(draft).toBeDefined();
    expect(draft.en).toBeDefined();
    expect(draft.en._assistantPrefilledFields).toEqual(["businessName", "tagline"]);
  });

  it("PATCH stores assistant_prefilled_fields in DB column when provided (sample indication persists after publish)", async () => {
    let capturedUpdate: Record<string, unknown> = {};
    const mockFrom = vi.fn(() => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: mockSite }),
        }),
      }),
      update: (updates: Record<string, unknown>) => {
        capturedUpdate = updates;
        return {
          eq: () => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { ...mockSite, ...updates },
                }),
            }),
          }),
        };
      },
    }));
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: { from: mockFrom } as never,
      userId: "owner-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/site-1", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        draft_content: { en: { businessName: "Acme" } },
        assistant_prefilled_fields: ["businessName", "tagline", "services"],
      }),
    });
    const res = await PATCH(req, { params: Promise.resolve({ id: "site-1" }) });
    expect(res.status).toBe(200);
    expect(capturedUpdate.assistant_prefilled_fields).toEqual(["businessName", "tagline", "services"]);
  });
});
