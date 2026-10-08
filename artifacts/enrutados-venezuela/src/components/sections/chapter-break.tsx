/* ═══════════════════════════════════════════════════════════════════════════
   ChapterBreak — Banda visual entre Problem y Audiences
   Imagen de la ciudad nocturna con overlay obsidiana. Una línea de texto.
   ═══════════════════════════════════════════════════════════════════════════ */

export function ChapterBreak() {
  return (
    <section className="chapter-break" aria-label="Pausa visual">
      <div className="chapter-break__media" aria-hidden="true">
        {/* Banda decorativa: en movil no tiene sentido descargar 1672px.
            El WebP es el original sin recodificar; el AVIF pesa 22% menos. */}
        <picture>
          <source
            type="image/avif"
            srcSet={`${import.meta.env.BASE_URL}images/city-night-movil.avif 900w, ${import.meta.env.BASE_URL}images/city-night.avif 1672w`}
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet={`${import.meta.env.BASE_URL}images/city-night-movil.webp 900w, ${import.meta.env.BASE_URL}images/city-night.webp 1672w`}
            sizes="100vw"
          />
          <img
            src={`${import.meta.env.BASE_URL}images/city-night-movil.webp`}
            alt=""
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="chapter-break__overlay" />
      </div>

      <div className="chapter-break__content wrap" />
    </section>
  );
}