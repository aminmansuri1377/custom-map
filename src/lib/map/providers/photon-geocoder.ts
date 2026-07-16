/**
 * Photon geocoder — komoot's free, no-key autocomplete/search service.
 * Great typo tolerance, perfect for search-as-you-type.
 *
 * Endpoint: https://photon.komoot.io/api/
 * Limits:   ~1 req/sec soft cap on the public instance.
 *           For production with many users, self-host Photon on an
 *           OSM extract (see README).
 */

import type { LngLat } from "../types";
import { ProviderError } from "../types";
import type { GeocoderProvider } from "./types";

interface PhotonProperties {
  name?: string;
  city?: string;
  country?: string;
  state?: string;
  osm_key?: string;
  osm_value?: string;
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties;
}

interface PhotonResponse {
  features: PhotonFeature[];
}

function buildLabel(p: PhotonProperties): string {
  return [p.name, p.city, p.state, p.country].filter(Boolean).join(", ");
}

export class PhotonGeocoder implements GeocoderProvider {
  readonly id = "photon";
  private readonly baseUrl: string;

  constructor(baseUrl = "https://photon.komoot.io/api") {
    this.baseUrl = baseUrl;
  }

  async search({
    text,
    focus,
    limit = 6,
  }: {
    text: string;
    focus?: LngLat;
    limit?: number;
  }): ReturnType<GeocoderProvider["search"]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set("q", text);
    url.searchParams.set("limit", String(limit));
    if (focus) {
      url.searchParams.set("lon", String(focus[0]));
      url.searchParams.set("lat", String(focus[1]));
    }

    const res = await fetch(url.toString());
    if (!res.ok) {
      throw new ProviderError(`Photon search failed (${res.status})`, res.status);
    }
    const data = (await res.json()) as PhotonResponse;

    return data.features.map((f) => {
      const p = f.properties;
      return {
        label: buildLabel(p),
        position: [f.geometry.coordinates[0], f.geometry.coordinates[1]],
        city: p.city,
        country: p.country,
        raw: f,
      };
    });
  }

  /**
   * Photon is forward-only; for reverse geocoding we compose with
   * Nominatim in the default bundle. Calling reverse() here throws
   * so misuse is loud and obvious.
   */
  async reverse(): ReturnType<GeocoderProvider["reverse"]> {
    throw new ProviderError("Photon does not support reverse geocoding");
  }
}
