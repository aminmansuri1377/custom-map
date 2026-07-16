"use client";

/**
 * MapProvider — the root context for the custom-map library.
 *
 * Holds:
 *  - the active provider bundle (geocoder + router)
 *  - the active basemap style id
 *  - the active UI language (for provider calls + RTL)
 *  - the live MapLibre instance once the map has mounted
 *
 * Wrap your map UI in <MapProvider> and read state via useMapContext().
 *
 * The `language` prop can be controlled externally (e.g. by an app-level
 * i18n toggle). When provided, it overrides the internal state. If omitted,
 * the provider manages language internally via `setLanguage`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Map as MapLibreMap } from "maplibre-gl";
import { DEFAULT_STYLE_ID, DEFAULT_STYLES } from "../constants/styles";
import { defaultProviders } from "../providers";
import type { ProviderBundle } from "../providers";

export type Language = "en" | "fa";

interface MapContextValue {
  providers: ProviderBundle;
  language: Language;
  setLanguage: (lang: Language) => void;
  /** Current style id, e.g. "positron". */
  styleId: string;
  setStyleId: (id: string) => void;
  /** Resolved MapStyle object. */
  activeStyle: (typeof DEFAULT_STYLES)[number];
  /** Register the live MapLibre instance (called by <MapCanvas> on mount). */
  registerMap: (map: MapLibreMap | null) => void;
  /** Latest registered map instance, or null before mount. */
  map: MapLibreMap | null;
}

const MapContext = createContext<MapContextValue | null>(null);

export interface MapProviderProps {
  children: ReactNode;
  /** Override the default free providers. */
  providers?: ProviderBundle;
  /** Initial style id (must exist in `styles`). */
  initialStyleId?: string;
  /**
   * Language — pass it as a controlled prop to keep it in sync with
   * an external i18n system. Falls back to `initialLanguage` for
   * internal state when omitted.
   */
  language?: Language;
  /** Fallback initial UI language (used only when `language` is omitted). */
  initialLanguage?: Language;
  /** Custom style list. Defaults to the OpenFreeMap set. */
  styles?: typeof DEFAULT_STYLES;
}

export function MapProvider({
  children,
  providers = defaultProviders,
  initialStyleId = DEFAULT_STYLE_ID,
  language: languageProp,
  initialLanguage = "en",
  styles = DEFAULT_STYLES,
}: MapProviderProps) {
  // Internal language state (used when `language` prop is not controlled).
  const [internalLang, setInternalLang] = useState<Language>(initialLanguage);

  // When the parent passes `language` as a controlled prop, use it.
  // Otherwise fall back to internal state.
  const language = languageProp ?? internalLang;
  const setLanguage = useCallback(
    (l: Language) => {
      // Only update internal state when uncontrolled.
      if (languageProp === undefined) {
        setInternalLang(l);
      }
    },
    [languageProp],
  );

  const [styleId, setStyleId] = useState<string>(initialStyleId);
  const mapRef = useRef<MapLibreMap | null>(null);

  // We keep `map` in state too so consumers re-render when it mounts.
  const [map, setMap] = useState<MapLibreMap | null>(null);

  const registerMap = useCallback((m: MapLibreMap | null) => {
    mapRef.current = m;
    setMap(m);
  }, []);

  const activeStyle = useMemo(
    () => styles.find((s) => s.id === styleId) ?? styles[0],
    [styles, styleId],
  );

  const value = useMemo<MapContextValue>(
    () => ({
      providers,
      language,
      setLanguage,
      styleId,
      setStyleId,
      activeStyle,
      registerMap,
      map,
    }),
    [providers, language, styleId, activeStyle, registerMap, map, setLanguage],
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}

export function useMapContext(): MapContextValue {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error("useMapContext must be used within a <MapProvider>");
  }
  return ctx;
}
