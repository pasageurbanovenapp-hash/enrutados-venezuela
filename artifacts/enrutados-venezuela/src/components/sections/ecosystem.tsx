import { useEffect, useRef, useState } from 'react';
import {
  BadgeCheck,
  BatteryFull,
  Building2,
  Clock,
  QrCode,
  RefreshCw,
  ScanLine,
  Signal,
  Split,
  TicketCheck,
  TrendingUp,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';

import { ecosystemActors, type EcosystemRole } from '@/data/ecosystem-actors';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════════════════════
   Ecosystem — Selector interactivo de las 3 apps
   Reemplaza Audiences. Paleta alineada al DESIGN.md.
   ═══════════════════════════════════════════════════════════════════════════ */

const ROTATE_INTERVAL_MS = 6000;

export function Ecosystem() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const userInteracted = useRef(false);

  const activeActor = ecosystemActors[activeIndex];

  // Auto-rotate hasta que el usuario interactúa
  useEffect(() => {
    if (userInteracted.current || paused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % ecosystemActors.length);
    }, ROTATE_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [paused]);

  const select = (index: number) => {
    userInteracted.current = true;
    setActiveIndex(index);
  };

  return (
    <section
      className="ecosystem section"
      id="ecosistema"
      aria-labelledby="ecosystem-title"
    >
      <div className="wrap">
        <div className="section-intro ecosystem-intro reveal">
          <div>
            <span className="eyebrow">El ecosistema</span>
            <h2 className="section-title" id="ecosystem-title">
              Un solo sistema. <span className="text-cyan-300">Tres perspectivas.</span>
            </h2>
            <p className="section-copy">
              Un sistema con tres perspectivas del mismo viaje con registros y métricas de cada detalle de extremo a extremo.
            </p>
          </div>
        </div>

        <div className="ecosystem__grid">
          {/* Columna izquierda: tabs + detalle */}
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="ecosystem__tabs" role="tablist" aria-label="Apps del ecosistema">
              {ecosystemActors.map((actor, index) => (
                <button
                  key={actor.role}
                  type="button"
                  role="tab"
                  aria-selected={index === activeIndex}
                  aria-controls={`ecosystem-panel-${actor.role}`}
                  id={`ecosystem-tab-${actor.role}`}
                  data-active={index === activeIndex}
                  data-role={actor.role}
                  className="ecosystem-tab reveal"
                  onClick={() => select(index)}
                >
                  <span className="ecosystem-tab__icon" aria-hidden="true">
                    <img src={actor.iconSrc} alt="" loading="lazy" />
                  </span>
                  <span className="ecosystem-tab__body">
                    <span className="ecosystem-tab__name">{actor.name}</span>
                    <span className="ecosystem-tab__tagline">
                      {actor.tagline}
                    </span>
                  </span>
                  <span className="ecosystem-tab__badge">
                    APP {String(index + 1).padStart(2, '0')}
                  </span>
                </button>
              ))}
            </div>

            <div
              key={activeActor.role}
              id={`ecosystem-panel-${activeActor.role}`}
              role="tabpanel"
              aria-labelledby={`ecosystem-tab-${activeActor.role}`}
              data-role={activeActor.role}
              className="ecosystem-detail"
            >
              <p className="ecosystem-detail__desc">{activeActor.context}</p>
            </div>
          </div>

          {/* Columna derecha: phone mockup */}
          <div className="ecosystem-phone-stage">
            <PhoneMockup role={activeActor.role} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Phone mockup ──────────────────────────────────────────────────────── */

function PhoneMockup({ role }: { role: EcosystemRole }) {
  const innerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = innerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${(-py * 8).toFixed(2)}deg) rotateY(${(px * 12).toFixed(2)}deg)`;
  };

  const handlePointerLeave = () => {
    const el = innerRef.current;
    if (!el) return;
    el.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div
      className="ecosystem-phone"
      data-role={role}
      ref={innerRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <div className="ecosystem-phone__glow" aria-hidden="true" />

      <div className="ecosystem-phone__badge ecosystem-phone__badge--left">
        <BadgeCheck size={15} className="text-cyan-300" aria-hidden="true" />
        <span>Validación en segundos</span>
      </div>

      <div className="ecosystem-phone__badge ecosystem-phone__badge--right">
        <RefreshCw size={15} className="text-emerald-300" aria-hidden="true" />
        <span>Offline-first</span>
      </div>

      <div className="ecosystem-phone__frame">
        <div className="ecosystem-phone__screen">
          <div className="ecosystem-phone__notch" aria-hidden="true" />
          <PhoneScreen role={role} />
        </div>
      </div>
    </div>
  );
}

/* ── Screens por actor ─────────────────────────────────────────────────── */

function PhoneScreen({ role }: { role: EcosystemRole }) {
  if (role === 'pasajero') return <PassengerScreen />;
  if (role === 'conductor') return <ConductorScreen />;
  return <AdminScreen />;
}

function PhoneStatusBar() {
  return (
    <div className="flex items-center justify-between px-5 pt-3 text-[10px] font-semibold text-slate-400">
      <span>08:15</span>
      <span className="flex items-center gap-1.5">
        <Signal size={12} aria-hidden="true" />
        <Wifi size={12} aria-hidden="true" />
        <BatteryFull size={14} aria-hidden="true" />
      </span>
    </div>
  );
}

function PassengerScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2">
      <PhoneStatusBar />
      <div className="mt-3 flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
            Enrutados Ven
          </p>
          <p className="text-[13px] font-bold text-white">Hola, María</p>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-cyan-400 to-teal-500 text-[11px] font-extrabold text-white">
          M
        </span>
      </div>

      <div className="mt-4 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 p-4 text-slate-950 shadow-lg shadow-cyan-500/20">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          Saldo disponible
        </p>
        <div className="mt-1 flex items-end justify-between">
          <span className="text-2xl font-extrabold">Bs. 84,00</span>
          <span className="rounded-full bg-slate-950/20 px-2.5 py-1 text-[10px] font-extrabold">
            5 viajes
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-white p-3 shadow-lg">
        <div className="flex aspect-square items-center justify-center rounded-lg border-4 border-[#0b1120] bg-white">
          <QrCode size={110} className="text-[#0b1120]" strokeWidth={1.4} aria-hidden="true" />
        </div>
        <p className="mt-2 text-center text-[10px] font-bold text-slate-600">
          Muestra este código al colector
        </p>
        <p className="text-center text-[9px] font-medium text-slate-400">
          Se renueva automáticamente
        </p>
      </div>

      <div className="mt-auto space-y-2 pt-4">
        <p className="px-1 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
          Últimos viajes
        </p>
        {[
          { ruta: 'Ruta 102 · Centro', hora: '07:42' },
          { ruta: 'Ruta 102 · Casa', hora: 'Ayer 18:05' },
        ].map((v) => (
          <div
            key={v.ruta}
            className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
          >
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-cyan-400/10">
              <QrCode size={14} className="text-cyan-300" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-[11px] font-bold text-white">{v.ruta}</p>
              <p className="text-[9px] text-slate-500">1 viaje · {v.hora}</p>
            </div>
            <span className="text-[9px] font-bold text-emerald-400">−1</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConductorScreen() {
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2">
      <PhoneStatusBar />
      <div className="mt-3 flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
            Enrutados Conductor
          </p>
          <p className="text-[13px] font-bold text-white">Unidad · GCB-74X</p>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-extrabold text-emerald-300">
          Ruta 102
        </span>
      </div>

      <div className="relative mt-4 h-44 overflow-hidden rounded-2xl border border-white/10 bg-black/50">
        <span className="absolute left-3 top-3 h-6 w-6 rounded-tl-lg border-l-2 border-t-2 border-cyan-400/80" />
        <span className="absolute right-3 top-3 h-6 w-6 rounded-tr-lg border-r-2 border-t-2 border-cyan-400/80" />
        <span className="absolute bottom-3 left-3 h-6 w-6 rounded-bl-lg border-b-2 border-l-2 border-cyan-400/80" />
        <span className="absolute bottom-3 right-3 h-6 w-6 rounded-br-lg border-b-2 border-r-2 border-cyan-400/80" />
        <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-xl border-2 border-dashed border-white/30" />
        <div className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 shadow-[0_0_16px_rgba(34,211,238,0.9)]" />
        <ScanLine
          size={32}
          className="absolute bottom-4 right-4 text-cyan-300/70"
          aria-hidden="true"
        />
      </div>
      <p className="mt-2 text-center text-[10px] font-semibold text-slate-400">
        Apunta al QR del pasajero
      </p>

      <div className="mt-4 grid grid-cols-2 gap-2.5">
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Viajes hoy
          </p>
          <p className="mt-1 text-xl font-extrabold text-white">34</p>
        </div>
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
            Recaudación
          </p>
          <p className="mt-1 text-xl font-extrabold text-white">Bs. 5.040</p>
        </div>
      </div>

      <div className="mt-auto flex items-center gap-2.5 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.07] px-3.5 py-3">
        <WifiOff size={16} className="shrink-0 text-emerald-300" aria-hidden="true" />
        <div>
          <p className="text-[11px] font-bold text-emerald-200">
            Modo offline activo
          </p>
          <p className="text-[9px] leading-snug text-slate-400">
            12 validaciones locales · se sincronizan al recuperar señal
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminScreen() {
  const bars = [38, 62, 50, 76, 58, 90, 68];
  return (
    <div className="flex h-full flex-col px-4 pb-4 pt-2">
      <PhoneStatusBar />
      <div className="mt-3 flex items-center justify-between px-1">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-300">
            Enrutados Admin
          </p>
          <p className="text-[13px] font-bold text-white">Asociación 102</p>
        </div>
        <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
          <Building2 size={16} className="text-white" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Cierre de caja
          </p>
          <span className="flex items-center gap-1 rounded-full bg-violet-400/10 px-2 py-0.5 text-[9px] font-extrabold text-violet-300">
            <Clock size={10} aria-hidden="true" /> 7:00 PM
          </span>
        </div>
        <p className="mt-1 text-2xl font-extrabold text-white">
          Bs. 5.040,00
        </p>
        <div className="mt-3 flex h-16 items-end gap-1.5">
          {bars.map((h, i) => (
            <div
              key={i}
              className={cn(
                'flex-1 rounded-t-sm',
                i === bars.length - 1
                  ? 'bg-gradient-to-t from-violet-500 to-fuchsia-400'
                  : 'bg-white/10',
              )}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <p className="mt-1.5 text-[9px] text-slate-500">
          Recaudación por día · última semana
        </p>
      </div>

      <div className="mt-3 space-y-2">
        {[
          { icon: Users, label: '18 conductores activos', sub: 'flota en línea ahora' },
          { icon: TicketCheck, label: '9 recargas acreditadas', sub: 'Pago Móvil + taquilla' },
          { icon: TrendingUp, label: '224 viajes registrados', sub: 'hasta ahora hoy' },
        ].map((row) => {
          const Icon = row.icon;
          return (
            <div
              key={row.label}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5"
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-400/10">
                <Icon size={14} className="text-violet-300" aria-hidden="true" />
              </span>
              <div className="flex-1">
                <p className="text-[11px] font-bold text-white">{row.label}</p>
                <p className="text-[9px] text-slate-500">{row.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto flex items-center gap-2 rounded-xl border border-violet-400/25 bg-violet-400/[0.07] px-3 py-2.5">
        <Split size={14} className="text-violet-300" aria-hidden="true" />
        <p className="text-[10px] font-bold text-violet-200">
          85/10/5 · liquidación automática
        </p>
      </div>
    </div>
  );
}