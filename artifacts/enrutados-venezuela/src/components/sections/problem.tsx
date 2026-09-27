/*
  Problem — sección "El desafío"

  Arquitectura interna (no exportada):

    Problem
    ├── SectionHeader   — eyebrow, título y párrafo descriptivo
    ├── ActorNode       — tarjeta por actor (Pasajero, Unidad, Asociación)
    └── BrokenLine      — línea de conexión rota con animación narrativa
          └── GapMarker — marcador de ruptura entre actores (interno a BrokenLine)
*/

export function Problem() {
  return (
    <section className="section problem-section" aria-labelledby="problem-title">
      <div className="wrap">
        <style>{`
          .problem-header {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 90px;
            align-items: center;
          }
          .actors-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 24px;
            position: relative;
            z-index: 1;
          }
          .problem-broken-line {
            position: absolute;
            top: 38px;
            left: 0;
            right: 0;
            height: 1px;
            z-index: 0;
            pointer-events: none;
          }
          @media (max-width: 900px) {
            .problem-header {
              grid-template-columns: 1fr;
              gap: 24px;
            }
            .actors-grid {
              grid-template-columns: 1fr;
            }
            .problem-broken-line {
              display: none;
            }
          }
        `}</style>

        <SectionHeader />

        {/* ── Metáfora visual: nodos desconectados ─────────────────────── */}
        <div className="reveal" style={{ marginTop: '72px' }}>

          {/*
            position: relative permite que BrokenLine use position: absolute
            para atravesar toda la fila sin participar en el flujo del grid.
          */}
          <div style={{ position: 'relative' }}>
            <BrokenLine />

            <div className="actors-grid">
              {/*
                borderColor: valores exactos de .audience-card en index.css
                glow: eliminado — el aislamiento se comunica por borde + espacio
              */}
              <ActorNode
                accentColor="var(--cyan)"
                borderColor="rgba(34, 211, 238, 0.2)"
                kicker="Pasajero"
                questions={[
                  '¿Cuánto falta?',
                  '¿Ya pasó?',
                  '¿Viene o no viene?',
                ]}
              />

              <ActorNode
                accentColor="var(--orange)"
                borderColor="rgba(245, 158, 11, 0.2)"
                kicker="Unidad 018 · Ruta 05"
                dataLines={[
                  '— sin registro',
                  '— sin respaldo',
                  '— sin evidencia',
                ]}
                note="Datos ilustrativos"
              />

              <ActorNode
                accentColor="var(--ink-soft)"
                borderColor="rgba(143, 163, 179, 0.2)"
                kicker="Asociación"
                questions={[
                  '¿Cuántas unidades salieron?',
                  '¿Cuántos viajes hicieron?',
                  '¿Dónde están los datos?',
                ]}
              />
            </div>
          </div>

          {/* Cierre narrativo */}
          <div
            style={{
              marginTop: '48px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(143, 163, 179, 0.1)',
              textAlign: 'center',
            }}
          >
            <p
              style={{
                margin: '0 0 8px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.7rem',
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'rgba(143, 163, 179, 0.45)',
              }}
            >
              conexión incompleta
            </p>
            <p
              style={{
                margin: 0,
                fontSize: '1.15rem',
                fontWeight: 600,
                letterSpacing: '-0.02em',
                lineHeight: 1.4,
                color: 'rgba(255, 255, 255, 0.75)',
              }}
            >
              Los datos existen.{' '}
              <span style={{ color: 'rgba(143, 163, 179, 0.5)', fontWeight: 400 }}>
                Pero no se conectan.
              </span>
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   SectionHeader
   Eyebrow, título principal y párrafo descriptivo de la sección.
   Contenido conservado íntegramente del diseño original.
───────────────────────────────────────────────────────────────────────────── */
function SectionHeader() {
  return (
      <div className="reveal problem-header">
      <div>
        <span className="eyebrow">El desafío</span>
        <h2 className="section-title" id="problem-title">
          Hoy, el transporte público urbano opera sin trazabilidad.
        </h2>
      </div>
      <p className="section-copy" style={{ margin: 0 }}>
        Hay movimiento todos los días, pero poca información para entenderlo. Sin registros
        consistentes, la operación pierde transparencia, trazabilidad y capacidad de mejora.
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ActorNode
   Tarjeta visual para cada actor del ecosistema de transporte.
   Soporta dos modos de contenido:
     - questions: preguntas retóricas (Pasajero, Asociación)
     - dataLines: líneas de estado en monospace (Unidad)
   Los textos son recursos narrativos de la interfaz, no datos reales.
───────────────────────────────────────────────────────────────────────────── */
interface ActorNodeProps {
  accentColor: string;
  borderColor: string;
  kicker: string;
  questions?: string[];
  dataLines?: string[];
  note?: string;
}

function ActorNode({
  accentColor,
  borderColor,
  kicker,
  questions,
  dataLines,
  note,
}: ActorNodeProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 24px',
        border: `1px solid ${borderColor}`,
        /* borderRadius: 22px — igual que .audience-card */
        borderRadius: '22px',
        /* background + inset shadow: idénticos a .audience-card */
        background: 'rgba(255, 255, 255, 0.03)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        minHeight: '200px',
      }}
    >
      {/* Orbe + kicker — patrón de .stop-dot + .card-kicker del sistema */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
        <div
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: accentColor,
            /* Sin glow exterior — el color del orbe es suficiente señal */
            flexShrink: 0,
          }}
        />
        <span
          style={{
            /* font: 700 10px Space Mono — igual que .card-kicker */
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.68rem',
            fontWeight: 700,
            letterSpacing: '0.13em',
            textTransform: 'uppercase',
            color: accentColor,
          }}
        >
          {kicker}
        </span>
      </div>

      {/* Preguntas retóricas — Pasajero y Asociación */}
      {questions && (
        <ul
          style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '10px', flex: 1 }}
          aria-label={`Preguntas representativas de ${kicker} — recursos narrativos de la interfaz`}
        >
          {questions.map((q) => (
            <li
              key={q}
              style={{
                fontSize: '0.9rem',
                /* var(--ink-soft) — token del sistema para texto secundario */
                color: 'var(--ink-soft)',
                lineHeight: 1.45,
                paddingLeft: '14px',
                /* border-left con el color del actor — patrón de .problem-points span */
                borderLeft: `2px solid ${borderColor}`,
              }}
            >
              {q}
            </li>
          ))}
        </ul>
      )}

      {/* Líneas de estado — Unidad */}
      {dataLines && (
        <ul
          style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '8px', flex: 1 }}
          aria-label="Estado ilustrativo de la unidad"
        >
          {dataLines.map((line) => (
            <li
              key={line}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.8rem',
                /* var(--ink-soft) — consistente con el sistema, no color inventado */
                color: 'var(--ink-soft)',
                letterSpacing: '0.02em',
              }}
            >
              {line}
            </li>
          ))}
        </ul>
      )}

      {/* Nota aclaratoria */}
      {note && (
        <p
          style={{
            margin: '16px 0 0',
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.62rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            /* Opacidad reducida de var(--ink-soft) — igual que .stop-label */
            color: 'rgba(143, 163, 179, 0.35)',
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   BrokenLine
   Línea de conexión rota entre los tres actores.

   Propósito narrativo:
     Comunica que existe relación entre los actores, pero no hay continuidad
     de información entre ellos. Nunca se convierte en una línea completa.

   Geometría:
     Capa position: absolute a top: 38px (alineada con el centro del orbe
     de cada ActorNode: padding 28px + orbe 10px / 2). Tres segmentos
     independientes separados por dos GapMarker.

   Animación (local, no modifica index.css):
     - line-reveal: scaleX 0→1 con transform-origin: left. Cada segmento
       aparece en secuencia (0.1s → 0.4s → 0.7s) leyendo la fila de
       izquierda a derecha, igual que la narrativa.
     - gap-pulse: pulso de opacidad 4s en los marcadores de ruptura.
       Inicia después de que los segmentos adyacentes ya son visibles.
     - prefers-reduced-motion: todos los elementos aparecen estáticos.
───────────────────────────────────────────────────────────────────────────── */
function BrokenLine() {
  /* GapMarker es interno a BrokenLine — marca el punto exacto de ruptura */
  function GapMarker({ position, delay }: { position: string; delay: string }) {
    return (
      <div
        className="connection-gap-marker"
        style={{
          position: 'absolute',
          left: position,
          top: '-4px',
          width: '9px',
          height: '9px',
          transform: 'rotate(45deg)',
          pointerEvents: 'none',
        }}
      >
        <span
          aria-hidden="true"
          style={{
            display: 'block',
            width: '9px',
            height: '9px',
            border: '1px solid rgba(143, 163, 179, 0.28)',
            borderRadius: '2px',
            background: 'rgba(10, 22, 40, 0.9)',
            animation: `problem-line-reveal 0.4s ease-out ${delay} both, problem-gap-pulse 4s ease-in-out ${delay} infinite`,
          }}
        />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes problem-line-reveal {
          from { transform: scaleX(0); opacity: 0; }
          to   { transform: scaleX(1); opacity: 1; }
        }
        @keyframes problem-gap-pulse {
          0%, 100% { opacity: 0.25; }
          50%       { opacity: 0.65; }
        }
        @media (prefers-reduced-motion: reduce) {
          .problem-line-seg      { animation: none !important; transform: scaleX(1) !important; opacity: 1 !important; }
          .connection-gap-marker { animation: none !important; }
          .connection-gap-marker span { animation: none !important; opacity: 0.4 !important; }
        }
      `}</style>

      <div
        className="problem-broken-line"
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '38px',
          left: 0,
          right: 0,
          height: '1px',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      >
        {/* Segmento 1 — Pasajero (cyan → gris, delay 0.1s) */}
        <div
          className="problem-line-seg"
          style={{
            position: 'absolute',
            left: '2%',
            width: 'calc(33% - 20px)',
            height: '1px',
            /* var(--line) = rgba(143,163,179,0.2) — token del sistema para separadores */
            background: 'linear-gradient(to right, transparent, var(--line) 30%, transparent)',
            transformOrigin: 'left center',
            animation: 'problem-line-reveal 0.9s cubic-bezier(0.4,0,0.2,1) 0.1s both',
          }}
        />

        <GapMarker position="calc(33% + 12px - 5px)" delay="1.1s" />

        {/* Segmento 2 — Unidad 018 (var(--line), delay 0.4s) */}
        <div
          className="problem-line-seg"
          style={{
            position: 'absolute',
            left: 'calc(33% + 28px)',
            width: 'calc(34% - 56px)',
            height: '1px',
            background: 'linear-gradient(to right, transparent, var(--line) 30%, var(--line) 70%, transparent)',
            transformOrigin: 'left center',
            animation: 'problem-line-reveal 0.9s cubic-bezier(0.4,0,0.2,1) 0.4s both',
          }}
        />

        <GapMarker position="calc(67% - 4px - 5px)" delay="1.4s" />

        {/* Segmento 3 — Asociación (var(--line), delay 0.7s) */}
        <div
          className="problem-line-seg"
          style={{
            position: 'absolute',
            left: 'calc(67% + 16px)',
            right: '2%',
            height: '1px',
            background: 'linear-gradient(to right, transparent, var(--line) 30%, transparent)',
            transformOrigin: 'left center',
            animation: 'problem-line-reveal 0.9s cubic-bezier(0.4,0,0.2,1) 0.7s both',
          }}
        />
      </div>
    </>
  );
}
