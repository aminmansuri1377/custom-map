"use client";

/**
 * PulsingMarker — a DOM marker with a glowing, expanding ring.
 *
 * Built on MapLibre's <Marker> from @vis.gl/react-maplibre. The ring
 * animation is pure CSS (see markers.css), so it stays smooth even on
 * low-end devices and respects prefers-reduced-motion.
 *
 * Optional popup on click via the `title`/`description` props.
 */

import { useState } from "react";
import { Marker, Popup } from "@vis.gl/react-maplibre";
import type { LngLat } from "../../types";

export interface PulsingMarkerProps {
  position: LngLat;
  /** Accent color for the core + ring. Any CSS color. */
  color?: string;
  /** Title shown in the popup. */
  title?: string;
  /** Description shown under the title. */
  description?: string;
  /** Show popup on click. Default: true when title is set. */
  popup?: boolean;
  /** Offset the marker so the tip sits on the coordinate. */
  offset?: [number, number];
}

export function PulsingMarker({
  position,
  color = "#ef4444",
  title,
  description,
  popup,
  offset = [0, 0],
}: PulsingMarkerProps) {
  const [open, setOpen] = useState(false);
  const showPopup = popup ?? Boolean(title);

  return (
    <Marker longitude={position[0]} latitude={position[1]} offset={offset}>
      <div
        className="cm-pulse-marker"
        role="button"
        tabIndex={0}
        style={{ ["--cm-marker-color" as string]: color }}
        onClick={() => showPopup && setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (showPopup && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-label={title ?? "Map marker"}
      >
        <span className="cm-pulse-marker__ring" />
        <span className="cm-pulse-marker__core" />
      </div>
      {showPopup && open && (title || description) && (
        <Popup
          longitude={position[0]}
          latitude={position[1]}
          closeButton
          closeOnClick={false}
          onClose={() => setOpen(false)}
          offset={20}
        >
          <div className="cm-popup-title">{title}</div>
          {description && <div className="cm-popup-desc">{description}</div>}
        </Popup>
      )}
    </Marker>
  );
}
