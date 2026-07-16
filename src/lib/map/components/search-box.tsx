"use client";

/**
 * SearchBox — debounced autocomplete powered by the active geocoder.
 *
 * Selecting a result flies the camera to it and calls onSelect. The
 * focus point biases results toward the current map center for more
 * relevant hits.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { FLY_TO_OPTIONS } from "../constants/defaults";
import { t } from "../i18n/strings";
import { useGeocoder } from "../hooks/use-geocoder";
import { useMapContext } from "./map-provider";
import type { GeocodeResult } from "../types";

export interface SearchBoxProps {
  /** Called when a result is chosen (also flies the camera). */
  onSelect?: (result: GeocodeResult) => void;
  /** Placeholder override. */
  placeholder?: string;
  /** Autocomplete container className. */
  className?: string;
}

export function SearchBox({ onSelect, placeholder, className }: SearchBoxProps) {
  const { language, map } = useMapContext();
  const { query, setQuery, results, loading, error } = useGeocoder();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);

  const placeholderText = placeholder ?? t("searchPlaceholder", language);

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const choose = (r: GeocodeResult) => {
    onSelect?.(r);
    map?.flyTo({
      center: r.position,
      ...FLY_TO_OPTIONS,
    });
    setQuery(r.label);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !results.length) {
      if (e.key === "ArrowDown" && results.length) setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      choose(results[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const showDropdown = open && query.trim().length >= 2;
  const sub = useMemo(
    () => (r: GeocodeResult) => [r.city, r.country].filter(Boolean).join("، ") || r.label,
    [],
  );

  return (
    <div className={`cm-search ${className ?? ""}`} ref={boxRef}>
      <div className="cm-search__input-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="#71717a" strokeWidth="2" />
          <path d="m20 20-3.5-3.5" stroke="#71717a" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          className="cm-search__input"
          type="text"
          value={query}
          placeholder={placeholderText}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          aria-label={placeholderText}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="cm-search-listbox"
          role="combobox"
        />
        {loading && <span className="cm-search__spinner" aria-hidden="true" />}
      </div>

      {showDropdown && (
        <div className="cm-search__results" id="cm-search-listbox" role="listbox">
          {error && <div className="cm-search__error">{t("searchError", language)}</div>}
          {!error && !loading && results.length === 0 && (
            <div className="cm-search__empty">{t("noResults", language)}</div>
          )}
          {results.map((r, i) => (
            <div
              key={`${r.label}-${i}`}
              id={`cm-search-option-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`cm-search__result ${i === activeIndex ? "cm-search__result--active" : ""}`}
              onClick={() => choose(r)}
            >
              <div className="cm-search__result-label">{r.label.split(",")[0]}</div>
              <div className="cm-search__result-sub">{sub(r)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
