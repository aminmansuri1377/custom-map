import type { Metadata } from "next";
import "./globals.css";
// MapLibre core CSS + library styles. Importing here keeps it global so
// the dynamically-loaded map island has its styles ready on first paint.
import "@/lib/map/styles/map.css";

export const metadata: Metadata = {
  title: "Custom Map — Beautiful, free maps for Next.js",
  description:
    "A reusable, animated map/location toolkit built on MapLibre GL JS. Free providers, no API key, no credit card.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-950">{children}</body>
    </html>
  );
}
