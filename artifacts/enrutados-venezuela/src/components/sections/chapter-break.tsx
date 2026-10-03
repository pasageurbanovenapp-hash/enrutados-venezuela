/* ═══════════════════════════════════════════════════════════════════════════
   ChapterBreak — Banda visual entre Problem y Audiences
   Imagen de la ciudad nocturna con overlay obsidiana. Una línea de texto.
   ═══════════════════════════════════════════════════════════════════════════ */

export function ChapterBreak() {
  return (
    <section className="chapter-break" aria-label="Pausa visual">
      <div className="chapter-break__media" aria-hidden="true">
        <img
          src={`${import.meta.env.BASE_URL}images/city-night.webp`}
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="chapter-break__overlay" />
      </div>

      <div className="chapter-break__content wrap" />
    </section>
  );
}