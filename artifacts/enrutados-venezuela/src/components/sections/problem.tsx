export function Problem() {
  return (
    <section className="section problem-section" aria-labelledby="problem-title">
      <div className="wrap problem-grid">
        <div className="reveal">
          <span className="eyebrow">El desafío</span>
          <h2 className="section-title" id="problem-title">
            Hoy, el transporte público urbano opera sin trazabilidad.
          </h2>
        </div>
        <div className="problem-copy reveal">
          <p className="section-copy">
            Hay movimiento todos los días, pero poca información para entenderlo. Sin registros
            consistentes, la operación pierde transparencia, trazabilidad y capacidad de mejora.
          </p>
          <div className="problem-points">
            <span>No siempre hay métricas confiables</span>
            <span>La operación es difícil de auditar</span>
            <span>Las decisiones se toman con poca evidencia</span>
          </div>
        </div>
      </div>
    </section>
  );
}
