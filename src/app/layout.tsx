import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import ServiceWorkerRegister from "@/components/pwa/ServiceWorkerRegister";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Portraitify",
  title: {
    default: "Portraitify — Algorithmic Profile Image Generator",
    template: "%s · Portraitify",
  },
  description:
    "Transform your photos into algorithmic profile art. Six generative effects, exported at 1080×1080. Fully client-side — no uploads, works offline.",
  manifest: "/manifest.json",
  category: "graphics",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Portraitify",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/icon-152x152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-144x144.png", sizes: "144x144", type: "image/png" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    siteName: "Portraitify",
    title: "Portraitify — Algorithmic Profile Image Generator",
    description:
      "Turn any photo into generative profile art. Fully client-side, installable, works offline.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Portraitify" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Portraitify — Algorithmic Profile Image Generator",
    description:
      "Turn any photo into generative profile art. Fully client-side, installable, works offline.",
    images: ["/og-image.png"],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0A0A0A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-[#FAFAFA] font-sans text-[#0A0A0A] antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
