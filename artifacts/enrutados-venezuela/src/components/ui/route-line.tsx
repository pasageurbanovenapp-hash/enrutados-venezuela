import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   Línea de Ruta — Componentes de sistema visual
   Paleta: cyan (origen) → orange (calle/acción)
   ═══════════════════════════════════════════════════════════════════════════ */

export type RouteVariant = 'brand' | 'data' | 'success';
export type RouteThickness = 'hairline' | 'base' | 'strong';
export type RouteOrientation = 'vertical' | 'horizontal';

/* ── Hook interno: detecta cuando un elemento entra en viewport ───────── */
function useInViewport<T extends HTMLElement>(
  threshold = 0.3,
): { ref: React.RefObject<T | null>; inView: boolean; hasBeenInView: boolean } {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            setHasBeenInView(true);
          }
        });
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView, hasBeenInView };
}

/* ── RouteLine ─────────────────────────────────────────────────────────── */
export interface RouteLineProps {
  variant?: RouteVariant;
  thickness?: RouteThickness;
  orientation?: RouteOrientation;
  /** Se dibuja cuando entra al viewport (default: true) */
  autoDraw?: boolean;
  /** Se atenúa cuando sale del viewport (default: true) */
  fadeOnExit?: boolean;
  className?: string;
}

export function RouteLine({
  variant = 'brand',
  thickness = 'strong',
  orientation = 'vertical',
  autoDraw = true,
  fadeOnExit = true,
  className,
}: RouteLineProps) {
  const { ref, inView, hasBeenInView } = useInViewport<HTMLDivElement>(0.15);

  const drawn = autoDraw ? hasBeenInView : true;
  const residual = fadeOnExit && hasBeenInView && !inView;

  return (
    <div ref={ref} className={cn('route-line-wrap', className)} aria-hidden="true">
      <div
        className="route-line"
        data-variant={variant}
        data-thickness={thickness}
        data-orientation={orientation}
        data-drawn={drawn}
        data-residual={residual}
      />
    </div>
  );
}

/* ── RouteNode ─────────────────────────────────────────────────────────── */
export type RouteNodeState = 'idle' | 'active' | 'done';

export interface RouteNodeProps {
  /** Número o identificador (ej. "01") */
  index?: string;
  /** Texto del nodo (ej. "SUBE") */
  label: string;
  state?: RouteNodeState;
  /** Muestra un pulso suave cuando está idle (default: false) */
  pulse?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function RouteNode({
  index,
  label,
  state = 'idle',
  pulse = false,
  className,
  style,
}: RouteNodeProps) {
  return (
    <div
      className={cn('route-node', className)}
      data-state={state}
      data-pulse={pulse}
      style={style}
    >
      <span className="route-node__dot" />
      <span className="route-node__label">
        {index && <span className="route-node__index">{index} / </span>}
        {label}
      </span>
    </div>
  );
}

/* ── RouteMoment ───────────────────────────────────────────────────────── */
export interface RouteMomentProps {
  /** Hora del momento (ej. "08:14:02") */
  time: string;
  /** Etiqueta del momento (ej. "UNIDAD 018 · RUTA 05") */
  label: string;
  /** Contenido del momento */
  children: ReactNode;
  className?: string;
}

export function RouteMoment({
  time,
  label,
  children,
  className,
}: RouteMomentProps) {
  return (
    <div className={cn('route-moment', className)}>
      <div className="route-moment__time">{time}</div>
      <div className="route-moment__body">
        <div className="route-moment__label">{label}</div>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}