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
            Enrutados Venezuela propone digitalizar el transporte público: pagos sin efectivo,
            trazabilidad del viaje y mejor control operativo, todo desde el celular.
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
              <strong>1.248</strong>
              <span>viajes registrados</span>
            </div>
            <div>
              <strong>18</strong>
              <span>unidades activas</span>
            </div>
            <div>
              <strong>3</strong>
              <span>roles conectados</span>
            </div>
          </div>
        </div>

        <div className="hero-visual reveal">
          <div className="orb orb-one" aria-hidden="true" />
          <div className="orb orb-two" aria-hidden="true" />
          <PhoneMockup />
          <div className="floating-panel panel-top">
            <span>Viajeto</span>
            <strong>Ruta 05</strong>
          </div>
          <div className="floating-panel panel-bottom">
            <span>Validado</span>
            <strong>+12%</strong>
          </div>
        </div>
      </div>
    </section>
  );
}
