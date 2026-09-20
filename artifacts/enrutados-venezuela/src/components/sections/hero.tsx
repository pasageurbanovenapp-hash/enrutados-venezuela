import { ArrowDownRight, ArrowRight } from 'lucide-react';
import { PhoneMockup } from '@/components/phone-mockup';

export function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      {/* ── Escena de faros de bus ───────────────────────────────────────── */}
      {/* Overlay de oscuridad inicial que se disipa al encenderse los faros */}
      <div className="headlight-dark-veil" aria-hidden="true" />

      {/* Faro derecho — fuente de luz + cono */}
      <div className="headlight-rig headlight-rig--right" aria-hidden="true">
        <div className="headlight-source" />
        <div className="headlight-beam headlight-beam--right" />
        <div className="headlight-fog headlight-fog--right" />
        <div className="headlight-scatter" />
      </div>

      {/* Faro izquierdo — paralelo, ligeramente más débil */}
      <div className="headlight-rig headlight-rig--left" aria-hidden="true">
        <div className="headlight-source" />
        <div className="headlight-beam headlight-beam--left" />
        <div className="headlight-fog headlight-fog--left" />
      </div>
      {/* ─────────────────────────────────────────────────────────────────── */}

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
            {/* Imagen real del bus optimizada */}
            <picture>
              <source srcSet="/hero-bus.avif" type="image/avif" />
              <source srcSet="/hero-bus.webp" type="image/webp" />
              <img
                src="/hero-bus.webp"
                alt="Bus urbano venezolano en operación nocturna, vista lateral con iluminación urbana"
                className="bus-image"
                width="1600"
                height="900"
                loading="eager"
                fetchPriority="high"
              />
            </picture>
            {/* Overlay con efectos de iluminación urbana */}
            <div className="bus-scene-overlay" />
            
            {/* Etiquetas de información operacional */}
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
            
            {/* Floating panels con información operacional realista */}
            <div className="floating-panel panel-top route">
              <span>Ruta activa</span>
              <strong>05 · CENTRO</strong>
            </div>
            <div className="floating-panel panel-bottom status">
              <span>Validaciones</span>
              <strong>EN CURSO</strong>
            </div>
            
            {/* Línea de ruta y elementos de calle */}
            <div className="bus-route-beam" />
            <div className="bus-lane" />
            <div className="road-glow" />
          </div>
          
          {/* Teléfono como evidencia del producto - posición ajustada */}
          <div className="phone-evidence">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}
