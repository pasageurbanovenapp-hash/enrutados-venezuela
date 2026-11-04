import { useCallback, useEffect, useRef, useState } from 'react';

import { RouteLine } from '@/components/ui/route-line';

/* ═══════════════════════════════════════════════════════════════════════════
   Journey — "Cada viaje deja registro"
   Muestra la evidencia que queda después del viaje, no el procedimiento de uso.
   ═══════════════════════════════════════════════════════════════════════════ */

interface JourneyEvent {
  time: string;
  label: string;
  text: string;
}

const MOMENTS: JourneyEvent[] = [
  {
    time: '01',
    label: 'VIAJE DIGITAL',
    text: 'Unidad, ruta, hora y tarifa quedan asociados a una validación.',
  },
  {
    time: '02',
    label: 'EFECTIVO DECLARADO',
    text: 'Quien lo recibe y quien lo entrega dejan constancia. Las diferencias quedan visibles.',
  },
  {
    time: '03',
    label: 'CIERRE Y RECIBO',
    text: 'La asociación revisa. El chofer recibe su comprobante y puede confirmar o reclamar.',
  },
];

type MomentState = 'idle' | 'active' | 'done';

/* ── Hook: detecta cuándo un elemento entra en viewport (one-shot) ────── */
function useInViewOnce<T extends HTMLElement>(threshold = 0.5) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}

/* ── Componente raíz ───────────────────────────────────────────────────── */
export function Journey() {
  const [highest, setHighest] = useState(-1);

  const notify = useCallback((index: number) => {
    setHighest((prev) => Math.max(prev, index));
  }, []);

  const stateFor = (index: number): MomentState => {
    if (highest < 0) return 'idle';
    if (index < highest) return 'done';
    if (index === highest) return 'active';
    return 'idle';
  };

  return (
    <section
      className="journey section"
      id="journey"
      aria-labelledby="journey-title"
    >
      <div className="wrap">
        <div className="section-intro reveal">
          <div>
            <span className="eyebrow">Lo que queda</span>
            <h2 className="section-title" id="journey-title">
              Cada viaje deja registro.
            </h2>
          </div>
          <p className="section-copy">
            El sistema no mueve el efectivo. Deja constancia de los viajes
            digitales y de lo que cada persona declara y confirma.
          </p>
        </div>

        <div className="journey-stage reveal">
          <div className="journey-stage__line" aria-hidden="true">
            <RouteLine variant="brand" thickness="strong" />
          </div>

          <div className="journey-moments">
            {MOMENTS.map((moment, index) => (
              <JourneyMoment
                key={moment.time}
                time={moment.time}
                label={moment.label}
                text={moment.text}
                state={stateFor(index)}
                onEnter={() => notify(index)}
              />
            ))}
          </div>
        </div>

        <div className="journey-close reveal">
          <span className="journey-close__badge">
            <span className="journey-close__dot" aria-hidden="true" />
            Registrado
          </span>
          <p className="journey-close__text">Eso es trazabilidad documental.</p>
        </div>

        <div className="how-it-works__note reveal">
          <p>
            No es conciliación automática ni certificación física del dinero.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── Momento individual ────────────────────────────────────────────────── */
interface JourneyMomentProps {
  time: string;
  label: string;
  text: string;
  state: MomentState;
  onEnter: () => void;
}

function JourneyMoment({
  time,
  label,
  text,
  state,
  onEnter,
}: JourneyMomentProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.5);

  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  return (
    <div ref={ref} className="journey-moment" data-state={state}>
      <span className="journey-moment__dot" aria-hidden="true" />
      <div className="journey-moment__body">
        <span className="journey-moment__time">{time}</span>
        <span className="journey-moment__label">{label}</span>
        <p className="journey-moment__text">{text}</p>
      </div>
    </div>
  );
}