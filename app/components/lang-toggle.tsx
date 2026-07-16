"use client";

/** Small EN / فا pill toggle for the demo page. */
export function LangToggle({
  lang,
  onToggle,
}: {
  lang: "en" | "fa";
  onToggle: () => void;
}) {
  return (
    <div className="cm-lang-toggle" role="group" aria-label="Language">
      <button
        type="button"
        className={`cm-lang-toggle__btn ${lang === "en" ? "cm-lang-toggle__btn--active" : ""}`}
        onClick={() => lang !== "en" && onToggle()}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        type="button"
        className={`cm-lang-toggle__btn ${lang === "fa" ? "cm-lang-toggle__btn--active" : ""}`}
        onClick={() => lang !== "fa" && onToggle()}
        aria-pressed={lang === "fa"}
      >
        فا
      </button>
    </div>
  );
}
