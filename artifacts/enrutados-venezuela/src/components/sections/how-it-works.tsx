import { useCallback, useEffect, useRef, useState } from 'react';

import { RouteLine } from '@/components/ui/route-line';

/* ═══════════════════════════════════════════════════════════════════════════
   HowItWorks — Los 3 pasos del sistema
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
    label: 'SUBE',
    title: 'El pasajero consulta ubicación de unidades',
    text: 'Desde su celular puede visualizar unidades en el mapa, abordar y pagar de forma rápida y segura.',
  },
  {
    index: '02',
    label: 'VALIDA',
    title: 'El conductor confirma',
    text: 'Una validación breve al abordar deja constancia del viaje sin detener el ritmo de la unidad.',
  },
  {
    index: '03',
    label: 'ENTIENDE',
    title: 'La asociación ve el movimiento',
    text: 'Los registros se convierten en una lectura práctica de rutas, turnos y operación para decidir con más contexto.',
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
              Tres momentos. Una experiencia más ordenada.
            </h2>
          </div>
          <p className="section-copy">
            La idea es sencilla: registrar lo que pasa en el viaje para que el
            siguiente paso sea más fácil, no más complicado.
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