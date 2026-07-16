"use client";

/**
 * AnimatedRouteMarker — a moving vehicle marker that travels along a route.
 *
 * Pair with the `useAnimatedRoute` hook, which feeds the interpolated
 * position. Drop this marker inside <MapView> and pass the hook's
 * `position` to it.
 */

import { Marker } from "@vis.gl/react-maplibre";
import type { LngLat } from "../../types";

export interface AnimatedRouteMarkerProps {
  /** Live position [lng, lat] from useAnimatedRoute. */
  position: LngLat | null;
  /** Optional glyph/emoji rendered inside the dot. */
  glyph?: string;
}

export function AnimatedRouteMarker({
  position,
  glyph = "→",
}: AnimatedRouteMarkerProps) {
  if (!position) return null;
  return (
    <Marker longitude={position[0]} latitude={position[1]} rotationAlignment="map">
      <div className="cm-route-marker" aria-hidden="true">
        <div className="cm-route-marker__dot">{glyph}</div>
      </div>
    </Marker>
  );
}
