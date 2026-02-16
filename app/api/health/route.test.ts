/**
 * AUTH-01 — Health endpoint (backend)
 * Acceptance: GET /api/health returns 200, JSON body with status "ok"
 * HEAD /api/health returns 200 with no body
 */
import { describe, it, expect } from "vitest";
import { GET, HEAD } from "./route";

function getRequest(url = "http://localhost/api/health") {
  return new Request(url, { method: "GET" });
}

function headRequest(url = "http://localhost/api/health") {
  return new Request(url, { method: "HEAD" });
}

describe("AUTH-01 Health endpoint", () => {
  it("AUTH-01.1: GET /api/health returns status 200", async () => {
    const res = await GET(getRequest());
    expect(res.status).toBe(200);
  });

  it("AUTH-01.2: response body contains status ok", async () => {
    const res = await GET(getRequest());
    const data = await res.json();
    expect(data).toHaveProperty("status", "ok");
  });

  it("AUTH-01.3: response is JSON", async () => {
    const res = await GET(getRequest());
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType).toMatch(/application\/json/);
  });

  it("HEAD /api/health returns 200 with no body", async () => {
    const res = await HEAD(headRequest());
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toBe("");
  });
});
