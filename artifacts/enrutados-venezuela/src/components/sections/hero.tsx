import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { PhoneMockup } from '@/components/phone-mockup';

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
          <div className="bus-scene" aria-hidden="true">
            <div className="bus-frame">
              <div className="bus-silhouette">
                <span className="bus-window w1" />
                <span className="bus-window w2" />
                <span className="bus-window w3" />
                <span className="bus-window w4" />
                <span className="bus-wheel w1" />
                <span className="bus-wheel w2" />
              </div>
              <div className="bus-route-beam" />
              <div className="bus-lane" />
              <div className="road-glow" />
            </div>
            <div className="bus-tag t1">
              <span>Unidad</span>
              <strong>018</strong>
            </div>
            <div className="bus-tag t2">
              <span>Ruta</span>
              <strong>05</strong>
            </div>
            <div className="bus-tag t3">
              <span>Estado</span>
              <strong>EN CURSO</strong>
            </div>
          </div>
          <div className="phone-evidence">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
