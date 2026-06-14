"use client";

/**
 * Custom Next.js image loader — proxy gambar CDN MovieBox via VPS + Pillow.
 *
 * Untuk gambar remote: encode URL ke base64 → /api/image-proxy?u=...&w=...&q=...
 * Untuk gambar lokal (/, data:): langsung return src tanpa proxy.
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/images#loader
 */

function toBase64Url(str: string): string {
  // btoa aman untuk ASCII-only URLs; tidak perlu unescape/encodeURIComponent
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export default function imageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}): string {
  // Gambar lokal (/, /logo.png, etc.) — tidak perlu proxy
  if (src.startsWith("/")) {
    return src;
  }

  // Data URI / blob — return langsung
  if (src.startsWith("data:") || src.startsWith("blob:")) {
    return src;
  }

  // CDN remote URL — encode ke base64url
  const encoded = toBase64Url(src);
  const params = new URLSearchParams();
  params.set("u", encoded);
  params.set("w", String(width));
  if (quality) params.set("q", String(quality));

  return `/api/image-proxy?${params.toString()}`;
}
