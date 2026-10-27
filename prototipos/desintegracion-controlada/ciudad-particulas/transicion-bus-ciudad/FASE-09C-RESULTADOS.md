# FASE 09C — Validación cinematográfica de la transición

**Rama:** `prototipo/ciudad-trazada` · **HEAD:** `15d7851` · **Fecha:** 2026-10-26
**Ámbito:** `ciudad-particulas/transicion-bus-ciudad/`.

## 1. Estado del repositorio

Al inicio y al cierre: rama `prototipo/ciudad-trazada`, HEAD `15d7851`.
`git status --short artifacts/` vacío. Hashes de referencia sin cambios:
fase 06 `6df400ca`, fase 07 `371c673f`, fase 08 `fa3dbfc6`, `motor.js`
`a88b80a6`, `app.js` `a63ba7e7`, `scroll.js` `c51ce162`. Sin commit.

## 2. Método y comandos

Se condujo `t` por script (101 pasos, uno por fotograma), sin animación autónoma:
`fijarT(t)` → `requestAnimationFrame` → lectura de píxeles. Cada paso registra
diferencia media con el anterior sobre una miniatura 96 × 54, hash de esa
miniatura, cobertura, ocupación de los cuatro bordes y geometría (vértices y
centroides fuera, caja). Se ejecutó ida y vuelta para A y B en ambos tamaños.

```
python3 -m http.server 5199 --bind 127.0.0.1
google-chrome --headless=new --disable-gpu --no-sandbox --user-data-dir=... \
  --window-size=1456,900 --remote-debugging-port=9227 "<url>"
node validar-movimiento-cdp.mjs 9227 > movimiento-09c.json
node sonda-pico-09c.mjs 9227        # resolución 0,0025 en t=0,50…0,60
node coste-09c.mjs 9227 > coste-09c.json
node cierre-09c.mjs 9227            # reducido y desbordamiento
```

Instrumentación añadida: `geometria()` en `transicion.js` (solo lectura; informa
vértices/centroides fuera y caja). No cambia ninguna fórmula visual.

## 3. Matriz ejecutada

| Condición | Escritorio | Móvil |
|---|---|---|
| Viewport | 1440 × 757 | 390 × 844 |
| Lienzo real | **1440 × 627** | **390 × 714** |
| DPR | 1 | 2 |
| Variantes | A y B | A y B |
| Progreso | 0 · 0,25 · 0,50 · 0,75 · 1 | idem |
| Recorrido | ida y vuelta (101 pasos) | ida y vuelta (101 pasos) |

Las dimensiones coinciden con las informadas en 09B.

## 4. Movimiento: mediciones

| Caso | Diferencia media por paso (mediana / p95 / máx) | Reversibilidad |
|---|---|---|
| Escritorio A | 0,47 / 6,91 / 8,09 | 0 discrepancias de 101 |
| Escritorio B | 0,47 / 6,93 / 7,78 | 0 de 101 |
| Móvil A | 0,16 / 3,40 / 4,17 | 0 de 101 |
| Móvil B | 0,16 / 4,19 / 4,69 | 0 de 101 |

Pausas en 0,25 / 0,50 / 0,75: estado estable (mismo hash tras tres fotogramas) en
las cuatro combinaciones.

**El único tramo de diferencia alta es 0,52–0,58.** Se remuestreó a paso 0,0025:
A sube 1,8 → 4,5 y baja a 3,3; B sube 1,7 → 4,46 y baja a 2,1, de forma monótona.
Es la fase más rápida de la contracción, **no un salto de un fotograma**. No se
observó ninguna discontinuidad aislada.

## 5. Recorte real (píxeles y geometría)

| Caso | Vértices fuera (máx) | Centroides fuera | Píxeles en bordes (máx) |
|---|---|---|---|
| Escritorio A | **15 / 12.009** (t≈0,535–0,545) | 0 | abajo 62 |
| Escritorio B | **3 / 12.009** (t≈0,518–0,525) | 0 | abajo 90 |
| Móvil A | 0 | 0 | 0 |
| Móvil B | 0 | 0 | 0 |

Los 15 vértices de A (0,12%) y los 3 de B (0,02%) caen por el borde inferior
durante la dispersión: es el efecto de conservar el marco del autobús, no una
pérdida de identidad; vuelven a entrar y el estado final está contenido. B reduce
los vértices fuera pero su reencuadre baja el conjunto y deja **más píxeles** en
el borde inferior (90 frente a 62): las dos medidas no coinciden y se informan por
separado.

**Limitación:** la caja de contenido y el conteo de bordes no identifican facetas
individuales; solo la geometría (`geometria()`) da el número exacto de vértices
fuera. La cobertura por miniatura cae en la fase de puntos porque el promedio
diluye puntos de 1,3–1,6 px; no debe leerse como desaparición.

## 6. Coste

40 muestras tras 10 dibujos de calentamiento, `requestAnimationFrame`.

| Caso | Mediana | p95 | Intervalo |
|---|---|---|---|
| Escritorio A t=0,5 / 1 | 3,9 / 2,9 ms | 5,9 / 4,1 ms | 16,7 ms |
| Escritorio B t=0,5 / 1 | 3,8 / 2,9 ms | 6,3 / 4,4 ms | 16,7 ms (p95 33,4 en t=1) |
| Móvil A t=0,5 / 1 | 2,3 / 1,8 ms | 4,7 / 2,9 ms | 16,7 ms |
| Móvil B t=0,5 / 1 | 2,1 / 2,0 ms | 2,4 / 3,2 ms | 16,7 ms |

No hay diferencia demostrable entre A y B (dentro del ruido). **No se mide tiempo
de presentación**; 16,7 ms de intervalo no prueba 60 FPS. Un fotograma perdido
(p95 33,4) en B escritorio t=1, sin repetirse.

## 7. Comparación A/B

| Criterio | A | B |
|---|---|---|
| Presencia del autobús al inicio | cumple | cumple (no actúa hasta `u>0`) |
| Continuidad de la dispersión | cumple | cumple |
| Contracción / desplazamiento | sin transformación global | contracción global a `sAlign=0,406`; cambio máx. de caja 16 px/paso frente a 7,7 |
| Claridad de aparición de la ciudad | cumple | cumple; conjunto más compacto en t=0,75 |
| Recorte real | 15 vértices (0,12%), 62 px abajo | 3 vértices (0,02%), 90 px abajo |
| Composición final | idéntica | idéntica |
| Coste | 3,9 / 2,9 ms | 3,8 / 2,9 ms |
| Limitaciones | sin presentación ni hardware | igual |

## 8. Hallazgos visuales (separados de las mediciones)

- `t=0`…`0,25`: autobús reconocible; el desprendimiento empieza sin perder silueta.
- `t=0,5`: el autobús sigue leyéndose; las partículas salen de su propia dispersión.
- `t=0,75`: la ciudad emerge como puntos que forman edificios y ruta. Con B el
  conjunto está más centrado y compacto; con A, más extendido.
- `t=1`: ciudad idéntica en ambas, centrada y contenida.
- En móvil el autobús es pequeño (encuadre del motor en vertical, no del prototipo).
- El HUD se parte en dos líneas en móvil: cosmético.

## 9. Defectos pendientes

1. Recorte de 15/3 vértices por el borde inferior en la fase media: efecto del
   marco, documentado, sin corregir en esta fase.
2. La cobertura por miniatura no sirve como medida de desaparición en la fase de
   puntos; hace falta un conteo a resolución completa si se quiere afirmar algo.
3. Sin medición de presentación ni de hardware físico: la suavidad percibida no
   está demostrada, solo la continuidad de la señal muestreada.

## 10. Recomendación provisional

**No promover B todavía; mantener A como referencia y B como candidata con la
decisión abierta.** En movimiento, las diferencias medias son indistinguibles
(0,47 / 0,47 en escritorio; 0,16 / 0,16 en móvil) y el estado final es idéntico.
B mejora el recorte de vértices (3 frente a 15) pero introduce una contracción
global que aumenta el cambio de caja por paso (16 frente a 7,7 px) y deja más
píxeles en el borde inferior (90 frente a 62). Sin una ventaja clara y sin prueba
de presentación, no se justifica cambiar la referencia.

## 11. Archivos

Creados: `validar-movimiento-cdp.mjs`, `sonda-pico-09c.mjs`, `coste-09c.mjs`,
`cierre-09c.mjs`, `movimiento-09c.json`, `coste-09c.json`,
`capturas/movimiento/{desktop,movil}-{A,B}-vuelta-0.50.png` y este informe.
Modificado: `transicion.js` (solo `geometria()` de medición). Las 20 capturas de
estados de 09B se conservan y se reutilizan.

## 12. Integridad

`artifacts/enrutados-venezuela/` intacto; fases 06–08, `motor.js`, `app.js` y
`scroll.js` con sus hashes de referencia. Todo lo nuevo queda dentro de
`transicion-bus-ciudad/`. Sin commit y sin integración en la landing.
