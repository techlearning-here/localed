/**
 * Unit tests for published site storage (CDN base URL, site URL, Supabase upload/delete).
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import {
  getArtifactPathPrefix,
  getPublishedCdnBaseUrl,
  getPublishedSiteUrl,
  uploadPublishedHtmlToSupabase,
  deletePublishedArtifactsFromSupabase,
  uploadPublishedHtml,
  deletePublishedArtifacts,
  type PublishedSitesBucket,
} from "./published-storage";

describe("published-storage", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("getArtifactPathPrefix", () => {
    it("returns sites/{siteId}/", () => {
      expect(getArtifactPathPrefix("abc-123")).toBe("sites/abc-123/");
      expect(getArtifactPathPrefix("xyz")).toBe("sites/xyz/");
    });
  });

  describe("getPublishedCdnBaseUrl", () => {
    beforeEach(() => {
      delete process.env.PUBLISHED_SITES_CDN_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    });

    it("returns PUBLISHED_SITES_CDN_URL when set (no trailing slash)", () => {
      process.env.PUBLISHED_SITES_CDN_URL = "https://cdn.example.com/";
      expect(getPublishedCdnBaseUrl()).toBe("https://cdn.example.com");
    });

    it("returns Supabase Storage public URL when only NEXT_PUBLIC_SUPABASE_URL is set", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://xxx.supabase.co";
      expect(getPublishedCdnBaseUrl()).toBe(
        "https://xxx.supabase.co/storage/v1/object/public/published-sites"
      );
    });

    it("prefers PUBLISHED_SITES_CDN_URL over Supabase URL", () => {
      process.env.PUBLISHED_SITES_CDN_URL = "https://r2.dev";
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://xxx.supabase.co";
      expect(getPublishedCdnBaseUrl()).toBe("https://r2.dev");
    });

    it("returns empty string when neither env is set", () => {
      expect(getPublishedCdnBaseUrl()).toBe("");
    });
  });

  describe("getPublishedSiteUrl", () => {
    beforeEach(() => {
      delete process.env.PUBLISHED_SITES_CDN_URL;
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    });

    it("returns full URL when base is set and path is sites/{id}", () => {
      process.env.PUBLISHED_SITES_CDN_URL = "https://cdn.example.com";
      expect(getPublishedSiteUrl("sites/abc-123")).toBe(
        "https://cdn.example.com/sites/abc-123/index.html"
      );
    });

    it("prefixes path with sites/ when artifactPath is just id", () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://xxx.supabase.co";
      expect(getPublishedSiteUrl("abc-123")).toBe(
        "https://xxx.supabase.co/storage/v1/object/public/published-sites/sites/abc-123/index.html"
      );
    });

    it("returns empty string when base URL is not set", () => {
      expect(getPublishedSiteUrl("sites/abc")).toBe("");
    });
  });

  describe("uploadPublishedHtmlToSupabase", () => {
    it("calls storage.from(bucket).upload with path, html, and options; returns true when no error", async () => {
      const upload = vi.fn().mockResolvedValue({ error: null });
      const from = vi.fn().mockReturnValue({ upload });
      const supabase = {
        storage: { from: from },
      } as unknown as Parameters<typeof uploadPublishedHtmlToSupabase>[0];

      const result = await uploadPublishedHtmlToSupabase(
        supabase,
        "site-id-1",
        "<html>test</html>"
      );

      expect(result).toBe(true);
      expect(from).toHaveBeenCalledWith("published-sites");
      expect(upload).toHaveBeenCalledWith(
        "sites/site-id-1/index.html",
        "<html>test</html>",
        { contentType: "text/html; charset=utf-8", upsert: true }
      );
    });

    it("returns false when upload returns error", async () => {
      const upload = vi.fn().mockResolvedValue({ error: { message: "Bucket not found" } });
      const from = vi.fn().mockReturnValue({ upload });
      const supabase = {
        storage: { from: from },
      } as unknown as Parameters<typeof uploadPublishedHtmlToSupabase>[0];

      const result = await uploadPublishedHtmlToSupabase(
        supabase,
        "site-id-1",
        "<html></html>"
      );

      expect(result).toBe(false);
    });
  });

  describe("deletePublishedArtifactsFromSupabase", () => {
    it("calls storage.from(bucket).remove with path", async () => {
      const remove = vi.fn().mockResolvedValue({ error: null });
      const from = vi.fn().mockReturnValue({ remove });
      const supabase = {
        storage: { from: from },
      } as unknown as Parameters<typeof deletePublishedArtifactsFromSupabase>[0];

      await deletePublishedArtifactsFromSupabase(supabase, "site-id-1");

      expect(from).toHaveBeenCalledWith("published-sites");
      expect(remove).toHaveBeenCalledWith(["sites/site-id-1/index.html"]);
    });
  });

  describe("uploadPublishedHtml", () => {
    it("uses R2 bucket when provided", async () => {
      const put = vi.fn().mockResolvedValue(undefined);
      const bucket: PublishedSitesBucket = {
        put,
        list: vi.fn().mockResolvedValue({ objects: [], truncated: false }),
        delete: vi.fn().mockResolvedValue(undefined),
      };

      const result = await uploadPublishedHtml(bucket, "id-1", "<html></html>");

      expect(result).toBe(true);
      expect(put).toHaveBeenCalledWith(
        "sites/id-1/index.html",
        "<html></html>",
        expect.objectContaining({ httpMetadata: { contentType: "text/html; charset=utf-8" } })
      );
    });

    it("uses Supabase when bucket is undefined and supabase is provided", async () => {
      const upload = vi.fn().mockResolvedValue({ error: null });
      const from = vi.fn().mockReturnValue({ upload });
      const supabase = {
        storage: { from: from },
      } as unknown as Parameters<typeof uploadPublishedHtml>[3];

      const result = await uploadPublishedHtml(undefined, "id-2", "<html>supabase</html>", supabase);

      expect(result).toBe(true);
      expect(upload).toHaveBeenCalledWith(
        "sites/id-2/index.html",
        "<html>supabase</html>",
        expect.any(Object)
      );
    });
  });

  describe("deletePublishedArtifacts", () => {
    it("uses R2 bucket when provided", async () => {
      const list = vi.fn().mockResolvedValue({
        objects: [{ key: "sites/id-1/index.html" }],
        truncated: false,
      });
      const deleteKeys = vi.fn().mockResolvedValue(undefined);
      const bucket: PublishedSitesBucket = {
        put: vi.fn(),
        list,
        delete: deleteKeys,
      };

      await deletePublishedArtifacts(bucket, "id-1");

      expect(list).toHaveBeenCalledWith(expect.objectContaining({ prefix: "sites/id-1/" }));
      expect(deleteKeys).toHaveBeenCalledWith(["sites/id-1/index.html"]);
    });

    it("uses Supabase when bucket is undefined and supabase is provided", async () => {
      const remove = vi.fn().mockResolvedValue({ error: null });
      const from = vi.fn().mockReturnValue({ remove });
      const supabase = {
        storage: { from: from },
      } as unknown as Parameters<typeof deletePublishedArtifacts>[2];

      await deletePublishedArtifacts(undefined, "id-2", supabase);

      expect(remove).toHaveBeenCalledWith(["sites/id-2/index.html"]);
    });
  });
});
