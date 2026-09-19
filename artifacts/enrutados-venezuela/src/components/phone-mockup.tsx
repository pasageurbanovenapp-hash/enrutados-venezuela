import { useRef } from 'react';

export function PhoneMockup() {
  const device = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || !device.current) return;

    const bounds = device.current.getBoundingClientRect();
    const pointerX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const pointerY = (event.clientY - bounds.top) / bounds.height - 0.5;
    device.current.style.transform = `rotateX(${(-pointerY * 10).toFixed(2)}deg) rotateY(${(pointerX * 14).toFixed(2)}deg)`;
  };

  const handlePointerLeave = () => {
    if (device.current) device.current.style.transform = 'rotateX(0deg) rotateY(0deg)';
  };

  return (
    <div className="reveal" aria-label="Evidencia del producto Enrutados">
      <div className="device-float">
        <div
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div ref={device} className="device-shell" style={{ transformStyle: 'preserve-3d' }}>
            <div className="device-frame">
              <div className="device-notch" aria-hidden="true" />
              <div className="screen-header">
                <span className="pill-soft">RUTA 05</span>
                <span className="status-dot" aria-hidden="true" />
              </div>

              <div className="screen-card active">
                <div className="screen-label-row">
                  <span>Viaje activo</span>
                  <span className="status-tag">Validado</span>
                </div>
                <div className="trip-price">Bs. 85</div>
                <div className="trip-route">La Isabelica → Centro</div>
                <div className="trip-meta">
                  <span>08:45 AM</span>
                  <span>Pasajero #24</span>
                </div>
              </div>

              <div className="screen-section">
                <div className="mini-title">Resumen</div>
                <div className="mini-stats">
                  <div>
                    <small>Pagos</small>
                    <strong>14</strong>
                  </div>
                  <div>
                    <small>Rutas</small>
                    <strong>3</strong>
                  </div>
                </div>
              </div>

              <div className="route-list">
                <div className="route-item">
                  <span className="dot cyan" aria-hidden="true" />
                  <div>
                    <strong>Parada 01</strong>
                    <small>08:30</small>
                  </div>
                </div>
                <div className="route-item">
                  <span className="dot cyan" aria-hidden="true" />
                  <div>
                    <strong>Parada 02</strong>
                    <small>08:42</small>
                  </div>
                </div>
                <div className="route-item">
                  <span className="dot orange" aria-hidden="true" />
                  <div>
                    <strong>Centro</strong>
                    <small>08:50</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
