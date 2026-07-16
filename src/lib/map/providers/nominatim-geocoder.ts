/**
 * Nominatim geocoder — OpenStreetMap's free, no-key geocoder.
 *
 * Endpoint: https://nominatim.openstreetmap.org
 * Limits:   1 req/sec hard cap, requires a descriptive Referer/User-Agent.
 *           For production with many users, self-host Nominatim on a
 *           Geofabrik extract (see README).
 *
 * We use it mainly for **reverse** geocoding (coordinates → label),
 * which complements Photon's forward search.
 */

import type { LngLat } from "../types";
import { ProviderError } from "../types";
import type { GeocoderProvider } from "./types";

interface NominatimAddress {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  state?: string;
  country?: string;
}

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
  boundingbox?: [string, string, string, string];
}

/**
 * Custom User-Agent / Referer. Nominatim's usage policy requires a
 * identifiable client. If you self-host, you can drop this.
 */
const DEFAULT_HEADERS: HeadersInit = {
  // Nominatim reads Referer from the browser automatically; on the
  // server you'd set a User-Agent instead. We keep it minimal here.
  Accept: "application/json",
};

export class NominatimGeocoder implements GeocoderProvider {
  readonly id = "nominatim";
  private readonly baseUrl: string;

  constructor(baseUrl = "https://nominatim.openstreetmap.org") {
    this.baseUrl = baseUrl;
  }

  async search({
    text,
    limit = 6,
    language = "en",
  }: {
    text: string;
    limit?: number;
    language?: string;
  }): ReturnType<GeocoderProvider["search"]> {
    const url = new URL(`${this.baseUrl}/search`);
    url.searchParams.set("q", text);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("addressdetails", "1");
    if (language) url.searchParams.set("accept-language", language);

    const res = await fetch(url.toString(), { headers: DEFAULT_HEADERS });
    if (!res.ok) {
      throw new ProviderError(`Nominatim search failed (${res.status})`, res.status);
    }
    const data = (await res.json()) as NominatimResult[];

    return data.map((r) => ({
      label: r.display_name,
      position: [Number(r.lon), Number(r.lat)] as LngLat,
      city: r.address?.city ?? r.address?.town ?? r.address?.village,
      country: r.address?.country,
      raw: r,
    }));
  }

  async reverse({
    position,
    language = "en",
  }: {
    position: LngLat;
    language?: string;
  }): ReturnType<GeocoderProvider["reverse"]> {
    const url = new URL(`${this.baseUrl}/reverse`);
    url.searchParams.set("lon", String(position[0]));
    url.searchParams.set("lat", String(position[1]));
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("addressdetails", "1");
    if (language) url.searchParams.set("accept-language", language);

    const res = await fetch(url.toString(), { headers: DEFAULT_HEADERS });
    if (!res.ok) {
      throw new ProviderError(`Nominatim reverse failed (${res.status})`, res.status);
    }
    const r = (await res.json()) as NominatimResult;
    if (!r || r.lat === undefined) return null;

    return {
      label: r.display_name,
      position: [Number(r.lon), Number(r.lat)] as LngLat,
      city: r.address?.city ?? r.address?.town ?? r.address?.village,
      country: r.address?.country,
      raw: r,
    };
  }
}
