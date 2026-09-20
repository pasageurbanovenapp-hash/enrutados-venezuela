import { ArrowDownRight, ArrowRight } from 'lucide-react';

export function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      <div className="wrap hero-grid">
        <div className="hero-copy reveal">
          <span className="eyebrow">Movilidad hecha aquí</span>
          <h1 id="hero-title">
            Que moverse sea más <em>claro.</em>
          </h1>
          <p className="hero-lede">
            Enrutados Venezuela propone una capa digital para el transporte público: registro,
            validación y trazabilidad del viaje, sin cambiar la realidad de la calle.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#piloto" data-testid="button-hero-pilot">
              Quiero iniciar un piloto <ArrowDownRight size={17} />
            </a>
            <a className="button button-quiet" href="#como-funciona" data-testid="link-hero-explanation">
              Conoce cómo funciona <ArrowRight size={16} />
            </a>
          </div>
          <div className="hero-proof">
            <div>
              <strong>PASAJERO</strong>
              <span>consulta y viaja</span>
            </div>
            <div>
              <strong>CONDUCTOR</strong>
              <span>valida el viaje</span>
            </div>
            <div>
              <strong>ASOCIACIÓN</strong>
              <span>entiende la operación</span>
            </div>
          </div>
        </div>

        <div className="hero-visual reveal">
          <div className="bus-scene">
            <picture>
              <source srcSet="/frame-1.jpg" type="image/jpeg" />
              <img
                src="/frame-1.jpg"
                alt="Autobús urbano iluminado en una escena nocturna"
                className="bus-image"
                width="1600"
                height="900"
                loading="eager"
                fetchPriority="high"
              />
            </picture>
            <div className="bus-scene-overlay" />
          </div>
        </div>
      </div>
    </section>
  );
}
