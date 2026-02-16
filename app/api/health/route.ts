import { NextResponse } from "next/server";

/**
 * AUTH-01 — Health endpoint.
 * GET /api/health returns 200 and JSON { status: "ok" }.
 * HEAD /api/health returns 200 with no body (same semantics for health checks).
 */
export async function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}
