/**
 * PUBLIC-01 — Get published site by slug (with mocked Supabase).
 * Tests: 503 when DB not configured, 404 when not found, 200 with correct shape when found.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServer: vi.fn(),
}));

const { createSupabaseServer } = await import("@/lib/supabase/server");

function mockSupabaseWithSite(site: Record<string, unknown> | null) {
  vi.mocked(createSupabaseServer).mockReturnValue({
    from: () => ({
      select: () => ({
        eq: () => ({
          not: () => ({
            single: () =>
              Promise.resolve(
                site
                  ? { data: site, error: null }
                  : { data: null, error: { message: "Not found" } }
              ),
          }),
        }),
      }),
    }),
  } as never);
}

describe("GET /api/sites/[slug] (PUBLIC-01)", () => {
  beforeEach(() => {
    vi.mocked(createSupabaseServer).mockReset();
  });

  it("PUBLIC-01: returns 503 when database not configured", async () => {
    vi.mocked(createSupabaseServer).mockReturnValue(null);
    const res = await GET(
      new Request("http://localhost/api/sites/joes-salon"),
      { params: Promise.resolve({ slug: "joes-salon" }) }
    );
    expect(res.status).toBe(503);
    const data = await res.json();
    expect(data.error).toMatch(/database|configured/i);
  });

  it("returns 404 when site not found or not published", async () => {
    mockSupabaseWithSite(null);
    const res = await GET(
      new Request("http://localhost/api/sites/unknown"),
      { params: Promise.resolve({ slug: "unknown" }) }
    );
    expect(res.status).toBe(404);
    const data = await res.json();
    expect(data.error).toBe("Not found");
  });

  it("PUBLIC-01.1: returns 200 with id, slug, content when published", async () => {
    const published = {
      id: "site-1",
      slug: "joes-salon",
      business_type: "salon",
      template_id: "default",
      languages: ["en"],
      published_content: { en: { businessName: "Joe's Salon" } },
    };
    mockSupabaseWithSite(published);
    const res = await GET(
      new Request("http://localhost/api/sites/joes-salon"),
      { params: Promise.resolve({ slug: "joes-salon" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toHaveProperty("id", "site-1");
    expect(data).toHaveProperty("slug", "joes-salon");
    expect(data).toHaveProperty("content", published.published_content);
  });
});
