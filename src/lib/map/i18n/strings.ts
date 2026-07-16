/**
 * Library-internal UI strings (English + Farsi).
 *
 * These cover only the controls shipped by the library itself.
 * The demo app has its own, richer dictionary for page copy.
 */

import type { Language } from "../components/map-provider";

export const STRINGS = {
  searchPlaceholder: {
    en: "Search a place…",
    fa: "جستجوی مکان…",
  },
  noResults: {
    en: "No results",
    fa: "نتیجه‌ای یافت نشد",
  },
  searchError: {
    en: "Search failed. Try again.",
    fa: "جستجو ناموفق بود. دوباره تلاش کنید.",
  },
  locateMe: {
    en: "Locate me",
    fa: "موقعیت من",
  },
  locationDenied: {
    en: "Location permission denied",
    fa: "دسترسی به موقعیت رد شد",
  },
  locationUnavailable: {
    en: "Location unavailable",
    fa: "موقعیت یافت نشد",
  },
} as const;

export type StringKey = keyof typeof STRINGS;

export function t(key: StringKey, lang: Language): string {
  return STRINGS[key][lang];
}
