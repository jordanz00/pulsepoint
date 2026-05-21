import { NextResponse } from "next/server";

/**
 * Standard health check for monitoring / load balancers (integration contract v1).
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "pulsepoint",
    version: process.env.npm_package_version ?? "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
