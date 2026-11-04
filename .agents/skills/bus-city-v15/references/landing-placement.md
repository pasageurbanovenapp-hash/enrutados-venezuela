# Integración en la landing

## Principio

La V15 es una página completa. La landing es una sección dentro de un relato.
No pegues el `scrollY` global del prototipo.

## Ubicación editorial

Entre:

1. **Una experiencia más ordenada** (recargar, presentar, validar).
2. **Cada viaje deja registro** (evidencia).

La animación es un respiro cinematográfico. No explica, no lleva CTA y no
introduce cifras.

No la muevas al Hero ni la conviertas en una prueba de producto.

## Estructura

```html
<section id="transicion" aria-labelledby="transicion-title">
  <div class="transicion__sticky">
    <canvas aria-label="Un bus se desintegra en partículas y forma una ciudad."></canvas>
  </div>
</section>
```

- Sección de 250–300vh.
- Canvas `position: sticky; top: 0; height: 100svh`.
- Sin texto visible.
- Sin `scrollRestoration = 'manual'`.
- Sin `window.scrollTo(0,0)`.

## Progreso

```js
const r = seccion.getBoundingClientRect();
const alto = seccion.offsetHeight - window.innerHeight;
const t = clamp(-r.top / alto);
```

- Solo dibuja dentro de la sección.
- Un `requestAnimationFrame` pendiente.
- `IntersectionObserver` para pausar.
- `resize`/`orientationchange` recalculan.
- Destruye listeners, observador y rAF.

## Carga

- No cargues el GLB en el primer paint.
- Carga cuando la sección esté a una pantalla de distancia.
- Muestra un póster estático mientras carga.
- No bloquees el CTA del Hero.

## Accesibilidad

- `aria-label` describe la transformación.
- Alternativa textual fuera del canvas.
- No secuestres el scroll.
- Respeta `prefers-reduced-motion` o documenta la política aprobada.

## Frontera

La animación no repite la evidencia de “Cada viaje deja registro” ni los pasos
de “Una experiencia más ordenada”. Su única función es la transición visual.
