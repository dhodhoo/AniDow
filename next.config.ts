import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    remotePatterns: [
      // Domain CDN anime (Otakudesu & mirror)
      {
        protocol: "https",
        hostname: "otakudesu.blog",
      },
      {
        protocol: "https",
        hostname: "**.otakudesu.blog",
      },
      // Domain CDN MovieBox
      {
        protocol: "https",
        hostname: "aoneroom.com",
      },
      {
        protocol: "https",
        hostname: "**.aoneroom.com",
      },
      {
        protocol: "https",
        hostname: "hakunaymatata.com",
      },
      {
        protocol: "https",
        hostname: "**.hakunaymatata.com",
      },
      {
        protocol: "https",
        hostname: "inmoviebox.com",
      },
      {
        protocol: "https",
        hostname: "**.inmoviebox.com",
      },
      {
        protocol: "https",
        hostname: "moviebox.ng",
      },
      {
        protocol: "https",
        hostname: "**.moviebox.ng",
      },
      {
        protocol: "https",
        hostname: "moviebox.ph",
      },
      {
        protocol: "https",
        hostname: "**.moviebox.ph",
      },
      {
        protocol: "https",
        hostname: "netpop.app",
      },
      {
        protocol: "https",
        hostname: "**.netpop.app",
      },
      {
        protocol: "https",
        hostname: "fmoviesunblocked.net",
      },
      {
        protocol: "https",
        hostname: "**.fmoviesunblocked.net",
      },
      {
        protocol: "https",
        hostname: "videodownloader.site",
      },
      {
        protocol: "https",
        hostname: "**.videodownloader.site",
      },
    ],
  },

  // Security headers (CSP, X-Frame-Options, dll)
  async headers() {
    // Development: izinkan localhost backend (HTTP)
    const isDev = process.env.NODE_ENV === "development";
    const connectSrc = isDev
      ? "'self' http://127.0.0.1:* http://localhost:* https:"
      : "'self' https:";
    // blob: diperlukan untuk subtitle VTT yang di-convert client-side via URL.createObjectURL()
    const mediaSrc = isDev
      ? "blob: http: https:"
      : "blob: https:";

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      `media-src ${mediaSrc}`,
      `connect-src ${connectSrc}`,
      "frame-src https:",
      "img-src 'self' https: data: blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
