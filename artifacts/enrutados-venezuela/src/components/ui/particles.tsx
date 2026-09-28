import { useEffect, useRef } from 'react';

import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   Particles — Canvas de partículas conectadas
   Paleta alineada: cyan (origen) → orange (calle/acción)
   Origen: Enruta2 (refactorizado para V5)
   ═══════════════════════════════════════════════════════════════════════════ */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  hue: string;
}

export interface ParticlesProps {
  className?: string;
  /** Número de partículas (default: 64) */
  count?: number;
  /** Distancia máxima de conexión en px (default: 130) */
  linkDistance?: number;
}

const CYAN_RGB = '34, 211, 238';
const ORANGE_RGB = '245, 158, 11';

export function Particles({
  className,
  count = 64,
  linkDistance = 130,
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const pts: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00034,
      vy: (Math.random() - 0.5) * 0.00034,
      r: Math.random() * 1.5 + 0.6,
      hue: Math.random() > 0.75 ? ORANGE_RGB : CYAN_RGB,
    }));

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const tick = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
      }

      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const a = pts[i];
          const b = pts[j];
          const dx = (a.x - b.x) * w;
          const dy = (a.y - b.y) * h;
          const d2 = dx * dx + dy * dy;
          if (d2 < linkDistance * linkDistance) {
            const alpha = (1 - Math.sqrt(d2) / linkDistance) * 0.13;
            ctx.strokeStyle = `rgba(${CYAN_RGB}, ${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x * w, a.y * h);
            ctx.lineTo(b.x * w, b.y * h);
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        ctx.fillStyle = `rgba(${p.hue}, 0.55)`;
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [count, linkDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(className)}
      aria-hidden="true"
    />
  );
}