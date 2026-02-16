/**
 * Site name availability check API (mocked Supabase/auth).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/supabase/server", () => ({
  getDashboardSupabase: vi.fn(),
}));

const { getDashboardSupabase } = await import("@/lib/supabase/server");

describe("GET /api/dashboard/sites/check-availability", () => {
  beforeEach(() => {
    vi.mocked(getDashboardSupabase).mockReset();
  });

  it("returns 401 when no session / no owner", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: null,
      userId: null,
    });
    const req = new Request("http://localhost/api/dashboard/sites/check-availability?slug=joes-salon");
    const res = await GET(req);
    expect(res.status).toBe(401);
    const data = await res.json();
    expect(data).toHaveProperty("error");
  });

  it("returns available: false when slug is empty", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: {} as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/check-availability?slug=");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.available).toBe(false);
    expect(data.message).toContain("site name");
  });

  it("returns available: false for invalid slug (too short)", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: {} as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/check-availability?slug=a");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.available).toBe(false);
    expect(data.message).toMatch(/lowercase|letters|numbers|hyphens/i);
  });

  it("returns available: false when slug is already taken", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: "site-1" } }),
      }),
    });
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: { from: vi.fn().mockReturnValue({ select: mockSelect }) } as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/check-availability?slug=taken-slug");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.available).toBe(false);
    expect(data.message).toMatch(/taken/i);
  });

  it("returns available: true when slug is valid and not taken", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: null }),
      }),
    });
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: { from: vi.fn().mockReturnValue({ select: mockSelect }) } as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/check-availability?slug=joes-salon");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.available).toBe(true);
    expect(data.message).toMatch(/available/i);
  });

  it("returns available: true when slug is taken by excluded site (editing own site)", async () => {
    const mockSelect = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        maybeSingle: vi.fn().mockResolvedValue({ data: { id: "site-own" } }),
      }),
    });
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: { from: vi.fn().mockReturnValue({ select: mockSelect }) } as never,
      userId: "user-1",
    });
    const req = new Request("http://localhost/api/dashboard/sites/check-availability?slug=my-site&excludeSiteId=site-own");
    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.available).toBe(true);
    expect(data.message).toMatch(/available/i);
  });
});
