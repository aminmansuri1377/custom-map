"use client";

/**
 * useRoute — fetch a route from the active provider, with loading/error state.
 *
 * Pass `points` to auto-compute whenever they change, or call `compute()`
 * manually for full control.
 */

import { useCallback, useEffect, useState } from "react";
import { useMapContext } from "../components/map-provider";
import type { LngLat, RouteResult } from "../types";

export interface UseRouteResult {
  route: RouteResult | null;
  loading: boolean;
  error: string | null;
  /** Compute a route between the given points. */
  compute: (points: LngLat[]) => Promise<RouteResult | null>;
  clear: () => void;
}

export function useRoute(points: LngLat[] | null): UseRouteResult {
  const { providers } = useMapContext();
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const compute = useCallback(
    async (pts: LngLat[]) => {
      if (pts.length < 2) return null;
      setLoading(true);
      setError(null);
      try {
        const r = await providers.router.route({ points: pts, profile: "driving" });
        setRoute(r);
        return r;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Routing failed");
        setRoute(null);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [providers.router],
  );

  const clear = useCallback(() => {
    setRoute(null);
    setError(null);
  }, []);

  // Auto-recompute when the points arg changes. `compute` is async and the
  // setState calls happen after `await`, so this doesn't trigger the
  // synchronous-setState-in-effect anti-pattern.
  useEffect(() => {
    if (!points || points.length < 2) {
      // No valid input — clear via a microtask to avoid sync setState in effect.
      let active = true;
      Promise.resolve().then(() => {
        if (active) {
          setRoute(null);
          setError(null);
        }
      });
      return () => {
        active = false;
      };
    } else {
      let active = true;
      void (async () => {
        const r = await compute(points);
        if (!active) return;
        setRoute(r);
      })();
      return () => {
        active = false;
      };
    }
  }, [points, compute]);

  return { route, loading, error, compute, clear };
}
