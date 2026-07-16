"use client";

/**
 * MapView — the SSR-safe entry point to the map.
 *
 * Next.js 16 App Router forbids `ssr:false` in Server Components.
 * MapLibre touches `window`/WebGL at import time, so we wrap the
 * real canvas in a client-side dynamic import. Server Components
 * and other Client Components can import <MapView> freely.
 *
 * The RTL text plugin is loaded here (inside the ssr:false boundary)
 * so that Farsi/Arabic map labels render with correct character
 * joining and ordering on the WebGL canvas.
 */

import dynamic from "next/dynamic";
import type { MapCanvasProps } from "./map-canvas";

// A lightweight skeleton shown while the map bundle loads.
function MapSkeleton() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background:
          "radial-gradient(circle at 30% 20%, #e4e7ec 0%, #f5f6f8 40%, #eceef2 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#71717a",
        fontSize: 14,
        letterSpacing: 0.3,
      }}
      aria-busy="true"
      aria-label="Loading map"
    >
      <span style={{ opacity: 0.7 }}>Loading map…</span>
    </div>
  );
}

const MapCanvas = dynamic(
  () =>
    // Load the RTL text plugin FIRST, then the map canvas.
    // Both run only in the browser (ssr: false).
    import("maplibre-gl").then(async (maplibregl) => {
      await maplibregl.setRTLTextPlugin(
        "/mapbox-gl-rtl-text.js",
        false, // load immediately so Farsi is correct on first paint
      );
      const mod = await import("./map-canvas");
      return mod.MapCanvas;
    }),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

export function MapView(props: MapCanvasProps) {
  return <MapCanvas {...props} />;
}
