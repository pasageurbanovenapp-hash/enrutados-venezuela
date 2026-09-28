import { Activity, Route, TicketCheck, Wifi } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════════════
   Operations — Cabina de Operación
   Muestra la estructura de la interfaz con placeholders honestos.
   Los datos reales se activarán con el primer piloto.
   ═══════════════════════════════════════════════════════════════════════════ */

export function Operations() {
  return (
    <section className="operations section" id="operacion" aria-labelledby="operations-title">
      <div className="wrap">
        <div className="section-intro reveal">
          <div>
            <span className="eyebrow">La cabina</span>
            <h2 className="section-title" id="operations-title">
              Lo que verás cuando la ruta esté en marcha.
            </h2>
          </div>
          <p className="section-copy">
            No mostramos cifras que no existen. Cuando el primer piloto
            arranque, esta cabina se llenará de datos reales. Esto es lo que
            medirá.
          </p>
        </div>

        <div className="operations__stage reveal">
          {/* Panel de cabina */}
          <div className="cabin">
            <header className="cabin__head">
              <span className="cabin__title mono">
                RESUMEN DE OPERACIÓN
              </span>
              <span className="cabin__status">
                <span className="cabin__dot" aria-hidden="true" />
                En preparación
              </span>
            </header>

            <div className="cabin__grid">
              <CabinMetric
                icon={Route}
                label="Unidades activas"
                value="—"
              />
              <CabinMetric
                icon={TicketCheck}
                label="Viajes registrados"
                value="—"
              />
              <CabinMetric
                icon={Activity}
                label="Último registro"
                value="— —"
                mono
              />
            </div>

            <div className="cabin__footer">
              <span className="cabin__footer-label mono">
                PRÓXIMO PASO
              </span>
              <p className="cabin__footer-text">
                Primer piloto real con asociación aliada.
              </p>
            </div>
          </div>

          {/* Lista lateral de capacidades */}
          <ul className="operations__capabilities">
            <CapabilityRow
              icon={Route}
              title="Viajes por ruta y turno"
              text="Cada abordaje queda asociado a la unidad y a su recorrido."
            />
            <CapabilityRow
              icon={TicketCheck}
              title="Recaudación diaria por unidad"
              text="Cierre de caja automático a las 7:00 PM, sin planillas."
            />
            <CapabilityRow
              icon={Activity}
              title="Split 85/10/5 ejecutado"
              text="La liquidación se calcula sola. Sin conciliaciones manuales."
            />
            <CapabilityRow
              icon={Wifi}
              title="Sincronización offline"
              text="Los viajes se registran localmente y se sincronizan al recuperar señal."
            />
          </ul>
        </div>
      </div>
    </section>
  );
}

/* ── Componentes internos ─────────────────────────────────────────────── */

interface CabinMetricProps {
  icon: typeof Route;
  label: string;
  value: string;
  mono?: boolean;
}

function CabinMetric({ icon: Icon, label, value, mono }: CabinMetricProps) {
  return (
    <div className="cabin-metric">
      <span className="cabin-metric__icon">
        <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span className="cabin-metric__label">{label}</span>
      <span
        className={`cabin-metric__value${mono ? ' mono' : ''}`}
      >
        {value}
      </span>
    </div>
  );
}

interface CapabilityRowProps {
  icon: typeof Route;
  title: string;
  text: string;
}

function CapabilityRow({ icon: Icon, title, text }: CapabilityRowProps) {
  return (
    <li className="capability-row">
      <span className="capability-row__icon">
        <Icon size={16} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <div className="capability-row__body">
        <span className="capability-row__title">{title}</span>
        <p className="capability-row__text">{text}</p>
      </div>
    </li>
  );
}