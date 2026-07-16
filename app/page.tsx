"use client";

/**
 * Custom Map — rich showcase page.
 *
 * Demonstrates the full library:
 *  - MapLibre map with smooth camera + multiple basemap styles
 *  - Debounced search (Photon) → flyTo
 *  - User geolocation
 *  - Click-to-route (two clicks → OSRM → animated gradient line + moving marker)
 *  - Pulsing POI markers
 *  - Bilingual EN / فا with RTL flip
 *
 * Architecture note: every <Marker>/<Source>/<Layer>/<SearchBox> must be a
 * descendant of <Map> (provided by <MapView>) so they share MapLibre context.
 * Floating controls are children of <MapView> too — they're absolutely
 * positioned, and maplibre's own layers render to a separate canvas so they
 * don't disturb the floating DOM.
 */

import { useCallback, useMemo, useState } from "react";
import {
  MapProvider,
  MapView,
  PulsingMarker,
  RouteLine,
  SearchBox,
  StyleSwitcher,
  LocationButton,
  AnimatedRouteMarker,
  useAnimatedRoute,
  useRoute,
  type LngLat,
} from "@/lib/map";
import { LanguageProvider, useLanguage } from "./i18n/language-context";
import type { DictionaryKey } from "./i18n/dictionary";
import { LangToggle } from "./components/lang-toggle";

type TranslateFn = (key: DictionaryKey) => string;

// POIs around Tehran to show off pulsing markers.
const TEHRAN_POIS: {
  id: string;
  position: LngLat;
  titleEn: string;
  titleFa: string;
  color: string;
}[] = [
  {
    id: "azadi",
    position: [51.3145, 35.6997],
    titleEn: "Azadi Tower",
    titleFa: "برج آزادی",
    color: "#f59e0b",
  },
  {
    id: "milad",
    position: [51.3754, 35.7448],
    titleEn: "Milad Tower",
    titleFa: "برج میلاد",
    color: "#ec4899",
  },
  {
    id: "golestan",
    position: [51.3494, 35.6797],
    titleEn: "Golestan Palace",
    titleFa: "کاخ گلستان",
    color: "#10b981",
  },
];

export default function Home() {
  return (
    <LanguageProvider>
      <Page />
    </LanguageProvider>
  );
}

function Page() {
  const { lang, toggle: toggleLang, t } = useLanguage();

  return (
    <main className="flex flex-1 flex-col">
      <Header lang={lang} onToggleLang={toggleLang} t={t} />
      <MapSection lang={lang} t={t} />
      <Features t={t} />
      <Footer t={t} />
    </main>
  );
}

/* ---------------------------------- Header --------------------------------- */

function Header({
  lang,
  onToggleLang,
  t,
}: {
  lang: "en" | "fa";
  onToggleLang: () => void;
  t: TranslateFn;
}) {
  return (
    <header className="px-6 pt-10 pb-6 sm:px-10 sm:pt-14">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t("badge")}
          </span>
          <LangToggle lang={lang} onToggle={onToggleLang} />
        </div>

        <h1 className="mt-5 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          {t("title")}
          <span className="text-fuchsia-400">.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-400">
          {t("subtitle")}
        </p>
      </div>
    </header>
  );
}

/* --------------------------------- Map section ------------------------------ */

function MapSection({ lang, t }: { lang: "en" | "fa"; t: TranslateFn }) {
  return (
    <section className="px-6 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="relative h-[560px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/40 sm:h-[640px]">
          <MapProvider language={lang}>
            <MapDemo t={t} lang={lang} />
          </MapProvider>
        </div>
        <p className="mt-3 text-center text-xs text-zinc-500">
          {t("searchHint")}
        </p>
      </div>
    </section>
  );
}

/**
 * MapDemo owns the click-to-route state and renders <MapView> with all
 * children (controls + maplibre layers/markers) inside it.
 */
function MapDemo({ t, lang }: { t: TranslateFn; lang: "en" | "fa" }) {
  const [start, setStart] = useState<LngLat | null>(null);
  const [end, setEnd] = useState<LngLat | null>(null);

  // First click = start, second = end, third = reset.
  const handleMapClick = useCallback(
    (p: LngLat) => {
      if (!start) {
        setStart(p);
        setEnd(null);
      } else if (!end) {
        setEnd(p);
      } else {
        setStart(p);
        setEnd(null);
      }
    },
    [start, end],
  );

  const clearRoute = useCallback(() => {
    setStart(null);
    setEnd(null);
  }, []);

  return (
    <>
      <MapView className="cm-map-container" onMapClick={handleMapClick}>
        <MapChildren
          start={start}
          end={end}
          lang={lang}
          t={t}
          onClearRoute={clearRoute}
        />
      </MapView>
    </>
  );
}

/**
 * All markers, route lines, search box, and floating controls.
 * Must be rendered as a child of <MapView> (= inside <Map>).
 */
function MapChildren({
  start,
  end,
  lang,
  t,
  onClearRoute,
}: {
  start: LngLat | null;
  end: LngLat | null;
  lang: "en" | "fa";
  t: TranslateFn;
  onClearRoute: () => void;
}) {
  const points = useMemo<LngLat[] | null>(
    () => (start && end ? [start, end] : null),
    [start, end],
  );
  const { route, loading, error } = useRoute(points);
  const animation = useAnimatedRoute(route?.coordinates ?? null, {
    durationMs: 7000,
    loop: false,
  });

  return (
    <>
      <SearchBox />
      <StyleSwitcher />
      <LocationButton />

      {/* Pulsing POIs */}
      {TEHRAN_POIS.map((poi) => (
        <PulsingMarker
          key={poi.id}
          position={poi.position}
          color={poi.color}
          title={lang === "fa" ? poi.titleFa : poi.titleEn}
        />
      ))}

      {/* Click-to-route markers */}
      {start && (
        <PulsingMarker
          position={start}
          color="#22c55e"
          title={t("pickingEnd")}
        />
      )}
      {end && <PulsingMarker position={end} color="#ef4444" title="End" />}

      {/* The animated gradient route + moving vehicle */}
      {route && route.coordinates.length > 1 && (
        <>
          <RouteLine id="demo-route" coordinates={route.coordinates} />
          <AnimatedRouteMarker position={animation.position} glyph="🚗" />
        </>
      )}

      {/* Floating status / route info panel */}
      <RoutePanel
        loading={loading}
        error={error}
        hasRoute={Boolean(route)}
        distance={route?.distance}
        duration={route?.duration}
        start={start}
        end={end}
        t={t}
        onClear={onClearRoute}
      />
    </>
  );
}

function RoutePanel({
  loading,
  error,
  hasRoute,
  distance,
  duration,
  start,
  end,
  t,
  onClear,
}: {
  loading: boolean;
  error: string | null;
  hasRoute: boolean;
  distance?: number;
  duration?: number;
  start: LngLat | null;
  end: LngLat | null;
  t: TranslateFn;
  onClear: () => void;
}) {
  // Hint banner shown when the user hasn't picked both points yet.
  const showHint = !loading && !error && !hasRoute && start && !end;

  return (
    <>
      {loading && (
        <div
          className="cm-floating-pill"
          style={{ top: 80, borderColor: "rgba(99,102,241,0.3)" }}
        >
          <span className="cm-search__spinner" /> Routing…
        </div>
      )}
      {error && (
        <div
          className="cm-floating-pill"
          style={{
            top: 80,
            background: "rgba(254,226,226,0.95)",
            color: "#b91c1c",
          }}
        >
          {t("routeError")}
        </div>
      )}
      {showHint && (
        <div className="cm-floating-pill" style={{ top: 80 }}>
          {t("pickingEnd")}
        </div>
      )}

      {hasRoute && distance != null && duration != null && (
        <div className="cm-route-info">
          <div className="cm-route-info__row">
            <span className="cm-route-info__label">{t("distance")}</span>
            <span className="cm-route-info__value">
              {distance >= 1000
                ? `${(distance / 1000).toFixed(1)} km`
                : `${Math.round(distance)} m`}
            </span>
          </div>
          <div className="cm-route-info__row">
            <span className="cm-route-info__label">{t("duration")}</span>
            <span className="cm-route-info__value">
              {duration >= 3600
                ? `${Math.floor(duration / 3600)}h ${Math.round((duration % 3600) / 60)}m`
                : `${Math.round(duration / 60)} min`}
            </span>
          </div>
          <button className="cm-route-info__clear" onClick={onClear}>
            {t("clearRoute")}
          </button>
        </div>
      )}
    </>
  );
}

/* ---------------------------------- Features ------------------------------- */

function Features({ t }: { t: TranslateFn }) {
  const items = [
    { emoji: "⚡️", title: t("f1Title"), body: t("f1Body") },
    { emoji: "🛣️", title: t("f2Title"), body: t("f2Body") },
    { emoji: "📍", title: t("f3Title"), body: t("f3Body") },
    { emoji: "🎁", title: t("f4Title"), body: t("f4Body") },
  ];
  return (
    <section className="px-6 py-16 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-2xl font-bold text-white">{t("featuresTitle")}</h2>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:bg-white/[0.06]"
            >
              <div className="text-2xl">{f.emoji}</div>
              <h3 className="mt-3 font-semibold text-white">{f.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------- Footer -------------------------------- */

function Footer({ t }: { t: TranslateFn }) {
  return (
    <footer className="px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl border-t border-white/10 pt-6 text-center text-xs text-zinc-500">
        {t("footer")}
      </div>
    </footer>
  );
}
