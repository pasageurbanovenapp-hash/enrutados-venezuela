# FASE 10 — Experiencia de movimiento y preparación de integración

**Rama:** `prototipo/ciudad-trazada` · **HEAD:** `15d7851` · **Fecha:** 2026-10-26
**Ámbito:** `ciudad-particulas/transicion-bus-ciudad/experiencia-movimiento/`.

## 1. Qué se construyó

Una página aislada que conduce la transición A con el **scroll vertical real** de la
página, sin animación autónoma:

- Sección de prueba de 400 vh y un cierre de 120 vh para poder salir de ella.
- Lienzo fijo entre cabecera (62 px) y pie (68 px): **1440 × 627** en escritorio y
  **390 × 714** en móvil, igual que las referencias.
- `t = clamp(scrollY / (altoSección − altoViewport))`.
- Un solo `requestAnimationFrame` pendiente; se dibuja solo si `|Δt| ≥ 0,001`.
- `IntersectionObserver` para dejar de trabajar al salir de la sección.
- `resize`, `orientationchange`, `prefers-reduced-motion` y `destruir()`.

**Reutilización sin modificar la transición:** se importa `../transicion.js` y se
usa su API `window.__transicion` (`fijarT`, `estado`, `huella`, `geometria`). La
única adaptación es un *shim* de `fetch` para que el binario, que la transición
pide con una ruta relativa al documento, se resuelva desde esta subcarpeta
(`../../../../facetas-retexture/facetas.bin`). No se tocó `transicion.js`.

## 2. Estado del repositorio

Al inicio y al cierre: rama `prototipo/ciudad-trazada`, HEAD `15d7851`;
`git status --short artifacts/` vacío. `transicion.js` conserva `c1ac95d7`. Fases
06–09D, `motor.js`, `app.js` y `scroll.js` intactos. Sin commit.

## 3. Matriz de pruebas y resultados

Ejecutada con `validar-experiencia-cdp.mjs` (Chrome headless, rasterizado por
software) en escritorio 1440 × 757/DPR 1 y móvil 390 × 844/DPR 2.

| Prueba | Escritorio | Móvil |
|---|---|---|
| Recorrido lento 0→1 | 0→1 monótono | 0→1 monótono |
| Recorrido rápido | t=1 | t=1 |
| Recorrido 1→0 | 1→0 monótono | 1→0 monótono |
| Control t=0 / .25 / .50 / .75 | 0 / 0,2501 / 0,5002 / 0,7499 | 0 / 0,25 / 0,50 / 0,75 |
| Ciudad final (hash) | **0e627ad8** = referencia | **5d4ef246** = referencia |
| Ráfaga de 500 eventos sin desplazamiento | +1 RAF, **0 dibujos** | +1 RAF, **0 dibujos** |
| Pausa de 700 ms | sin cambios | sin cambios |
| Salida de la sección | `visible=false`, **0 RAF, 0 dibujos** | igual |
| Reentrada | vuelve a t=0,5 | igual |
| Resize 1440→1200 | 4.003 facetas, finito | — |
| Resize a 390 (cambio de nivel) | 2.282 facetas, finito | 2.282 |
| Movimiento reducido | modo manual, t=0 estable, 0 RAF, control explícito a 0,5 | igual |
| `destruir()` | 0 RAF, 0 dibujos, `pendiente=false` | igual |
| Errores de consola | **ninguno** | **ninguno** |

Punto de control t=0,5 en escritorio: **7 vértices** de 12.009 quedan fuera del
lienzo por el borde inferior (efecto de encuadre ya documentado en 09C); en el
resto de estados y en móvil, 0.

## 4. Coste

40 muestras con `requestAnimationFrame` tras 10 dibujos de calentamiento.

| Estado | Escritorio | Móvil |
|---|---|---|
| t=1 | 2,9 ms (p95 5,6) | 1,8 ms (p95 4,5) |
| t=0,5 | 4,1 ms (p95 7,4) | 2,3 ms (p95 2,6) |
| Intervalo RAF | 16,7 ms | 16,7 ms |

El coste es comparable al de 09C. **No se mide tiempo de presentación**; 16,7 ms
de intervalo no prueba 60 FPS ni fluidez en hardware real.

## 5. Observaciones visuales del recorrido

- El desprendimiento empieza a notarse hacia `t≈0,25`; en `t=0,5` el autobús
  sigue reconociéndose (captura `desktop-scroll-0.50.png`).
- Hacia `t≈0,6` el autobús deja de leerse como vehículo y la nube domina.
- En `t=0,75` se reconocen techos, aristas y la ruta; en `t=1` la ciudad es nítida.
- El retroceso reconstruye el autobús con los mismos estados: los hashes de ida y
  vuelta coinciden en los puntos de control (misma t).
- No se observaron saltos, parpadeos ni congelaciones en los puntos muestreados;
  la continuidad fina ya se midió en 09C (0 discontinuidades, reversibilidad 0/101).
- En móvil el autobús es pequeño por el encuadre vertical del motor; la ciudad
  final se lee. No se percibió un empeoramiento por el scroll.

## 6. Matriz de aceptación

| Criterio | Resultado |
|---|---|
| Recorrido completo en ambos sentidos | **cumple** |
| Sin estado residual tras cambios de dirección | **cumple** (alternancia termina en 0,5) |
| Puntos de control reproducibles | **cumple** (±0,0002 por redondeo de píxel) |
| Pausa detiene el trabajo | **cumple** (0 RAF, 0 dibujos) |
| Salida y destrucción limpian | **cumple** |
| Movimiento reducido | **cumple** (manual, sin bucle) |
| Sin errores de consola | **cumple** |
| Ciudad final = referencia A | **cumple** (hashes idénticos) |
| Sin cambios fuera de alcance | **cumple** |

## 7. Decisión: **Apto con brechas pendientes**

El prototipo dinámico cumple todas las pruebas locales, pero **no está autorizado
para la landing**. Brechas concretas antes de una integración:

1. **Dispositivo físico.** Todo es emulación; falta un teléfono real.
2. **Tiempo de presentación.** No medido; solo el coste de dibujo y el intervalo RAF.
3. **Ciclo de vida en la landing.** El `fetch` del binario ocurre al cargar; faltan
   estados de carga/error, caché y precarga, y conectar `destruir()` al desmontaje.
4. **Sección real.** La sección de 400 vh y el cierre son artificiales; hay que
   definir altura, anclas y mapeo con la narrativa de la landing.
5. **Cambio de nivel a 600 px.** Cruzar el umbral cambia 4.003 ↔ 2.282 en caliente;
   hay que decidir si se congela el nivel o se reconstruye.
6. **Movimiento reducido.** La solución manual funciona; falta definir la política
   de producto (¿control manual visible, estado estático, texto alternativo?).
7. **Accesibilidad.** El canvas tiene `aria-label`; falta alternativa textual y
   revisar que la transición no secuestre el scroll ni el foco.
8. **Recorte de 7 vértices** en t≈0,5 en escritorio (efecto de encuadre conocido).
9. **Rendimiento en equipos lentos** y con GPU real: sin datos.

## 8. Archivos y alcance

Creados en `experiencia-movimiento/`: `index.html`, `experiencia.css`,
`experiencia.js`, `validar-experiencia-cdp.mjs`, `validacion-10.json`, 8 capturas
(`{desktop,movil}-scroll-{0.00,0.50,0.75,1.00}.png`) y este informe.
No se modificó ningún archivo de las fases 06–09D ni de la landing.

## 9. Limitaciones de la evidencia

- Emulación de navegador con rasterizado por software; sin GPU ni hardware físico.
- Las capturas son estados fijos; la continuidad temporal se apoya en 09C y en la
  reversibilidad medida aquí, no en una percepción grabada.
- Dos errores del propio test se detectaron y corrigieron durante la fase: el hash
  final se leía tras el resize (el válido es el control en t=1) y las capturas de
  escritorio se tomaban a 390 px. Ambos se repitieron con el orden correcto.
