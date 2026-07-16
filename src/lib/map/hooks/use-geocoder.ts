"use client";

/**
 * useGeocoder — search + reverse geocoding state machine.
 *
 * Reads the active geocoder from <MapProvider>, so swapping providers
 * (e.g. self-hosted Photon or Neshan) needs no UI changes.
 */

import { useCallback, useRef, useState } from "react";
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_CHARS } from "../constants/defaults";
import { useMapContext } from "../components/map-provider";
import type { GeocodeResult, LngLat } from "../types";

export interface UseGeocoderResult {
  /** Query string (controlled). */
  query: string;
  setQuery: (q: string) => void;
  /** Forward search results. */
  results: GeocodeResult[];
  /** True while a search request is in flight. */
  loading: boolean;
  /** Error message from the last search, if any. */
  error: string | null;
  /** Fire a forward search immediately (bypasses debounce). */
  search: (text: string) => Promise<void>;
  /** Reverse geocode a coordinate. */
  reverse: (position: LngLat) => Promise<GeocodeResult | null>;
  /** Clear results + query. */
  reset: () => void;
}

export function useGeocoder(): UseGeocoderResult {
  const { providers, language } = useMapContext();
  const [query, setQueryState] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reqIdRef = useRef(0);

  const search = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (trimmed.length < SEARCH_MIN_CHARS) {
        setResults([]);
        setError(null);
        return;
      }
      const myReq = ++reqIdRef.current;
      setLoading(true);
      setError(null);
      try {
        const res = await providers.geocoder.search({
          text: trimmed,
          language,
          limit: 6,
        });
        // Drop stale responses (older request finished later).
        if (myReq === reqIdRef.current) setResults(res);
      } catch (err) {
        if (myReq === reqIdRef.current) {
          setError(err instanceof Error ? err.message : "Search failed");
          setResults([]);
        }
      } finally {
        if (myReq === reqIdRef.current) setLoading(false);
      }
    },
    [providers.geocoder, language],
  );

  const setQuery = useCallback(
    (q: string) => {
      setQueryState(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => search(q), SEARCH_DEBOUNCE_MS);
    },
    [search],
  );

  const reverse = useCallback(
    async (position: LngLat) => {
      try {
        return await providers.geocoder.reverse({ position, language });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Reverse geocode failed");
        return null;
      }
    },
    [providers.geocoder, language],
  );

  const reset = useCallback(() => {
    setQueryState("");
    setResults([]);
    setError(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
  }, []);

  return { query, setQuery, results, loading, error, search, reverse, reset };
}
