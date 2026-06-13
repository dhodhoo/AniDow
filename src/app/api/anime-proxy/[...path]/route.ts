import { AnimeApiError, animeApi } from "@/lib/anime-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Rate limit per IP: 30 req/menit (cegah abuse upstream anime API)
const PROXY_RATE_LIMIT = 30;
const PROXY_RATE_WINDOW = 60_000;
const proxyRateBuckets = new Map<string, number[]>();

function checkProxyRate(ip: string): boolean {
  const now = Date.now();
  const bucket = (proxyRateBuckets.get(ip) || []).filter((t) => now - t < PROXY_RATE_WINDOW);
  if (bucket.length >= PROXY_RATE_LIMIT) return false;
  bucket.push(now);
  proxyRateBuckets.set(ip, bucket);
  return true;
}

// Allowlist endpoint yang diizinkan diproxy
const ALLOWED_ENDPOINTS: { pattern: RegExp; paramNames: string[] }[] = [
  { pattern: /^home$/, paramNames: [] },
  { pattern: /^ongoing$/, paramNames: ["page"] },
  { pattern: /^complete$/, paramNames: ["page"] },
  { pattern: /^anime-list$/, paramNames: [] },
  { pattern: /^genres$/, paramNames: [] },
  { pattern: /^genre\/[a-z0-9-]+$/, paramNames: ["page"] },
  { pattern: /^schedule$/, paramNames: [] },
  { pattern: /^search$/, paramNames: ["q"] },
  { pattern: /^anime\/[a-z0-9-]+$/, paramNames: [] },
  { pattern: /^episode\/[a-z0-9-]+$/, paramNames: ["skipMirrors"] },
];

// Block path traversal dan karakter mencurigakan
const SUSPICIOUS_PATH = /(?:\.\.|%2e%2e|%252e|%c0%ae|%u002e|\\|[<>{}|;$`'"])/i;

function isValidPath(path: string): boolean {
  return ALLOWED_ENDPOINTS.some((entry) => entry.pattern.test(path));
}

function isSuspicious(path: string): boolean {
  return SUSPICIOUS_PATH.test(path);
}

function getAllowedParams(path: string): Set<string> {
  for (const entry of ALLOWED_ENDPOINTS) {
    if (entry.pattern.test(path)) {
      return new Set(entry.paramNames);
    }
  }
  return new Set();
}

function sanitizeParams(params: Record<string, string>, path: string): Record<string, string> {
  const allowed = getAllowedParams(path);
  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(params)) {
    if (!allowed.has(key)) continue;
    // Batasi panjang value
    if (value.length > 500) continue;
    sanitized[key] = value;
  }
  return sanitized;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");

  // Validasi path
  if (pathStr.length > 200 || isSuspicious(pathStr)) {
    return NextResponse.json({ error: "Invalid request path" }, { status: 400 });
  }

  if (!isValidPath(pathStr)) {
    return NextResponse.json({ error: "Endpoint not allowed" }, { status: 403 });
  }

  // Rate limit per IP
  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")
    || "127.0.0.1";
  if (!checkProxyRate(clientIp)) {
    return NextResponse.json({ error: "Terlalu banyak request. Coba lagi sebentar." }, { status: 429 });
  }

  const backendPath = `/api/${pathStr}`;
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());
  const safeParams = sanitizeParams(queryParams, pathStr);

  // Forward client IP ke backend agar rate limit per-user, bukan per-proxy
  try {
    const data = await animeApi<unknown>(backendPath, {
      params: safeParams,
      revalidate: 0,
      headers: { "X-Real-IP": clientIp },
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AnimeApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Layanan anime sedang tidak dapat diakses." },
      { status: 502 }
    );
  }
}
