import { Handshake, Route, TrendingUp, Wrench } from 'lucide-react';

interface HonestyPoint {
  icon: typeof Route;
  title: string;
  text: string;
}

const POINTS: HonestyPoint[] = [
  {
    icon: Route,
    title: 'Prototipo funcional',
    text: 'El flujo de cobro, reparto y cierre está implementado. Falta medirlo con carga real.',
  },
  {
    icon: Handshake,
    title: 'Pensado para la calle',
    text: 'Funciona sin señal: datos caros y conexión inestable son la regla, no la excepción.',
  },
  {
    icon: TrendingUp,
    title: 'Gradual',
    text: 'El efectivo no desaparece: sale del vehículo, no de la economía.',
  },
  {
    icon: Wrench,
    title: 'Lo que falta',
    text: 'Que choferes y asociación lo adopten. Eso lo mide el piloto, no el software.',
  },
];

export function Honesty() {
  return (
    <section className="honesty section" aria-labelledby="honesty-title">
      <div className="wrap honesty-grid">
        <div className="reveal">
          <span className="eyebrow">Hablemos claro</span>
          <h2 className="section-title" id="honesty-title">
            Lo que ya probamos y lo que falta.
          </h2>
        </div>

        <div className="reveal">
          <p className="honesty-copy">
            Enrutados está en <strong>etapa de prototipo</strong>. El sistema
            funciona y estamos buscando una asociación para probarlo en una
            ruta real.
          </p>
          <p className="honesty-copy" style={{ marginTop: 20 }}>
            No buscamos cambiar la operación de un día para otro; buscamos
            acompañar una evolución gradual, útil y sostenible para pasajeros,
            choferes y organizaciones.
          </p>

          <ul className="honesty-points">
            {POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <li className="honesty-point" key={point.title}>
                  <span className="honesty-point__icon">
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                  </span>
                  <div className="honesty-point__body">
                    <strong>{point.title}</strong>
                    <p>{point.text}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}