import { useEffect, useState } from 'react';
import { ArrowDownRight, ArrowRight } from 'lucide-react';

export function Hero() {
  const [sceneState, setSceneState] = useState<'initial' | 'entering' | 'ready' | 'transitioning'>('entering');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sceneState === 'entering') setSceneState('ready');
    }, 3000);
    return () => clearTimeout(timer);
  }, [sceneState]);

  const handlePilotClick = () => {
    setSceneState('transitioning');
  };

  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title" data-hero-state={sceneState}>
      <div className="hero-visual reveal" aria-hidden="true">
        <div className="bus-scene">
          <picture>
            {/* AVIF y WebP en dos tamanos. Medido: frente a los 1809 kB del PNG
                original, el AVIF de escritorio pesa 83 kB y el de movil 30 kB,
                con una diferencia media por debajo de 2 niveles sobre 255. */}
            <source
              type="image/avif"
              srcSet={`${import.meta.env.BASE_URL}hero-movil.avif 900w, ${import.meta.env.BASE_URL}hero.avif 1672w`}
              sizes="100vw"
            />
            <source
              type="image/webp"
              srcSet={`${import.meta.env.BASE_URL}hero-movil.webp 900w, ${import.meta.env.BASE_URL}hero.webp 1672w`}
              sizes="100vw"
            />
            {/* El respaldo apunta a la variante pequena a proposito.
                WebKit descarga el src del img aunque el navegador elija una
                fuente del picture: medido, pedia hero.webp (138 kB) ademas de
                hero-movil.webp (48 kB). Chromium no lo hace. Apuntando el
                respaldo al archivo pequeno, la redundancia baja a 48 kB.
                En los navegadores que resuelven el picture bien, el respaldo
                no se descarga nunca. */}
            <img
              src={`${import.meta.env.BASE_URL}hero-movil.webp`}
              alt="Autobús urbano iluminado en una escena nocturna"
              className="bus-image"
              width="1672"
              height="941"
              loading="eager"
              fetchPriority="high"
            />
          </picture>
          <div className="bus-scene-overlay" />
        </div>
      </div>
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
            <a className="button button-primary" href="#piloto" data-testid="button-hero-pilot" onClick={handlePilotClick}>
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
      </div>
      <div className="hero-transition-overlay" aria-hidden="true" />
    </section>
  );
}
