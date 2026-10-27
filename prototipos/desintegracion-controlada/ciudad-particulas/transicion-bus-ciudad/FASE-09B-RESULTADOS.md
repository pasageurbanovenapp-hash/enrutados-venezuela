# FASE 09B — Transición bus → ciudad: resultados

**Rama:** `prototipo/ciudad-trazada` · **HEAD:** `15d7851` · **Fecha:** 2026-10-26
**Ámbito:** `ciudad-particulas/transicion-bus-ciudad/` (prototipo aislado).

## 1. Archivos creados

| Archivo | Función |
|---|---|
| `index.html`, `transicion.css` | Página aislada, sin scroll ni landing |
| `transicion.js` | Motor de la transición: dispersión real + destinos + A/B |
| `validar-transicion-cdp.mjs` | Capturas, determinismo, reversibilidad, reducido, resize |
| `medir-raf-09b.mjs` | Coste de dibujo con `requestAnimationFrame` |
| `medir-caja-09b.mjs` | Caja de contenido A/B sobre píxeles |
| `capturar-uno.mjs` | Captura individual reproducible |
| `validacion-09b.json` | Resultado crudo de la validación |
| `capturas/` | 20 capturas oficiales + 2 del «antes» de la curva |
| `FASE-09B-RESULTADOS.md` | Este informe |

No se modificó `motor.js`, `app.js`, `scroll.js`, las fases 06–08 ni los activos.

## 2. Cómo se reproduce la dispersión real

Se importan del motor las funciones puras `decodificarFacetas`, `progresoFaceta` y
`transformarVertice`, y se replican **las mismas fórmulas** de `crearFacetas`
(app.js 78–161): centro, radial, normal orientada, desplazamiento, eje, demora,
distancia y giro a partir del índice. No se lee memoria interna del motor: el
estado disperso es una función pura de `p` y del índice, y se recalcula en cada
dibujo, igual que el motor.

Paleta: se replica la de app.js (`paleta` por grupo y 9 tonos de luz, líneas 20–26
y 47–52) y se interpola hacia los 6 tonos de la ciudad (fase 08).

Los destinos reproducen `construirParticulas` de `adaptacion-ruta` (techo 26%,
aristas 22%, relleno 52%, planos 1/0,86/0,7, ciudad de 1,9 unidades y 0,95 en
móvil), incluida la ruta contenida de la fase 08.

## 3. Correspondencia por índice

- Escritorio: 4.003 facetas = 4.003 destinos.
- Móvil: 2.282 = 2.282.
- `destinos[i]`, `planos[i]` y `tonos[i]` se asignan con el mismo `i` con el que
  se creó la faceta. El reparto urbano recorre `f = 0…N−1` en orden; el
  ordenamiento de dibujo usa una clave pero cada objeto conserva `i`.
- Si los tamaños no coinciden, el prototipo lanza un error explícito y no dibuja.

Verificado en las 20 capturas: `facetas === destinos` en todos los estados.

## 4. Las dos variantes de encuadre

Ambas usan los mismos datos, curvas, colores y orden. Solo cambia la transformación
de pantalla aplicada al estado del autobús antes de interpolar.

- **A — marco del autobús:** `T(x,y) = (x,y)`. El marco se fija con el bus íntegro
  (margen 10%) y el margen de dibujo del 5%, como en el motor.
- **B — reencuadre progresivo:** con `e = smoothstep(u)`,
  `s = 1 + (sAlign − 1)·e` y
  `T(x,y) = ((x−cxB)·s + cxB + (cxC−cxB)·e, (y−cyB)·s + cyB + (cyC−cyB)·e)`,
  donde `sAlign = min(anchoCiudad / anchoBus, altoCiudad / altoBus)` (uniforme,
  acotado a [0,1, 10]) y los centros salen de la caja del bus en `p=1` y de la
  caja de destinos. En escritorio `sAlign = 0,406`; en móvil `0,815`.

En ambas: `P = T(centroide) + (destino − T(centroide))·eu`, y los vértices del
triángulo colapsan hacia `P` con `ec`. En `t=1` las dos variantes son idénticas
(hashes `0e627ad8` escritorio, `5d4ef246` móvil).

## 5. Curva y ajuste documentado

**Hipótesis inicial (registrada y descartada):** `p = t/0,55`, `u = (t−0,45)/0,55`.
A `t=0,5` daba `p=0,909`: un muro de triángulos que llenaba el lienzo, con el 10,9%
de centroides fuera y sin relación legible con el autobús. Evidencia:
`capturas/antes-curva-t050-desktop.png`.

**Curva adoptada:** `p = clamp(t/0,8)`, `u = clamp((t−0,45)/0,4)`, y colapso de
forma `ec = smoothstep(clamp(u·1,7))` (la forma se vuelve punto antes de que la
posición termine de converger). Valores:

| t | p | u | eu | ec |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |
| 0,25 | 0,3125 | 0 | 0 | 0 |
| 0,50 | 0,625 | 0,125 | 0,043 | 0,117 |
| 0,75 | 0,9375 | 0,75 | 0,844 | 1 |
| 1 | 1 | 1 | 1 | 1 |

Después del ajuste, el 0% de centroides queda fuera del lienzo en los 20 estados.

## 6. Capturas

En `capturas/`: `{desktop,movil}-{A,B}-{0.00,0.25,0.50,0.75,1.00}.png`
(2 tamaños × 2 variantes × 5 progresos), más las dos del «antes» de la curva.

- Escritorio: lienzo 1440 × 627 CSS, DPR 1.
- Móvil: viewport 390 × 844, lienzo 390 × 714 CSS, DPR 2 (780 × 1428 reales).

## 7. Determinismo, reversibilidad y otras pruebas

| Prueba | Resultado |
|---|---|
| Mismo `t` y tamaño, dos cargas | mismo hash (`7f69b717`) |
| Ida 0→1 y vuelta 1→0 | hashes iguales en los 5 puntos |
| Errores de consola | ninguno |
| Desbordamiento horizontal | ninguno (20/20) |
| Movimiento reducido | sin reproducción automática; hash estable y `t` fijo tras 900 ms |
| Redimensionado 1440→1200 | 4.003 facetas, sin NaN |
| Redimensionado a 390 (cambio de nivel) | 2.282 facetas, `finito: true` |
| Centroides fuera del lienzo | 0% en los 20 estados |

Nota: la primera pasada marcó `finito: false` por un error del test (`r2.W` en vez
de `r2.lienzo.W`); corregido y repetido. No era un fallo del prototipo.

## 8. Coste de dibujo

| Caso | 40 llamadas (mediana / p95) | rAF (mediana / p95) |
|---|---|---|
| Escritorio A, t=0,5 | 2,9 / 49,5 ms | 4,3 / 6,4 ms |
| Escritorio A, t=1 | 1,8 / 30,3 ms | 3,0 / 9,5 ms |
| Móvil A, t=0,5 | 1,7 / 71,9 ms | 2,1 / 5,7 ms |
| Móvil A, t=1 | 1,1 / 49,4 ms | 1,9 / 4,0 ms |

El p95 de las llamadas seguidas es la descarga periódica de rasterizado, no el
coste por fotograma; la cifra válida es la de `rAF`. B cuesta lo mismo (dentro del
ruido). **No se mide tiempo de presentación**: 16,7 ms de intervalo no prueba
60 FPS en pantalla.

## 9. Observaciones visuales (no mediciones)

- `t=0`: autobús íntegro, teal y ámbar, con la silueta del motor.
- `t=0,25`: desprendimiento incipiente; la silueta sigue entera.
- `t=0,5`: autobús claramente reconocible, pelándose; cumple el objetivo tras el ajuste.
- `t=0,75`: la ciudad emerge como puntos que forman edificios y ruta. Con A el
  conjunto está más extendido; con B, más compacto y centrado.
- `t=1`: ciudad legible, centrada y con la ruta contenida en ambos tamaños.
- En móvil el autobús queda pequeño (encuadre propio del motor en vertical, no del
  prototipo). El HUD se parte en dos líneas: defecto cosmético.

## 10. Comparativa A/B

Caja de contenido sobre píxeles, y coste; mismos datos y progresos.

| Caso | A | B |
|---|---|---|
| Escritorio t=0,75: ancho × alto | 60,4% × 63,2% | 57,9% × 56,8% |
| Escritorio t=0,75: borde superior | 28,1% | 31,9% |
| Móvil t=0,75: ancho × alto | 88,2% × 39,4% | 86,7% × 38,7% |
| Móvil t=0,75: borde superior | 45,7% | 48,6% |
| t=1 (ambos tamaños) | idéntico | idéntico |
| Fuera del lienzo | 0% | 0% |
| Coste rAF | 1,9–4,3 ms | ≈ igual |

B acerca el conjunto a la posición y escala de la ciudad ya en la fase intermedia;
A mantiene el marco del autobús y deja que cada punto recorra más distancia.

## 11. Recomendación provisional

**Variante B para la siguiente prueba de movimiento**, por dos razones medidas: a
`t=0,75` el conjunto queda más cerca de la ciudad (caja 57,9% frente a 60,4% en
escritorio; borde superior 31,9% frente a 28,1%) y el desplazamiento individual de
cada punto es menor, lo que debería reducir la sensación de «vuelo» en la segunda
mitad. La ganancia es modesta y el estado final es idéntico; la decisión definitiva
necesita revisar la transición en movimiento, no solo fotogramas fijos. A queda
como referencia simple y reversible.

## 12. Límites

- Emulación de navegador, sin dispositivos físicos ni GPU real (rasterizado por software).
- Sin medición de tiempo de presentación; no se afirma 60 FPS.
- Las capturas son estados fijos: no permiten juzgar velocidad ni suavidad.
- El lienzo móvil es 390 × 714 CSS (el viewport es 390 × 844); el de escritorio,
  1440 × 627 dentro de un viewport de 757.
- El presupuesto cambia con el ancho (< 600 → 2.282), como en el motor; al cruzar
  el umbral cambia la identidad de nivel, no la correspondencia dentro de cada nivel.

## 13. Estado final

- Rama `prototipo/ciudad-trazada`, HEAD `15d7851`. **Sin commit.**
- `git status --short artifacts/` vacío: landing intacta.
- Fases 06, 07 y 08 y `motor.js`/`app.js`/`scroll.js` sin modificar (hashes de
  referencia comprobados al inicio y al cierre).
- Todo el trabajo nuevo está en `ciudad-particulas/transicion-bus-ciudad/`.
