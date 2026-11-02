# V15 · doble reloj, ensamble automático y reversa

**Estado:** aprobada visualmente el 2026-11-02.

## Qué contiene

- `index.html`: layout y textos.
- `spike.js`: escena Three.js.
- `assets/facetas.bin` y `assets/motor.js`: bus ENF1 usado por la escena.
- `vendor/three.module.js`: Three.js local.

## Comportamiento

- Entrada del bus por scroll.
- Freno, humo y **erosión automática** de ~5 s.
- Dispersión amplia de partículas (factor 1,65).
- Al entrar en la sección 2, **ensamble automático** de la ciudad (~4 s).
- **Reversa:** al subir el scroll, la ciudad se desensambla, las partículas vuelven y el bus se reconstruye.
- Texto de sección 2 oculto al volver a la sección 1.

## GLB de referencia

`prototipos/entradas/bus-v2fun/body.glb` es el bus moderno de 45 MB. **No está cargado por la V15**; es una referencia para el agente. La escena sigue usando ENF1.

## Límites conocidos

- El GLB no está integrado ni optimizado (500k triángulos; ~33 MB de texturas).
- Las ruedas del GLB están fusionadas; no hay animación de ruedas.
- Sin prueba física en POCO, sin FPS y sin medición de rendimiento.
- El disparo del ensamble es por umbral de scroll, no por `IntersectionObserver`.
- La reversa se probó en escritorio headless; falta móvil.
