# Implementación móvil

## Regla

Un viewport pequeño no es una versión móvil. La sección debe seguir siendo
scroll nativo, sin canvas fijo global, sin bloquear el gesto y sin cargar el GLB
en el primer paint.

## Estructura

```css
.transicion {
  position: relative;
  height: 260svh;
}

.transicion__sticky {
  position: sticky;
  top: 0;
  height: 100svh;
  overflow: hidden;
}

.transicion canvas {
  display: block;
  width: 100%;
  height: 100%;
  touch-action: pan-y;
}
```

Fallback para navegadores sin `svh`:

```css
.transicion__sticky { height: 100vh; height: 100svh; }
```

No uses `position: fixed` para el canvas de la sección.

## Progreso

```js
const seccion = document.getElementById('transicion');
const sticky = seccion.querySelector('.transicion__sticky');

function progreso() {
  const r = seccion.getBoundingClientRect();
  const max = seccion.offsetHeight - sticky.offsetHeight;
  return max > 0 ? Math.max(0, Math.min(1, -r.top / max)) : 0;
}
```

- `t` es relativo a la sección, no `scrollY / documentHeight`.
- No toques `history.scrollRestoration`.
- No hagas `scrollTo(0, 0)`.
- No interceptes `touchstart`/`touchmove`.

## Canvas y DPR

```js
const rect = canvas.getBoundingClientRect();
const dpr = Math.min(window.devicePixelRatio || 1, 2);
renderer.setPixelRatio(dpr);
renderer.setSize(rect.width, rect.height, false);
camera.aspect = rect.width / rect.height;
camera.updateProjectionMatrix();
```

- Mide el canvas, no `window.innerHeight`.
- En móvil, `antialias: false` puede ser razonable si el equipo es limitado.
- No uses postprocesado.
- No uses sombras dinámicas si no son imprescindibles.

## Carga diferida

```js
const io = new IntersectionObserver(([e]) => {
  if (e.isIntersecting) {
    cargarGlb();
    io.disconnect();
  }
}, { rootMargin: '150% 0px' });
io.observe(seccion);
```

- No cargues el GLB en el primer paint.
- Muestra un póster estático mientras carga.
- No bloquees el CTA.
- Si falla, deja el póster y un estado de error.

## Scroll y rAF

- Un solo `requestAnimationFrame` pendiente.
- Pausa cuando la sección no está visible.
- `resize`, `orientationchange` y `visualViewport` recalculan.
- No dibujes si `|Δt| < 0.001`.
- Teardown: cancela rAF, desconecta IO/ResizeObserver.

## Movimiento reducido

- No hagas `erode = 1` ni `reform = 1` de golpe.
- La V15 aprobada mantiene la transición; si se cambia la política, se decide y
  se prueba.
- Emula `prefers-reduced-motion: reduce`; no confundas con POCO físico.
- Comprueba que el cambio en vivo no deja la escena muerta.

## Layout

- El bus no debe tapar el titular ni el CTA.
- En 360–390 px, el texto va debajo del canvas.
- Sin scroll horizontal.
- Sin `overflow: hidden` en `body`.
- Respeta `env(safe-area-inset-bottom)` si hay CTA fijo.

## Pruebas mínimas

| Caso | Esperado |
|---|---|
| 360×800 | bus y texto legibles |
| 390×844 | sin recortes |
| 300×900 | lectura |
| 844×390 landscape | no hay solapamiento crítico |
| DPR 2 y 3 | nitidez y coste razonables |
| POCO físico | mismo flujo que laptop |
| reduce | sin salto |
| salir/reentrar | pausa y reanudación |
| cache-bust `?v=N` | carga la versión nueva |

## Evidencia

Registra:

```text
dispositivo, SO, navegador, DPR, viewport, canvas, t
```

No declares FPS. Si mides, habla de intervalo de `rAF`. No declares memoria sin
medición.

## Errores frecuentes

- `100vh` en móvil: la barra del navegador recorta.
- Canvas `fixed`: tapa toda la landing.
- `scrollY / documentHeight`: el progreso no corresponde a la sección.
- `touchmove` con `preventDefault`: rompe el scroll.
- Cargar el GLB al inicio: compite con el LCP.
- `deviceMemory` como verdad absoluta: no es universal.
- Probar solo en DevTools: no es hardware.
