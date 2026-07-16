"use client";

/**
 * App-level language context.
 *
 * Owns the EN/FA toggle for the demo page and keeps the document's
 * `<html lang>` and `dir` attributes in sync (RTL for Farsi). Also
 * mirrors the language into the library's <MapProvider> so provider
 * calls (geocoding language, accept-language) follow the UI.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { dictionary, type AppLanguage, type DictionaryKey } from "./dictionary";

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (l: AppLanguage) => void;
  toggle: () => void;
  /** Translate a page copy key. */
  t: (key: DictionaryKey) => string;
  /** "ltr" | "rtl" — convenience for inline styles. */
  dir: "ltr" | "rtl";
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLang = "en",
}: {
  children: ReactNode;
  initialLang?: AppLanguage;
}) {
  const [lang, setLangState] = useState<AppLanguage>(initialLang);

  // Keep <html> in sync for proper RTL + accessibility.
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  }, [lang]);

  const setLang = useCallback((l: AppLanguage) => setLangState(l), []);
  const toggle = useCallback(
    () => setLangState((prev) => (prev === "en" ? "fa" : "en")),
    [],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      toggle,
      t: (key) => dictionary[lang][key],
      dir: lang === "fa" ? "rtl" : "ltr",
    }),
    [lang, setLang, toggle],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within <LanguageProvider>");
  return ctx;
}
