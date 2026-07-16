# custom-map

A reusable, beautiful, **100% free** map/location toolkit for **Next.js 16 + React 19**, built on **MapLibre GL JS** (fast WebGL, animated) — a modern replacement for react-leaflet.

- ⚡️ **Fast & animated** — GPU-rendered vector tiles, gradient routes, pulsing markers, moving vehicles
- 🎁 **Free by default** — no API key, **no credit card** anywhere in the default path
- 🔌 **Provider-agnostic** — swap geocoder/router/basemap behind adapter interfaces
- 🌐 **Bilingual** — English + Farsi (RTL) out of the box
- 🧩 **Reusable** — lives in `src/lib/map`, copy-paste into any Next.js project

## Quick start

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000.

## Stack

| Concern | Default (free, no key) | Self-host option for scale |
|---|---|---|
| Engine | `maplibre-gl@5` (WebGL) | — |
| React layer | `@vis.gl/react-maplibre@8` (React 19) | — |
| Basemap | **OpenFreeMap** (no key, no limits) | Protomaps/PMTiles (static file) |
| Search/autocomplete | **Photon** (komoot) | self-hosted Photon on an OSM extract |
| Reverse geocode | **Nominatim** (OSM) | self-hosted Nominatim |
| Routing | **OSRM** public demo | self-hosted OSRM on Geofabrik Iran extract |
| Route animation | `@turf/turf` | — |

## Using the library

Everything is exported from `@/lib/map`.

```tsx
import {
  MapProvider,
  MapView,
  SearchBox,
  StyleSwitcher,
  LocationButton,
  PulsingMarker,
  RouteLine,
  AnimatedRouteMarker,
  useRoute,
  useAnimatedRoute,
} from "@/lib/map";

export default function MyMap() {
  return (
    <MapProvider initialLanguage="en">
      <MapView className="h-[600px] w-full rounded-2xl">
        <SearchBox />
        <StyleSwitcher />
        <LocationButton />
        <PulsingMarker position={[51.39, 35.7]} color="#ef4444" title="Tehran" />
      </MapView>
    </MapProvider>
  );
}
```

### Drawing a route

```tsx
function RouteDemo({ start, end }: { start: LngLat; end: LngLat }) {
  const { route } = useRoute([start, end]);          // fetches from OSRM
  const { position } = useAnimatedRoute(route?.coordinates ?? null, {
    durationMs: 6000,
  });

  return route ? (
    <>
      <RouteLine id="my-route" coordinates={route.coordinates} />
      <AnimatedRouteMarker position={position} glyph="🚗" />
    </>
  ) : null;
}
```

### Click-to-route

`<MapView onMapClick={(lngLat) => ...} />` gives you `[lng, lat]` on every click — wire it to your state and feed `useRoute`.

## Swapping providers

Every provider is behind an interface. Replace one file, no UI changes.

```tsx
import {
  MapProvider,
  PhotonGeocoder,
  NominatimGeocoder,
  OsrmRouter,
  type ProviderBundle,
} from "@/lib/map";

// Point OSRM at your own server (unlimited, free)
const providers: ProviderBundle = {
  geocoder: new PhotonGeocoder("https://my-photon.example.org/api"),
  router: new OsrmRouter("https://my-osrm.example.org"),
};

<MapProvider providers={providers}>...</MapProvider>;
```

## Going to production with many users

The **default public services are rate-limited** (good for dev/low traffic). For real production scale without a credit card:

### Basemap — unlimited
- **OpenFreeMap** has no usage cap; you can stay on it.
- For full independence: download a **Protomaps `.pmtiles`** extract (see [Protomaps basemap downloads](https://docs.protomaps.com/basemaps/downloads)) or generate one, host it on any static storage (Cloudflare R2, S3, your server), and register the `pmtiles://` protocol. The `pmtiles` package is already installed.

### Routing — self-host OSRM (unlimited)
1. Download the Geofabrik Iran extract: https://download.geofabrik.de/asia/iran.html
2. Run OSRM backend + `osrm-extract` / `osrm-contract` on it.
3. Point `new OsrmRouter("https://your-osrm.example.org")` at it.

### Geocoding — self-host Photon or Nominatim (unlimited, Farsi support)
- Self-host **Photon** on an OSM extract for typo-tolerant autocomplete.
- Self-host **Nominatim** for reverse geocoding. Both honor `accept-language=fa` for Persian output.

### Persian accuracy (Iran-specific)
[Neshan Maps Platform](https://platform.neshan.org) offers Persian geocoding, traffic-aware routing, and Iran-optimized detail with a free signup (no credit card). Implement a `GeocoderProvider` + `RoutingProvider` against their API and drop it into `<MapProvider providers={...}>`.

## Architecture

```
src/lib/map/
├── index.ts                  public API
├── types.ts                  framework-agnostic types
├── constants/                OpenFreeMap styles, Tehran defaults
├── providers/                GeocoderProvider / RoutingProvider adapters
│   ├── photon-geocoder.ts    forward search (no key)
│   ├── nominatim-geocoder.ts reverse geocode (no key)
│   └── osrm-router.ts        routing (no key)
├── components/
│   ├── map-provider.tsx      React context (providers, style, language, map instance)
│   ├── map-view.client.tsx   SSR-safe dynamic({ssr:false}) island
│   ├── map-canvas.tsx        the actual <Map>
│   ├── markers/              pulsing + animated-route markers
│   ├── route-line.tsx        gradient + flowing-dash polyline
│   ├── search-box.tsx        debounced autocomplete
│   ├── style-switcher.tsx    basemap switcher
│   └── location-button.tsx   geolocation
├── hooks/                    useGeocoder, useRoute, useAnimatedRoute
├── i18n/                     library control strings (en/fa)
└── styles/                   maplibre.css + markers + controls
```

## SSR safety (Next.js App Router)

MapLibre touches `window`/WebGL at import time. `<MapView>` wraps the real map in `next/dynamic({ ssr: false })` inside a Client Component — the only supported pattern in the App Router. **Never import `maplibre-gl` from a Server Component**, and keep all map children inside `<MapView>`.

## Data & attribution

Map data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright) (ODbL). Rendering by [MapLibre GL JS](https://maplibre.org/). Basemap tiles by [OpenFreeMap](https://openfreemap.org).
