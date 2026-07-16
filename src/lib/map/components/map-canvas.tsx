"use client";

/**
 * MapCanvas — the actual MapLibre map, via @vis.gl/react-maplibre.
 *
 * This is the only component that imports maplibre-gl directly. It must
 * only ever render behind the `ssr:false` dynamic boundary set up by
 * <MapView>. Never import this from a Server Component.
 *
 * It registers the live map instance into <MapProvider> so child
 * components (markers, routes, controls) can talk to it imperatively.
 */

import { useMemo } from "react";
import { Map, ScaleControl, NavigationControl, FullscreenControl, AttributionControl } from "@vis.gl/react-maplibre";
import type { MapProps } from "@vis.gl/react-maplibre";
import { DEFAULT_CENTER, DEFAULT_ZOOM, MAX_ZOOM, MIN_ZOOM } from "../constants/defaults";
import type { LngLat } from "../types";
import { useMapContext } from "./map-provider";

const MAPLIBRE_HREF = "https://maplibre.org/";
const OPENSTREETMAP_HREF = "https://www.openstreetmap.org/copyright";

export interface MapCanvasProps {
  /** Children render on top of the map (markers, popups, controls). */
  children?: React.ReactNode;
  /** Initial center [lng, lat]. Defaults to Tehran. */
  initialCenter?: LngLat;
  /** Initial zoom. */
  initialZoom?: number;
  /** Show zoom/compass buttons. Default true. */
  showNavigation?: boolean;
  /** Show fullscreen button. Default true. */
  showFullscreen?: boolean;
  /** Show scale bar. Default true. */
  showScale?: boolean;
  /** Extra props forwarded to the underlying <Map>. */
  mapOptions?: Partial<MapProps>;
  /** Called once the map has finished loading. */
  onLoad?: () => void;
  /** Called when the user clicks the map surface. */
  onMapClick?: (lngLat: LngLat) => void;
  className?: string;
}

export function MapCanvas({
  children,
  initialCenter = DEFAULT_CENTER,
  initialZoom = DEFAULT_ZOOM,
  showNavigation = true,
  showFullscreen = true,
  showScale = true,
  mapOptions,
  onLoad,
  onMapClick,
  className,
}: MapCanvasProps) {
  const { activeStyle, registerMap } = useMapContext();

  const viewState = useMemo(
    () => ({
      longitude: initialCenter[0],
      latitude: initialCenter[1],
      zoom: initialZoom,
    }),
    // We only want this as the *initial* view; don't reset on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div className={`cm-map-container ${className ?? ""}`}>
      <Map
        initialViewState={viewState}
        mapStyle={activeStyle.style}
        minZoom={MIN_ZOOM}
        maxZoom={MAX_ZOOM}
        style={{ width: "100%", height: "100%" }}
        attributionControl={false}
        onLoad={(e) => {
          registerMap(e.target);
          onLoad?.();
        }}
        onMoveEnd={(e) => registerMap(e.target)}
        onClick={(e) => {
          const { lng, lat } = e.lngLat;
          onMapClick?.([lng, lat]);
        }}
        {...mapOptions}
      >
        <AttributionControl
          compact
          customAttribution={[
            `<a href="${MAPLIBRE_HREF}" target="_blank" rel="noopener noreferrer">MapLibre</a>`,
            `<a href="${OPENSTREETMAP_HREF}" target="_blank" rel="noopener noreferrer">© OpenStreetMap</a>`,
          ]}
        />
        {showNavigation && <NavigationControl position="bottom-right" showCompass showZoom />}
        {showFullscreen && <FullscreenControl position="top-right" />}
        {showScale && (
          <ScaleControl
            position="bottom-left"
            unit="metric"
            maxWidth={160}
          />
        )}
        {children}
      </Map>
    </div>
  );
}
