import type { NextConfig } from "next";

/**
 * Portraitify is a fully client-side PWA. The service worker is hand-rolled
 * (public/sw.js) rather than plugin-generated so offline support works under
 * Next.js 16's Turbopack builds — network-first for documents, cache-first
 * for static assets, with the app shell precached at install time.
 */
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Always revalidate the SW script so updates ship immediately.
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        source: "/manifest.json",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
      {
        // Icons are immutable fingerprints of the build.
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;
