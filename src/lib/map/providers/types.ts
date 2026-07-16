/**
 * Provider adapter interfaces.
 *
 * The UI never talks to a specific geocoder or router directly.
 * It depends on these interfaces, so you can swap the default
 * no-key public providers for self-hosted or commercial ones
 * (e.g. self-hosted OSRM, OpenRouteService, Neshan) without
 * touching a single component.
 */

import type {
  GeocodeQuery,
  GeocodeResult,
  ReverseQuery,
  RouteQuery,
  RouteResult,
} from "../types";

/** Forward + reverse geocoding (text ⇄ coordinates). */
export interface GeocoderProvider {
  readonly id: string;
  /** Search by free text (with optional focus point). */
  search(query: GeocodeQuery): Promise<GeocodeResult[]>;
  /** Resolve coordinates to a human label. */
  reverse(query: ReverseQuery): Promise<GeocodeResult | null>;
}

/** Turn-by-turn routing between points. */
export interface RoutingProvider {
  readonly id: string;
  /** Compute a route for the given ordered points. */
  route(query: RouteQuery): Promise<RouteResult>;
}

/**
 * The set of providers the library was configured with.
 * Components receive this via React context (see `MapProvider`)
 * so the whole tree shares one source of truth.
 */
export interface ProviderBundle {
  geocoder: GeocoderProvider;
  router: RoutingProvider;
}
