/**
 * Demo app dictionary (English + Farsi).
 * Covers page copy. Library control strings live in src/lib/map/i18n.
 */

export type AppLanguage = "en" | "fa";

export const dictionary = {
  en: {
    badge: "Reusable · MapLibre · 100% free",
    title: "Custom Map",
    subtitle:
      "A beautiful, animated map toolkit for Next.js — search, routes, and live location. Free, no API key, no credit card.",
    searchHint: "Search any place to fly there",
    routeTitle: "Animated route demo",
    routeHint:
      "Pick a start and end on the map (click twice), then watch the route draw and a marker drive along it.",
    clearRoute: "Clear route",
    replay: "Replay animation",
    pickingStart: "Click the map to set the start point",
    pickingEnd: "Click the map to set the end point",
    distance: "Distance",
    duration: "Duration",
    routeError: "Route unavailable — the free demo server may be rate-limited. Try again.",
    featuresTitle: "What's inside",
    f1Title: "WebGL fast",
    f1Body: "MapLibre GL renders vector tiles on the GPU — far smoother than DOM-based Leaflet.",
    f2Title: "Animated routes",
    f2Body: "Gradient lines, flowing dashes, and a marker that drives along the road geometry.",
    f3Title: "Pulsing markers",
    f3Body: "Glowing ripple markers in any color. Respects prefers-reduced-motion.",
    f4Title: "Free by default",
    f4Body: "OpenFreeMap + Photon + Nominatim + OSRM. No key, no card. Swap any provider.",
    footer: "Built with MapLibre GL JS · Open data from OpenStreetMap contributors",
  },
  fa: {
    badge: "قابل‌استفاده مجدد · MapLibre · کاملاً رایگان",
    title: "نقشه سفارشی",
    subtitle:
      "ابزارکیت نقشه‌ی زیبا و متحرک برای Next.js — جستجو، مسیریابی و موقعیت زنده. رایگان، بدون کلید API و بدون کارت اعتباری.",
    searchHint: "هر مکانی را جستجو کنید تا به آن پرواز کنید",
    routeTitle: "دموی مسیر متحرک",
    routeHint:
      "یک مبدا و مقصد روی نقشه انتخاب کنید (دو بار کلیک کنید) تا مسیر رسم شود و نشانگر در طول جاده حرکت کند.",
    clearRoute: "پاک کردن مسیر",
    replay: "پخش مجدد انیمیشن",
    pickingStart: "روی نقشه کلیک کنید تا نقطه شروع تعیین شود",
    pickingEnd: "روی نقشه کلیک کنید تا نقطه پایان تعیین شود",
    distance: "مسافت",
    duration: "مدت",
    routeError: "مسیر یافت نشد — ممکن است سرور دمو محدود باشد. دوباره تلاش کنید.",
    featuresTitle: "چه چیزی داخلش هست",
    f1Title: "سریع با WebGL",
    f1Body: "MapLibre GL کاشی‌های برداری را روی GPU رندر می‌کند — خیلی نرم‌تر از Leaflet مبتنی بر DOM.",
    f2Title: "مسیرهای متحرک",
    f2Body: "خطوط گردانتی، خط‌چین‌های متحرک و نشانگری که در طول جاده حرکت می‌کند.",
    f3Title: "نشانگرهای تپنده",
    f3Body: "نشانگرهای موج‌دار درخشان با هر رنگ. به prefers-reduced-motion احترام می‌گذارد.",
    f4Title: "پیش‌فرض رایگان",
    f4Body: "OpenFreeMap + Photon + Nominatim + OSRM. بدون کلید، بدون کارت. هر پروایدر قابل تعویض.",
    footer: "ساخته‌شده با MapLibre GL JS · داده‌های باز از مشارکت‌کنندگان OpenStreetMap",
  },
} as const;

export type DictionaryKey = keyof (typeof dictionary)["en"];

export function tr(key: DictionaryKey, lang: AppLanguage): string {
  return dictionary[lang][key];
}
