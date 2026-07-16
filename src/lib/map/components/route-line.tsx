"use client";

/**
 * RouteLine — a beautiful animated route polyline.
 *
 * Features:
 *  - **Gradient stroke** — color shifts along the route via MapLibre's
 *    `line-gradient` expression (requires a GeoJSON line source with a
 *    `line-progress` computed property).
 *  - **Animated flow** — a dashed overlay whose `line-dasharray` offset
 *    advances on a requestAnimationFrame loop, producing a "marching
 *    ants" / flowing effect along the route.
 *  - Optional origin/destination endpoint dots.
 *
 * Layers are namespaced by `id` so multiple routes can coexist.
 */

import { useEffect, useMemo, useRef } from "react";
import { Source, Layer } from "@vis.gl/react-maplibre";
import type { LineLayerSpecification } from "maplibre-gl";
import type { LngLat } from "../types";
import { useMapContext } from "./map-provider";

export interface RouteLineProps {
  /** Unique id for this route (used as source/layer namespace). */
  id: string;
  /** Ordered polyline coordinates. */
  coordinates: LngLat[];
  /** Start color of the gradient. */
  fromColor?: string;
  /** End color of the gradient. */
  toColor?: string;
  /** Stroke width in px. */
  width?: number;
  /** Animate the flowing dash overlay. Default true. */
  animated?: boolean;
  /** Show soft origin/destination endpoint dots. Default true. */
  showEndpoints?: boolean;
}

/**
 * Trick used to enable `line-gradient`: each coordinate pair needs a
 * `line-progress` value (0 → 1) describing its position along the line.
 * We synthesize this here using arc-length approximation.
 */
function withProgress(coordinates: LngLat[]) {
  if (coordinates.length < 2) return [];
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < coordinates.length; i++) {
    const [x1, y1] = coordinates[i - 1];
    const [x2, y2] = coordinates[i];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx * dx + dy * dy);
    segs.push(d);
    total += d;
  }
  if (total === 0) return coordinates.map((c) => [...c, 0]);

  const out: [number, number, number][] = [[coordinates[0][0], coordinates[0][1], 0]];
  let acc = 0;
  for (let i = 1; i < coordinates.length; i++) {
    acc += segs[i - 1];
    out.push([coordinates[i][0], coordinates[i][1], acc / total]);
  }
  return out;
}

export function RouteLine({
  id,
  coordinates,
  fromColor = "#6366f1",
  toColor = "#ec4899",
  width = 5,
  animated = true,
  showEndpoints = true,
}: RouteLineProps) {
  const { map } = useMapContext();
  const rafRef = useRef<number | null>(null);

  const geojson = useMemo(() => {
    const pts = withProgress(coordinates);
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "LineString" as const,
            coordinates: pts.map(([lng, lat]) => [lng, lat]),
          },
          properties: {
            // Store the per-point progress so line-gradient can use it.
            progress: pts.map((p) => p[2]),
          },
        },
      ],
    };
  }, [coordinates]);

  // MapLibre computes line-progress from a per-vertex property named
  // `line-progress` only when the source has it; the canonical trick is
  // a `line-gradient` that interpolates over the implicit 0..1 range.
  // We register the gradient via an expression over `line-progress`.
  const baseLayer: LineLayerSpecification = useMemo(
    () => ({
      id: `${id}-base`,
      type: "line",
      source: `${id}-src`,
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-width": width,
        "line-gradient": [
          "interpolate",
          ["linear"],
          ["line-progress"],
          0,
          fromColor,
          1,
          toColor,
        ],
      },
    }),
    [id, width, fromColor, toColor],
  );

  const dashLayer: LineLayerSpecification = useMemo(
    () => ({
      id: `${id}-dash`,
      type: "line",
      source: `${id}-src`,
      layout: {
        "line-cap": "round",
      },
      paint: {
        "line-width": Math.max(2, width - 2),
        "line-color": "#ffffff",
        "line-opacity": 0.55,
        "line-dasharray": [0.5, 2.5],
      },
    }),
    [id, width],
  );

  // Animate the dash offset for the flowing effect.
  // Guard: wait until the dash layer actually exists in the map style
  // before trying to set its paint properties. A style-data event fires
  // when layers are added/removed.
  useEffect(() => {
    if (!animated || !map) return;
    let offset = 0;
    let cancelled = false;

    const tryAnimate = () => {
      if (cancelled) return;
      if (!map.getLayer(`${id}-dash`)) return; // layer not mounted yet
      offset = (offset - 0.08) % 3;
      const gap = 2.5 + Math.sin(offset * 4) * 0.6;
      map.setPaintProperty(`${id}-dash`, "line-dasharray", [0.5, gap]);
      rafRef.current = requestAnimationFrame(tryAnimate);
    };

    // Start the loop; it self-gates until the layer appears.
    rafRef.current = requestAnimationFrame(tryAnimate);

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animated, map, id]);

  const srcId = `${id}-src`;
  const endpoints = useMemo<[LngLat, LngLat] | null>(() => {
    if (!showEndpoints || coordinates.length < 2) return null;
    return [coordinates[0], coordinates[coordinates.length - 1]];
  }, [coordinates, showEndpoints]);

  return (
    <>
      <Source
        id={srcId}
        type="geojson"
        data={geojson}
        lineMetrics
      >
        <Layer {...baseLayer} />
        {animated && <Layer {...dashLayer} />}
      </Source>

      {endpoints && (
        <Source
          id={`${id}-endpoints`}
          type="geojson"
          data={{
            type: "FeatureCollection",
            features: endpoints.map((p, i) => ({
              type: "Feature",
              geometry: { type: "Point", coordinates: p },
              properties: { kind: i === 0 ? "start" : "end" },
            })),
          }}
        >
          <Layer
            id={`${id}-endpoints`}
            type="circle"
            source={`${id}-endpoints`}
            paint={{
              "circle-radius": 7,
              "circle-color": ["match", ["get", "kind"], "start", fromColor, toColor],
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
      )}
    </>
  );
}
