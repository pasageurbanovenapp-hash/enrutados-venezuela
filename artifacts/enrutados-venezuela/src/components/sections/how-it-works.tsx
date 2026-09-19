export function HowItWorks() {
  return (
    <section className="section flow-section" id="como-funciona" aria-labelledby="flow-title">
      <div className="wrap flow-grid">
        <div className="reveal">
          <span className="eyebrow">Sin vueltas</span>
          <h2 className="section-title" id="flow-title">
            Tres momentos. Una experiencia más ordenada.
          </h2>
          <p className="section-copy">
            La idea es sencilla: registrar lo que pasa en el viaje para que el siguiente paso sea
            más fácil, no más complicado.
          </p>
          <div className="flow-note">
            El piloto se adapta a la ruta y a la forma de trabajo de cada asociación. Primero
            escuchamos; después configuramos.
          </div>
        </div>
        <div className="steps reveal">
          <div className="route-track" aria-hidden="true">
            <div className="route-line" />
            <div className="route-stops">
              <div className="route-stop" data-step="1">
                <span className="stop-dot" />
                <span className="stop-label">SUBE</span>
              </div>
              <div className="route-stop" data-step="2">
                <span className="stop-dot" />
                <span className="stop-label">VALIDA</span>
              </div>
              <div className="route-stop" data-step="3">
                <span className="stop-dot" />
                <span className="stop-label">ENTIENDE</span>
              </div>
            </div>
          </div>
          <article className="step">
            <span className="step-number">01 / SUBE</span>
            <div>
              <h3>El pasajero consulta ubicación de unidades</h3>
              <p>
                Desde su celular puede visualizar unidades en el mapa, abordar y pagar de forma
                rápida y segura.
              </p>
            </div>
          </article>
          <article className="step">
            <span className="step-number">02 / VALIDA</span>
            <div>
              <h3>El conductor confirma</h3>
              <p>
                Una validación breve al abordar deja constancia del viaje sin detener el ritmo de
                la unidad.
              </p>
            </div>
          </article>
          <article className="step">
            <span className="step-number">03 / ENTIENDE</span>
            <div>
              <h3>La asociación ve el movimiento</h3>
              <p>
                Los registros se convierten en una lectura práctica de rutas, turnos y operación
                para decidir con más contexto.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
