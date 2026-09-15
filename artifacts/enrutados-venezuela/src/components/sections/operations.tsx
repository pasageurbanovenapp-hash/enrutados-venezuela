import { Clock3, Network, Route as RouteIcon } from 'lucide-react';

export function Operations() {
  return (
    <section className="section operations" aria-labelledby="operations-title">
      <div className="wrap operation-grid">
        <div className="reveal">
          <span className="eyebrow">¿Qué ofrece Enrutados?</span>
          <h2 className="section-title" id="operations-title">
            Una base digital para entender mejor el transporte.
          </h2>
          <p className="section-copy">
            Queremos ofrecer una plataforma base para digitalizar y hacer más transparente el
            transporte público urbano, para que cada recorrido sea más claro, más verificable y
            más confiable.
          </p>
          <div className="operation-list" style={{ marginTop: 35 }}>
            <div className="operation-item">
              <div className="card-icon">
                <RouteIcon size={18} />
              </div>
              <div>
                <h3>Rutas con contexto</h3>
                <p>Registra movimiento por recorrido, no en una hoja perdida.</p>
              </div>
            </div>
            <div className="operation-item">
              <div className="card-icon">
                <Clock3 size={18} />
              </div>
              <div>
                <h3>Turnos más visibles</h3>
                <p>Ayuda a conversar sobre tiempos y operación con una base común.</p>
              </div>
            </div>
            <div className="operation-item">
              <div className="card-icon">
                <Network size={18} />
              </div>
              <div>
                <h3>Un mismo lenguaje</h3>
                <p>Pasajeros, conductores y coordinación miran el viaje desde el mismo punto.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="dashboard-card reveal" aria-label="Vista conceptual de un resumen operativo">
          <div className="dash-head">
            <span>RESUMEN DE OPERACIÓN / RUTA 05</span>
            <span className="dash-status">Piloto activo</span>
          </div>
          <div className="dash-body">
            <div>
              <div className="bar-chart" aria-hidden="true">
                <span className="bar" style={{ height: '38%' }} />
                <span className="bar" style={{ height: '54%' }} />
                <span className="bar" style={{ height: '45%' }} />
                <span className="bar" style={{ height: '77%' }} />
                <span className="bar" style={{ height: '62%' }} />
                <span className="bar" style={{ height: '89%' }} />
                <span className="bar" style={{ height: '68%' }} />
              </div>
              <p className="dash-caption">Registros por franja · lunes a domingo</p>
            </div>
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="dash-metric">
                <small>Viajes registrados</small>
                <strong>1.248</strong>
              </div>
              <div className="dash-metric">
                <small>Unidades activas</small>
                <strong>18</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
