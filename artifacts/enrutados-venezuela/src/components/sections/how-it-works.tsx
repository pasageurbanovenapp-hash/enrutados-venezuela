import { useCallback, useEffect, useRef, useState } from 'react';

import { RouteLine } from '@/components/ui/route-line';

/* ═══════════════════════════════════════════════════════════════════════════
   HowItWorks — El uso del pasajero
   Hermana visual de Journey. Mismo lenguaje, distinto propósito.
   ═══════════════════════════════════════════════════════════════════════════ */

interface Step {
  index: string;
  label: string;
  title: string;
  text: string;
}

const STEPS: Step[] = [
  {
    index: '01',
    label: 'RECARGAR',
    title: 'El saldo queda disponible',
    text: 'El pasajero carga saldo por Pago Móvil a la asociación o en taquilla. El saldo queda disponible en su aplicación.',
  },
  {
    index: '02',
    label: 'PRESENTAR',
    title: 'Muestra su QR al chofer',
    text: 'Al abordar, presenta su código. No necesita transferirle dinero al chofer.',
  },
  {
    index: '03',
    label: 'VALIDAR',
    title: 'El viaje queda procesado',
    text: 'El chofer escanea desde su teléfono autorizado. El viaje se procesa y el pasajero continúa.',
  },
];

type StepState = 'idle' | 'active' | 'done';

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

export function HowItWorks() {
  const [highest, setHighest] = useState(-1);

  const notify = useCallback((index: number) => {
    setHighest((prev) => Math.max(prev, index));
  }, []);

  const stateFor = (index: number): StepState => {
    if (highest < 0) return 'idle';
    if (index < highest) return 'done';
    if (index === highest) return 'active';
    return 'idle';
  };

  return (
    <section
      className="how-it-works section"
      id="como-funciona"
      aria-labelledby="how-title"
    >
      <div className="wrap">
        <div className="section-intro reveal">
          <div>
            <span className="eyebrow">Sin vueltas</span>
            <h2 className="section-title" id="how-title">
              Una experiencia más ordenada.
            </h2>
          </div>
          <p className="section-copy">
            El pasajero no necesita aprender el sistema. Solo recargar,
            presentar y seguir.
          </p>
        </div>

        <div className="journey-stage reveal">
          <div className="journey-stage__line" aria-hidden="true">
            <RouteLine variant="brand" thickness="strong" />
          </div>

          <div className="journey-moments">
            {STEPS.map((step, index) => (
              <StepMoment
                key={step.index}
                index={step.index}
                label={step.label}
                title={step.title}
                text={step.text}
                state={stateFor(index)}
                onEnter={() => notify(index)}
              />
            ))}
          </div>
        </div>

        <div className="how-it-works__note reveal">
          <p>
            El piloto se adapta a la ruta y a la forma de trabajo de cada
            asociación. Primero escuchamos; después configuramos.
          </p>
        </div>
      </div>
    </section>
  );
}

interface StepMomentProps {
  index: string;
  label: string;
  title: string;
  text: string;
  state: StepState;
  onEnter: () => void;
}

function StepMoment({
  index,
  label,
  title,
  text,
  state,
  onEnter,
}: StepMomentProps) {
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.5);

  useEffect(() => {
    if (inView) onEnter();
  }, [inView, onEnter]);

  return (
    <div ref={ref} className="journey-moment" data-state={state}>
      <span className="journey-moment__dot" aria-hidden="true" />
      <div className="journey-moment__body">
        <span className="journey-moment__time">
          {index} <span aria-hidden="true">/</span> {label}
        </span>
        <h3 className="journey-moment__title">{title}</h3>
        <p className="journey-moment__text">{text}</p>
      </div>
    </div>
  );
}