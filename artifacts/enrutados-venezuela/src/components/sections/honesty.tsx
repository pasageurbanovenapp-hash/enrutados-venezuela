import { Handshake, Route, TrendingUp, Wrench } from 'lucide-react';

interface HonestyPoint {
  icon: typeof Route;
  title: string;
  text: string;
}

const POINTS: HonestyPoint[] = [
  {
    icon: Route,
    title: 'Validación real',
    text: 'Probamos con operadores y rutas del mundo real.',
  },
  {
    icon: Handshake,
    title: 'Procesos respetados',
    text: 'La operación no se rompe para adaptarse a la tecnología.',
  },
  {
    icon: TrendingUp,
    title: 'Evolución gradual',
    text: 'Aprendemos en campo y ampliamos con criterio.',
  },
  {
    icon: Wrench,
    title: 'Solución útil',
    text: 'Diseñamos para resolver fricciones de verdad.',
  },
];

export function Honesty() {
  return (
    <section className="honesty section" aria-labelledby="honesty-title">
      <div className="wrap honesty-grid">
        <div className="reveal">
          <span className="eyebrow">Hablemos claro</span>
          <h2 className="section-title" id="honesty-title">
            Validamos en la práctica, no en teoría.
          </h2>
        </div>

        <div className="reveal">
          <p className="honesty-copy">
            Enrutados está en <strong>etapa piloto</strong>. Validamos el modelo
            con asociaciones reales y ajustamos la solución a la realidad del
            transporte.
          </p>
          <p className="honesty-copy" style={{ marginTop: 20 }}>
            No buscamos cambiar la operación de un día para otro; buscamos
            acompañar una evolución gradual, útil y sostenible para pasajeros,
            conductores y organizaciones.
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