/**
 * Sensible defaults for the library.
 *
 * Default center is **Tehran**, since this project is built for an
 * Iranian audience. Override any of these via component props.
 */

import type { LngLat } from "../types";

/** Tehran city center (Milad Tower area). */
export const DEFAULT_CENTER: LngLat = [51.389, 35.7449];

/** City-level overview. */
export const DEFAULT_ZOOM = 11;

/** Show the whole globe by default for search-driven flows. */
export const MIN_ZOOM = 2;
export const MAX_ZOOM = 19;

/** Camera animation tuning. */
export const FLY_TO_OPTIONS = {
  duration: 1800,
  curve: 1.42,
  zoom: 14,
  essential: true,
} as const;

/** Debounce window for search-as-you-type (ms). */
export const SEARCH_DEBOUNCE_MS = 300;

/** Min characters before firing a search. */
export const SEARCH_MIN_CHARS = 3;
