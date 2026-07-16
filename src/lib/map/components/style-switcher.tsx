"use client";

/**
 * StyleSwitcher — pill-style basemap selector.
 *
 * Reads the styles list from <MapProvider> and writes the chosen id
 * back. Switching is instant because MapLibre reloads the style;
 * vector sources are cached aggressively so the flicker is minimal.
 */

import { DEFAULT_STYLES } from "../constants/styles";
import { useMapContext } from "./map-provider";

export interface StyleSwitcherProps {
  className?: string;
}

export function StyleSwitcher({ className }: StyleSwitcherProps) {
  const { styleId, setStyleId } = useMapContext();

  return (
    <div
      className={`cm-style-switcher ${className ?? ""}`}
      role="radiogroup"
      aria-label="Map style"
    >
      {DEFAULT_STYLES.map((s) => (
        <button
          key={s.id}
          role="radio"
          aria-checked={s.id === styleId}
          className={`cm-style-switcher__btn ${s.id === styleId ? "cm-style-switcher__btn--active" : ""}`}
          onClick={() => setStyleId(s.id)}
          type="button"
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
