/**
 * CONTACT-03 — List contact submissions for a site (dashboard).
 * Tests: 401 no auth, 403 not owner, 404 invalid site, 200 with list (newest first), 200 empty list.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";

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

const mockSubmissions = [
  {
    id: "sub-2",
    site_id: "site-1",
    name: "Jane",
    email: "jane@example.com",
    message: "Second message",
    created_at: "2025-02-15T12:00:00Z",
  },
  {
    id: "sub-1",
    site_id: "site-1",
    name: "John",
    email: "john@example.com",
    message: "First message",
    created_at: "2025-02-14T10:00:00Z",
  },
];

function createMockClient(options: {
  siteResult: { data: typeof mockSite | null; error?: { message: string } };
  submissionsResult: { data: typeof mockSubmissions };
}) {
  const { siteResult, submissionsResult } = options;
  return {
    from: (table: string) => {
      if (table === "localed_sites") {
        return {
          select: () => ({
            eq: () => ({
              single: () => Promise.resolve(siteResult),
            }),
          }),
        };
      }
      if (table === "localed_contact_submissions") {
        return {
          select: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: submissionsResult.data, error: null }),
            }),
          }),
        };
      }
      return {};
    },
  };
}

describe("GET /api/dashboard/sites/[id]/submissions (CONTACT-03)", () => {
  beforeEach(() => {
    vi.mocked(getDashboardSupabase).mockReset();
  });

  it("CONTACT-03.4: returns 401 when no session", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({ client: null, userId: null });
    const res = await GET(
      new Request("http://localhost/api/dashboard/sites/site-1/submissions"),
      { params: Promise.resolve({ id: "site-1" }) }
    );
    expect(res.status).toBe(401);
  });

  it("CONTACT-03.5: returns 404 when site does not exist", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: createMockClient({
        siteResult: { data: null, error: { message: "Not found" } },
        submissionsResult: { data: [] },
      }) as never,
      userId: "owner-1",
    });
    const res = await GET(
      new Request("http://localhost/api/dashboard/sites/site-1/submissions"),
      { params: Promise.resolve({ id: "site-1" }) }
    );
    expect(res.status).toBe(404);
  });

  it("CONTACT-03.3: returns 403 when user does not own site", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: createMockClient({
        siteResult: { data: { ...mockSite, owner_id: "other-owner" } as never, error: undefined },
        submissionsResult: { data: [] },
      }) as never,
      userId: "owner-1",
    });
    const res = await GET(
      new Request("http://localhost/api/dashboard/sites/site-1/submissions"),
      { params: Promise.resolve({ id: "site-1" }) }
    );
    expect(res.status).toBe(403);
  });

  it("CONTACT-03.2: returns 200 with empty list when site has no submissions", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: createMockClient({
        siteResult: { data: mockSite as never, error: undefined },
        submissionsResult: { data: [] },
      }) as never,
      userId: "owner-1",
    });
    const res = await GET(
      new Request("http://localhost/api/dashboard/sites/site-1/submissions"),
      { params: Promise.resolve({ id: "site-1" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(0);
  });

  it("CONTACT-03.1: returns 200 with submissions (newest first)", async () => {
    vi.mocked(getDashboardSupabase).mockResolvedValue({
      client: createMockClient({
        siteResult: { data: mockSite as never, error: undefined },
        submissionsResult: { data: mockSubmissions as never },
      }) as never,
      userId: "owner-1",
    });
    const res = await GET(
      new Request("http://localhost/api/dashboard/sites/site-1/submissions"),
      { params: Promise.resolve({ id: "site-1" }) }
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
    expect(data).toHaveLength(2);
    expect(data[0]).toMatchObject({
      id: "sub-2",
      site_id: "site-1",
      name: "Jane",
      email: "jane@example.com",
      message: "Second message",
      created_at: "2025-02-15T12:00:00Z",
    });
    expect(data[1]).toMatchObject({
      id: "sub-1",
      name: "John",
      email: "john@example.com",
    });
  });
});
