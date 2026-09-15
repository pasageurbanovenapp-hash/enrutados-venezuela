export function Honesty() {
  return (
    <section className="honesty" aria-labelledby="honesty-title">
      <div className="wrap honesty-grid">
        <div className="reveal">
          <span className="eyebrow">Hablemos claro</span>
          <h2 className="section-title" id="honesty-title">
            Validamos en la práctica, no en teoría.
          </h2>
        </div>
        <div className="reveal">
          <p className="honesty-copy">
            Enrutados está en <strong>etapa piloto</strong>. Validamos el modelo con asociaciones
            reales y ajustamos la solución a la realidad del transporte.
          </p>
          <p className="honesty-copy" style={{ marginTop: 20 }}>
            No buscamos cambiar la operación de un día para otro; buscamos acompañar una
            evolución gradual, útil y sostenible para pasajeros, conductores y organizaciones.
          </p>
          <div className="honesty-points">
            <div className="honesty-point">
              <strong>Validación real</strong>Probamos con operadores y rutas del mundo real.
            </div>
            <div className="honesty-point">
              <strong>Procesos respetados</strong>La operación no se rompe para adaptarse a la
              tecnología.
            </div>
            <div className="honesty-point">
              <strong>Evolución gradual</strong>Aprendemos en campo y ampliamos con criterio.
            </div>
            <div className="honesty-point">
              <strong>Solución útil</strong>Diseñamos para resolver fricciones de verdad.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
