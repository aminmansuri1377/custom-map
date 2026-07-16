/**
 * Basemap styles.
 *
 * Default provider: **OpenFreeMap** (https://openfreemap.org) —
 * free, no API key, no credit card, no usage limits, no tracking.
 * Served from a Bunny CDN mirror.
 *
 * To self-host for full independence, download a Protomaps `.pmtiles`
 * extract and register it via the `pmtiles` protocol — see README.
 */

import type { MapStyle } from "../types";

export const OPENFREEMAP_STYLES = {
  positron: "https://tiles.openfreemap.org/styles/positron",
  liberty: "https://tiles.openfreemap.org/styles/liberty",
  bright: "https://tiles.openfreemap.org/styles/bright",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;

/** Curated set offered by the style switcher. */
export const DEFAULT_STYLES: MapStyle[] = [
  { id: "positron", label: "Light", style: OPENFREEMAP_STYLES.positron },
  { id: "dark", label: "Dark", style: OPENFREEMAP_STYLES.dark, dark: true },
  { id: "liberty", label: "Liberty", style: OPENFREEMAP_STYLES.liberty },
  { id: "bright", label: "Bright", style: OPENFREEMAP_STYLES.bright },
];

export const DEFAULT_STYLE_ID = "positron";
