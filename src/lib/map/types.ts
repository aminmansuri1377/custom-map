/**
 * Core shared types for the custom-map library.
 * These are intentionally framework-agnostic so the library
 * stays decoupled from any specific map renderer or data provider.
 */

/** A [longitude, latitude] pair — matches GeoJSON / MapLibre convention. */
export type LngLat = [number, number];

/** Optional bounding box: [west, south, east, north]. */
export type BoundingBox = [number, number, number, number];

/** A named, selectable basemap style. */
export interface MapStyle {
  /** Stable id, e.g. `"positron"`. */
  id: string;
  /** Human label in English (override at the UI layer for i18n). */
  label: string;
  /** Style URL or style object accepted by MapLibre's `style` prop. */
  style: string;
  /** Whether this is a dark theme (lets the UI pick fitting accents). */
  dark?: boolean;
}

/**
 * A marker to render on the map. UI-agnostic — the renderer decides
 * whether to draw a DOM marker, a pulsing ring, or a symbol layer.
 */
export interface MarkerSpec {
  id: string;
  position: LngLat;
  /** Title used for popups / tooltips / accessibility. */
  title?: string;
  /** Optional description shown in a popup. */
  description?: string;
  /** Visual variant. Renderers fall back to "default". */
  variant?: "default" | "pulse" | "pin";
  /** Accent color (CSS color) used by the renderer. */
  color?: string;
}

/** A geographic feature result coming back from a geocoder. */
export interface GeocodeResult {
  /** Display name (already localized by the provider). */
  label: string;
  position: LngLat;
  /** Optional structured pieces for richer UI. */
  city?: string;
  country?: string;
  /** Optional bounding box for fitting the view. */
  bbox?: BoundingBox;
  /** Raw provider payload, untouched. */
  raw?: unknown;
}

/** Request params for forward geocoding (search by text). */
export interface GeocodeQuery {
  text: string;
  /** Prefer results near this point (provider support varies). */
  focus?: LngLat;
  /** Limit number of results. */
  limit?: number;
  /** BCP-47 language tag, e.g. `"en"` or `"fa"`. */
  language?: string;
}

/** Request params for reverse geocoding (coordinates → label). */
export interface ReverseQuery {
  position: LngLat;
  language?: string;
}

/**
 * A computed route between two or more points.
 * Geometry is GeoJSON LineString coordinates ([lng, lat] pairs).
 */
export interface RouteResult {
  /** Full polyline as [lng, lat] pairs. */
  coordinates: LngLat[];
  /** Total distance in meters. */
  distance: number;
  /** Total duration in seconds. */
  duration: number;
  /** Raw provider payload, untouched. */
  raw?: unknown;
}

/** Request params for routing A→B (optionally via waypoints). */
export interface RouteQuery {
  /** Ordered points: start, optional waypoints, end. */
  points: LngLat[];
  /** Routing profile (provider support varies). */
  profile?: "driving" | "walking" | "cycling";
  /** BCP-47 language tag for instructions (if supported). */
  language?: string;
}

/** Common error shape thrown by providers. */
export class ProviderError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ProviderError";
    this.status = status;
  }
}
