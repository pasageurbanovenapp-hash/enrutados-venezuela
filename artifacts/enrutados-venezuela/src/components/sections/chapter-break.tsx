/* ═══════════════════════════════════════════════════════════════════════════
   ChapterBreak — Banda visual entre Problem y Audiences
   Imagen de la ciudad nocturna con overlay obsidiana. Una línea de texto.
   ═══════════════════════════════════════════════════════════════════════════ */

export function ChapterBreak() {
  return (
    <section className="chapter-break" aria-labelledby="chapter-break-text">
      <div className="chapter-break__media" aria-hidden="true">
        <img
          src="/images/city-night.webp"
          alt=""
          loading="lazy"
          decoding="async"
        />
        <div className="chapter-break__overlay" />
      </div>

      <div className="chapter-break__content wrap">
        <p className="chapter-break__text reveal" id="chapter-break-text">
          Millones de viajes. <em>Ninguno con registro.</em>
        </p>
      </div>
    </section>
  );
}