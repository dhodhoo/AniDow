/**
 * /api/image-proxy?u=<base64_cdn_url>&w=<width>&q=<quality>
 *
 * Server-side: forward ke VPS /image dengan X-API-Key.
 * Tidak ada HMAC URL signing — API key ada di server.
 *
 * Cache-Control: immutable selama 1 tahun (URL CDN unik = immutable).
 */
export const dynamic = "force-dynamic";

// CDN host suffix yang diizinkan — hanya dari MovieBox CDN
const CDN_SUFFIXES: string[] = [
  ".aoneroom.com",
  ".hakunaymatata.com",
  ".inmoviebox.com",
  ".moviebox.ng",
  ".moviebox.ph",
  ".netpop.app",
  ".fmoviesunblocked.net",
  ".videodownloader.site",
];

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.pathname.includes("..")) return false;
    return CDN_SUFFIXES.some((suffix) => parsed.hostname.endsWith(suffix));
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const u = searchParams.get("u");   // base64 CDN URL
  const w = searchParams.get("w");   // width
  const q = searchParams.get("q");   // quality

  if (!u || !w) {
    return new Response("Missing u or w", { status: 400 });
  }

  // Decode & validasi URL CDN (base64url → standard base64 → decode)
  let cdnUrl: string;
  try {
    const std = u.replace(/-/g, "+").replace(/_/g, "/");
    const padded = std + "=".repeat((4 - (std.length % 4)) % 4);
    cdnUrl = Buffer.from(padded, "base64").toString("utf-8");
  } catch {
    return new Response("Invalid base64 encoding", { status: 400 });
  }

  if (!isValidImageUrl(cdnUrl)) {
    return new Response("CDN host not allowed", { status: 403 });
  }

  // Build VPS URL
  const vpsBase = process.env.MOVIEBOX_API_BASE_URL;
  if (!vpsBase) {
    return new Response("Server config error", { status: 500 });
  }

  const vpsUrl = new URL(`${vpsBase}/image`);
  vpsUrl.searchParams.set("src", u);
  vpsUrl.searchParams.set("w", w);
  const h = searchParams.get("h");
  if (h) vpsUrl.searchParams.set("h", h);
  vpsUrl.searchParams.set("q", q || "75");

  try {
    const response = await fetch(vpsUrl.toString(), {
      headers: {
        "X-API-Key": process.env.MOVIEBOX_API_KEY || "",
        "X-Real-IP": "127.0.0.1",
      },
      // cache di Vercel Data Cache (server-side)
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");
      // Log tapi jangan bocorkan ke client
      console.error("Image proxy error: %d %s", response.status, body.slice(0, 200));
      return new Response("Image proxy error", { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "image/webp";
    const cacheControl = response.headers.get("cache-control") || "public, max-age=86400";

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": `${cacheControl}, immutable`,
      },
    });
  } catch (error) {
    console.error("Image proxy fetch failed:", error);
    return new Response("Image proxy unavailable", { status: 502 });
  }
}
