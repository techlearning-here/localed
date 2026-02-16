/**
 * SITES-01, SITES-02 — Dashboard sites API (with mocked Supabase/auth).
 * Tests: 401 when no auth, 422 for invalid body or slug.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  getDashboardSupabase: vi.fn(),
}));

const { getDashboardSupabase } = await import("@/lib/supabase/server");

describe("GET /api/dashboard/sites (SITES-02)", () => {
  beforeEach(() => {
    vi.mocked(getDashboardSupabase).mockReset();
  });

  it("SITES-02.3: returns 401 when no session / no owner", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: null,
      userId: null,
    });
    const res = await GET();
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toHaveProperty("error");
  });
});

describe("POST /api/dashboard/sites (SITES-01)", () => {
  beforeEach(() => {
    vi.mocked(getDashboardSupabase).mockReset();
  });

  it("returns 401 when no session / no owner", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: null,
      userId: null,
    });
    const req = new Request("http://localhost/api/dashboard/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_type: "salon",
        slug: "joes-salon",
        languages: ["en"],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("SITES-01.3: returns 422 for invalid slug (too short)", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: {} as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_type: "salon",
        slug: "a",
        languages: ["en"],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/slug|invalid/i);
  });

  it("returns 422 for invalid slug (special characters)", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: {} as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_type: "salon",
        slug: "joes_salon",
        languages: ["en"],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });

  it("returns 422 when missing business_type, slug, or languages", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: {} as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug: "joes-salon", languages: ["en"] }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
    const data = await res.json();
    expect(data.error).toMatch(/missing|invalid/i);
  });

  it("returns 422 when languages is empty", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: {} as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        business_type: "salon",
        slug: "joes-salon",
        languages: [],
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(422);
  });
});
