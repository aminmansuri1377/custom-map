/**
 * OSRM router — fastest free car routing.
 *
 * Default endpoint is the **public demo server** at router.project-osrm.org.
 * It has NO SLA and is rate-limited — fine for development and low traffic.
 * For real production scale, self-host OSRM on a Geofabrik Iran extract
 * (https://download.geofabrik.de/asia/iran.html) and pass its URL to the
 * constructor. See README.
 */

import type { LngLat, RouteResult } from "../types";
import { ProviderError } from "../types";
import type { RoutingProvider } from "./types";

interface OsrmRoute {
  geometry: { coordinates: [number, number][] };
  distance: number;
  duration: number;
}

interface OsrmResponse {
  code: string;
  routes: OsrmRoute[];
}

export class OsrmRouter implements RoutingProvider {
  readonly id = "osrm";
  private readonly baseUrl: string;
  private readonly profile: string;

  /**
   * @param baseUrl OSRM HTTP server root.
   * @param profile OSRM profile path segment (`driving` by default).
   */
  constructor(
    baseUrl = "https://router.project-osrm.org",
    profile = "driving",
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.profile = profile;
  }

  async route({
    points,
  }: {
    points: LngLat[];
  }): Promise<RouteResult> {
    if (points.length < 2) {
      throw new ProviderError("Routing needs at least two points");
    }
    // OSRM expects coordinates as lng,lat joined by ; — note the order!
    const coordStr = points.map(([lng, lat]) => `${lng},${lat}`).join(";");
    const url =
      `${this.baseUrl}/route/v1/${this.profile}/${coordStr}` +
      `?overview=full&geometries=geojson`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new ProviderError(`OSRM request failed (${res.status})`, res.status);
    }
    const data = (await res.json()) as OsrmResponse;
    if (data.code !== "Ok" || !data.routes.length) {
      throw new ProviderError(`OSRM could not route (code: ${data.code})`);
    }
    const best = data.routes[0];

    return {
      coordinates: best.geometry.coordinates.map(([lng, lat]) => [lng, lat] as LngLat),
      distance: best.distance,
      duration: best.duration,
      raw: data,
    };
  }
}
