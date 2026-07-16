"use client";

/**
 * useAnimatedRoute — animate a marker along a polyline.
 *
 * Uses @turf to interpolate positions along the route so the marker
 * follows the actual road geometry, not just a straight line. Driven
 * by requestAnimationFrame; respects prefers-reduced-motion (jumps to
 * the end instead of animating).
 *
 * Implementation notes:
 *  - The animation loop is kept in a ref (`tickRef`) so the rAF callback
 *    never closes over a stale function and there's no recursive
 *    `useCallback` (which trips react-hooks/immutability).
 *  - State resets on coordinate change are done in an effect. This is the
 *    correct use of an effect (syncing external "route geometry" state
 *    into React state), so we disable the set-state-in-effect rule locally.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { along, length } from "@turf/turf";
import type { Feature, LineString } from "geojson";
import type { LngLat } from "../types";

export interface UseAnimatedRouteOptions {
  /** Total animation duration in ms. Default 6000. */
  durationMs?: number;
  /** Loop the animation. Default false. */
  loop?: boolean;
  /** Start automatically. Default true. */
  autoPlay?: boolean;
}

export interface UseAnimatedRouteResult {
  /** Current marker position [lng, lat], or null when idle. */
  position: LngLat | null;
  /** Progress 0..1. */
  progress: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
}

export function useAnimatedRoute(
  coordinates: LngLat[] | null,
  options: UseAnimatedRouteOptions = {},
): UseAnimatedRouteResult {
  const { durationMs = 6000, loop = false, autoPlay = true } = options;
  const [position, setPosition] = useState<LngLat | null>(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const pausedAtRef = useRef(0);
  const isPlayingRef = useRef(false);

  // Precomputed route geometry.
  const line = useRef<Feature<LineString> | null>(null);
  const totalKm = useRef(0);

  // Keep the rAF callback in a ref to avoid recursive useCallback.
  const tickRef = useRef<(now: number) => void>(() => {});

  const cancelRaf = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  // Define the loop body and store it in the ref.
  useEffect(() => {
    tickRef.current = (now: number) => {
      if (!line.current || startRef.current === null || totalKm.current === 0) return;
      const elapsed = now - startRef.current;
      const t = Math.min(elapsed / durationMs, 1);

      setProgress(t);
      const d = t * totalKm.current;
      try {
        const pt = along(line.current, d, { units: "kilometers" });
        if (pt?.geometry?.coordinates) {
          const [lng, lat] = pt.geometry.coordinates;
          setPosition([lng, lat]);
        }
      } catch {
        // Turf can throw on degenerate geometries; silently skip frame.
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tickRef.current);
      } else if (loop) {
        startRef.current = now;
        rafRef.current = requestAnimationFrame(tickRef.current);
      } else {
        setIsPlaying(false);
        isPlayingRef.current = false;
        startRef.current = null;
        rafRef.current = null;
      }
    };
  }, [durationMs, loop]);

  const play = useCallback(() => {
    if (!line.current || isPlayingRef.current || totalKm.current === 0) return;
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      // Skip straight to the end.
      setProgress(1);
      try {
        const pt = along(line.current, totalKm.current, { units: "kilometers" });
        if (pt?.geometry?.coordinates) {
          setPosition(pt.geometry.coordinates as LngLat);
        }
      } catch {
        // Degenerate geometry — stay at start.
      }
      return;
    }
    setIsPlaying(true);
    isPlayingRef.current = true;
    startRef.current = performance.now() - pausedAtRef.current * durationMs;
    rafRef.current = requestAnimationFrame(tickRef.current);
  }, [durationMs]);

  const pause = useCallback(() => {
    if (!isPlayingRef.current) return;
    setIsPlaying(false);
    isPlayingRef.current = false;
    pausedAtRef.current = progress;
    cancelRaf();
    startRef.current = null;
  }, [progress, cancelRaf]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    isPlayingRef.current = false;
    pausedAtRef.current = 0;
    cancelRaf();
    startRef.current = null;
    setProgress(0);
    if (coordinates && coordinates.length) setPosition(coordinates[0]);
  }, [coordinates, cancelRaf]);

  // Sync external "route geometry" into local state when it changes.
  // This is exactly the effect-as-sync use case; setState here is correct.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    cancelRaf();
    isPlayingRef.current = false;
    if (!coordinates || coordinates.length < 2) {
      line.current = null;
      totalKm.current = 0;
      setPosition(null);
      setProgress(0);
      setIsPlaying(false);
      return;
    }
    line.current = {
      type: "Feature",
      geometry: { type: "LineString", coordinates },
      properties: {},
    };
    totalKm.current = length(line.current, { units: "kilometers" });
    setPosition(coordinates[0]);
    setProgress(0);
    setIsPlaying(false);
    pausedAtRef.current = 0;

    if (autoPlay) {
      // Defer to next tick so consumers can mount the marker first.
      const id = window.setTimeout(play, 250);
      return () => window.clearTimeout(id);
    }
    return undefined;
  }, [coordinates, autoPlay, play, cancelRaf]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Cleanup on unmount.
  useEffect(() => cancelRaf, [cancelRaf]);

  return { position, progress, isPlaying, play, pause, reset };
}
