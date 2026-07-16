/**
 * custom-map — a reusable, beautiful, free map/location library.
 *
 * Built on MapLibre GL JS (fast WebGL, animated) + @vis.gl/react-maplibre.
 * 100% free providers by default (OpenFreeMap, Photon, Nominatim, OSRM) —
 * no API key, no credit card. All providers are swappable.
 *
 * Public API surface. Import what you need from here:
 *   import { MapView, MapProvider, PulsingMarker, RouteLine } from "@/lib/map";
 */

// Types (framework-agnostic)
export type {
  LngLat,
  BoundingBox,
  MapStyle,
  MarkerSpec,
  GeocodeResult,
  GeocodeQuery,
  ReverseQuery,
  RouteResult,
  RouteQuery,
} from "./types";
export { ProviderError } from "./types";

// Constants
export { DEFAULT_STYLES, DEFAULT_STYLE_ID, OPENFREEMAP_STYLES } from "./constants/styles";
export {
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  FLY_TO_OPTIONS,
  SEARCH_DEBOUNCE_MS,
  SEARCH_MIN_CHARS,
} from "./constants/defaults";

// Provider adapters (interfaces + default impls)
export {
  defaultProviders,
  createDefaultProviders,
  PhotonGeocoder,
  NominatimGeocoder,
  OsrmRouter,
} from "./providers";
export type {
  GeocoderProvider,
  RoutingProvider,
  ProviderBundle,
} from "./providers";

// React components & hooks
export { MapProvider, useMapContext, type Language } from "./components/map-provider";
export { MapView } from "./components/map-view.client";
export { MapCanvas, type MapCanvasProps } from "./components/map-canvas";
export { PulsingMarker, type PulsingMarkerProps } from "./components/markers/pulsing-marker";
export {
  AnimatedRouteMarker,
  type AnimatedRouteMarkerProps,
} from "./components/markers/animated-route-marker";
export { RouteLine, type RouteLineProps } from "./components/route-line";
export { SearchBox, type SearchBoxProps } from "./components/search-box";
export { StyleSwitcher } from "./components/style-switcher";
export { LocationButton, type LocationButtonProps } from "./components/location-button";
export { useGeocoder, type UseGeocoderResult } from "./hooks/use-geocoder";
export { useRoute, type UseRouteResult } from "./hooks/use-route";
export {
  useAnimatedRoute,
  type UseAnimatedRouteOptions,
  type UseAnimatedRouteResult,
} from "./hooks/use-animated-route";

// i18n helpers (library controls' own strings)
export { STRINGS, t, type StringKey } from "./i18n/strings";
