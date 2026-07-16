"use client";

/**
 * LocationButton — geolocate the user and fly the camera to them.
 *
 * Uses the browser Geolocation API directly (no MapLibre GeolocateControl
 * dependency), so behavior is fully under our control. Renders a pulsing
 * marker at the user's location once acquired.
 */

import { useState } from "react";
import { Marker } from "@vis.gl/react-maplibre";
import { FLY_TO_OPTIONS } from "../constants/defaults";
import { t } from "../i18n/strings";
import { useMapContext } from "./map-provider";
import type { LngLat } from "../types";

type Status = "idle" | "locating" | "success" | "error";

export interface LocationButtonProps {
  /** Called with the acquired position. */
  onLocate?: (position: LngLat) => void;
  className?: string;
}

export function LocationButton({ onLocate, className }: LocationButtonProps) {
  const { language, map } = useMapContext();
  const [status, setStatus] = useState<Status>("idle");
  const [position, setPosition] = useState<LngLat | null>(null);

  const locate = () => {
    if (status === "locating") return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: LngLat = [pos.coords.longitude, pos.coords.latitude];
        setPosition(p);
        setStatus("success");
        onLocate?.(p);
        map?.flyTo({ center: p, ...FLY_TO_OPTIONS });
      },
      (err) => {
        // Permission denied (code 1) vs unavailable (code 2) vs timeout (3).
        setStatus("error");
        console.warn("Geolocation error:", err.message);
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
    );
  };

  return (
    <>
      <button
        type="button"
        className={[
          "cm-location-btn",
          status === "locating" && "cm-location-btn--locating",
          status === "error" && "cm-location-btn--error",
          className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        onClick={locate}
        aria-label={t("locateMe", language)}
        title={t("locateMe", language)}
      >
        {status === "locating" ? (
          <span className="cm-search__spinner" aria-hidden="true" />
        ) : status === "error" ? (
          // Crosshair with alert
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2v3M12 19v3M2 12h3M19 12h3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="3" fill="currentColor" />
            <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2v3M12 19v3M2 12h3M19 12h3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {position && status === "success" && (
        <Marker longitude={position[0]} latitude={position[1]}>
          <div
            className="cm-pulse-marker"
            style={{ ["--cm-marker-color" as string]: "#3b82f6" }}
            aria-label={t("locateMe", language)}
          >
            <span className="cm-pulse-marker__ring" />
            <span className="cm-pulse-marker__core" />
          </div>
        </Marker>
      )}
    </>
  );
}
